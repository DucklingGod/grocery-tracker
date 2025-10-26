// Firebase-based Household Sync
// Much more reliable than P2P WebRTC

// Helper function for IndexedDB transactions with callback pattern
function tx(storeName, mode, callback) {
  return new Promise((resolve, reject) => {
    try {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const result = callback(store);
      
      if (result && result.then) {
        // If callback returns a promise, wait for it
        result.then(resolve).catch(reject);
      } else {
        // Otherwise just resolve
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
      }
    } catch (err) {
      reject(err);
    }
  });
}

class FirebaseHouseholdSync {
  constructor() {
    this.db = null;
    this.householdRef = null;
    this.householdCode = localStorage.getItem('householdCode') || null;
    this.deviceId = localStorage.getItem('deviceId') || this.generateDeviceId();
    this.deviceName = localStorage.getItem('deviceName') || this.generateDeviceName();
    this.isHost = false;
    this.unsubscribe = null;
    this.isUpdating = false; // Flag to prevent processing our own updates
    
    localStorage.setItem('deviceId', this.deviceId);
    localStorage.setItem('deviceName', this.deviceName);
  }
  
  generateDeviceId() {
    return 'device-' + Math.random().toString(36).substr(2, 9);
  }
  
  generateDeviceName() {
    const adjectives = ['Quick', 'Smart', 'Happy', 'Cool', 'Fresh', 'Bright'];
    const nouns = ['Chef', 'Cook', 'Baker', 'Shopper', 'Helper', 'Planner'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  }
  
  generateHouseholdCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  
  async initialize() {
    console.log('🔥 Initializing Firebase...');
    
    // Firebase will be loaded from CDN in index.html
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase not loaded');
      return;
    }
    
    // Initialize Firebase (already done in HTML)
    this.db = firebase.database();
    console.log('✅ Firebase initialized');
    
    // If we have a saved household, reconnect to it
    if (this.householdCode) {
      const isHost = localStorage.getItem('isHost') === 'true';
      console.log('🔄 Reconnecting to household:', this.householdCode, isHost ? '(Host)' : '(Member)');
      
      this.householdRef = this.db.ref('households/' + this.householdCode);
      this.isHost = isHost;
      
      // Check if household still exists
      try {
        const snapshot = await this.householdRef.once('value');
        if (snapshot.exists()) {
          // Rejoin the household
          await this.householdRef.child('devices/' + this.deviceId).set({
            name: this.deviceName,
            isHost: isHost,
            lastSeen: Date.now()
          });
          
          // Download existing household data BEFORE starting listeners
          const householdData = snapshot.val();
          if (householdData.data) {
            console.log('📥 Downloading existing household data...');
            await this.mergeData(householdData.data);
          }
          
          // Start listening for changes
          this.startListening();
          this.startPresenceUpdates();
          
          console.log('✅ Reconnected to household');
          showToast('🔄 Reconnected to household', 'success');
        } else {
          // Household no longer exists
          console.warn('⚠️ Household no longer exists, clearing...');
          this.householdCode = null;
          localStorage.removeItem('householdCode');
          localStorage.removeItem('isHost');
        }
      } catch (err) {
        console.error('❌ Failed to reconnect:', err);
      }
    }
    
    this.updateUI();
  }
  
  async createHousehold() {
    try {
      const code = this.generateHouseholdCode();
      this.householdCode = code;
      this.isHost = true;
      
      console.log('🏠 Creating household with code:', code);
      
      this.householdRef = this.db.ref('households/' + code);
      
      // Set initial household data
      await this.householdRef.set({
        createdAt: Date.now(),
        createdBy: this.deviceId,
        devices: {
          [this.deviceId]: {
            name: this.deviceName,
            isHost: true,
            lastSeen: Date.now()
          }
        }
      });
      
      // Upload current local data
      const localData = await this.getLocalData();
      await this.householdRef.child('data').set(localData);
      
      localStorage.setItem('householdCode', code);
      localStorage.setItem('isHost', 'true');
      
      // Listen for changes
      this.startListening();
      
      this.updateUI();
      showToast(`🏠 Household created! Code: ${code}`, 'success');
      console.log('✅ Household created successfully');
      
      // Update presence every 30 seconds
      this.startPresenceUpdates();
      
    } catch (err) {
      console.error('❌ Failed to create household:', err);
      showToast('❌ Failed to create household: ' + err.message, 'error');
    }
  }
  
  async joinHousehold(code) {
    try {
      this.householdCode = code;
      this.isHost = false;
      
      console.log('🤝 Joining household:', code);
      
      this.householdRef = this.db.ref('households/' + code);
      
      // Check if household exists
      const snapshot = await this.householdRef.once('value');
      if (!snapshot.exists()) {
        throw new Error('Household not found');
      }
      
      // Add ourselves to devices list
      await this.householdRef.child('devices/' + this.deviceId).set({
        name: this.deviceName,
        isHost: false,
        lastSeen: Date.now()
      });
      
      // Download household data
      const householdData = snapshot.val();
      if (householdData.data) {
        await this.mergeData(householdData.data);
      }
      
      localStorage.setItem('householdCode', code);
      localStorage.setItem('isHost', 'false');
      
      // Listen for changes
      this.startListening();
      
      this.updateUI();
      showToast('✓ Joined household!', 'success');
      console.log('✅ Joined household successfully');
      
      // Update presence every 30 seconds
      this.startPresenceUpdates();
      
    } catch (err) {
      console.error('❌ Failed to join household:', err);
      showToast('❌ Failed to join: ' + err.message, 'error');
    }
  }
  
  startListening() {
    if (!this.householdRef) return;
    
    console.log('👂 Listening for household changes...');
    
    let weeklogInitialized = false;
    let pantryInitialized = false;
    
    // Listen to weeklog changes
    this.householdRef.child('data/weeklog').on('child_added', async (snapshot) => {
      console.log('📥 Weeklog item added:', snapshot.key);
      const item = snapshot.val();
      await tx('weeklog', 'readwrite', store => {
        store.put(item);
      });
      
      // Only render after initial load is complete
      if (weeklogInitialized && !this.isUpdating) {
        console.log('🔄 Rendering all views after weeklog update');
        await renderDashboard();
        await renderWeekLog();
        await renderPantry();
      }
    });
    
    this.householdRef.child('data/weeklog').on('child_changed', async (snapshot) => {
      console.log('📥 Weeklog item changed:', snapshot.key);
      const item = snapshot.val();
      await tx('weeklog', 'readwrite', store => {
        store.put(item);
      });
      
      if (!this.isUpdating) {
        console.log('🔄 Rendering all views after weeklog change');
        await renderDashboard();
        await renderWeekLog();
      }
    });
    
    this.householdRef.child('data/weeklog').on('child_removed', async (snapshot) => {
      console.log('📥 Weeklog item removed:', snapshot.key);
      await tx('weeklog', 'readwrite', store => {
        store.delete(Number(snapshot.key));
      });
      
      if (!this.isUpdating) {
        console.log('🔄 Rendering all views after weeklog removal');
        await renderDashboard();
        await renderWeekLog();
      }
    });
    
    // Mark weeklog as initialized after first data load
    this.householdRef.child('data/weeklog').once('value', async () => {
      weeklogInitialized = true;
      console.log('✅ Weeklog initial load complete, rendering all views...');
      await renderDashboard();
      await renderWeekLog();
      await renderPantry();
      await renderWaste();
      console.log('✅ All views rendered after weeklog init');
    });
    
    // Listen to pantry changes
    this.householdRef.child('data/pantry').on('child_added', async (snapshot) => {
      console.log('📥 Pantry item added:', snapshot.key);
      await putPantry(snapshot.val());
      
      if (pantryInitialized && !this.isUpdating) {
        console.log('🔄 Rendering dashboard after pantry update');
        renderDashboard();
      }
    });
    
    this.householdRef.child('data/pantry').on('child_changed', async (snapshot) => {
      console.log('📥 Pantry item changed:', snapshot.key);
      await putPantry(snapshot.val());
      
      if (!this.isUpdating) {
        console.log('🔄 Rendering dashboard after pantry change');
        renderDashboard();
      }
    });
    
    // Mark pantry as initialized after first data load
    this.householdRef.child('data/pantry').once('value', async () => {
      pantryInitialized = true;
      console.log('✅ Pantry initial load complete, rendering all views...');
      await renderDashboard();
      await renderWeekLog();
      await renderPantry();
      await renderWaste();
      console.log('✅ All views rendered after pantry init');
    });
    
    // Listen to device changes
    this.householdRef.child('devices').on('value', (snapshot) => {
      console.log('👥 Devices list updated');
      this.updateUI();
    });
  }
  
  startPresenceUpdates() {
    // Update presence every 30 seconds
    setInterval(async () => {
      if (this.householdRef && this.householdCode) {
        try {
          await this.householdRef.child('devices/' + this.deviceId + '/lastSeen').set(Date.now());
        } catch (err) {
          console.error('Failed to update presence:', err);
        }
      }
    }, 30000);
  }
  
  async broadcastUpdate(update) {
    if (!this.householdRef) return;
    
    console.log('📤 Broadcasting update:', update.action, update.data);
    
    try {
      // Set flag to prevent processing our own update
      this.isUpdating = true;
      
      // Update specific data based on action
      if (update.action === 'add-weeklog') {
        await this.householdRef.child('data/weeklog/' + update.data.id).set(update.data);
        console.log('✅ Weeklog added to Firebase:', update.data.id);
      } else if (update.action === 'delete-weeklog') {
        await this.householdRef.child('data/weeklog/' + update.data.id).remove();
        console.log('✅ Weeklog deleted from Firebase:', update.data.id);
      } else if (update.action === 'update-pantry') {
        await this.householdRef.child('data/pantry/' + update.data.item).set(update.data);
        console.log('✅ Pantry updated in Firebase:', update.data.item);
      }
      
      // Reset flag after a short delay
      setTimeout(() => {
        this.isUpdating = false;
      }, 500);
      
      console.log('✅ Update broadcasted successfully');
    } catch (err) {
      console.error('❌ Failed to broadcast update:', err);
      this.isUpdating = false;
    }
  }
  
  async getLocalData() {
    const weeklog = await getAll('weeklog');
    const pantry = await getAll('pantry');
    
    // Convert arrays to objects with IDs as keys
    const weeklogObj = {};
    weeklog.forEach(item => {
      weeklogObj[item.id] = item;
    });
    
    const pantryObj = {};
    pantry.forEach(item => {
      pantryObj[item.item] = item;
    });
    
    return { weeklog: weeklogObj, pantry: pantryObj };
  }
  
  async mergeData(remoteData) {
    console.log('🔄 Merging remote data with local...', {
      weeklogCount: remoteData.weeklog ? Object.keys(remoteData.weeklog).length : 0,
      pantryCount: remoteData.pantry ? Object.keys(remoteData.pantry).length : 0
    });
    
    try {
      // Merge weeklog
      if (remoteData.weeklog) {
        const weeklogEntries = Object.values(remoteData.weeklog);
        console.log(`📥 Merging ${weeklogEntries.length} weeklog entries...`);
        
        for (const entry of weeklogEntries) {
          try {
            // Always use put() which will add OR update
            await tx('weeklog', 'readwrite', store => {
              return new Promise((resolve, reject) => {
                const request = store.put(entry);
                request.onsuccess = () => {
                  console.log(`✅ Weeklog entry ${entry.id} saved successfully`);
                  resolve(request.result);
                };
                request.onerror = (e) => {
                  console.error(`❌ Failed to save weeklog ${entry.id}:`, e.target.error);
                  reject(e.target.error);
                };
              });
            });
          } catch (err) {
            console.error(`❌ Error processing weeklog entry ${entry.id}:`, err);
          }
        }
        
        // Verify the data was actually saved
        const savedCount = await tx('weeklog', 'readonly', store => {
          return new Promise((resolve) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(0);
          });
        });
        console.log(`✅ Weeklog merged - ${savedCount} entries in IndexedDB`);
      }
      
      // Merge pantry
      if (remoteData.pantry) {
        const pantryEntries = Object.values(remoteData.pantry);
        console.log(`📥 Merging ${pantryEntries.length} pantry entries...`);
        for (const entry of pantryEntries) {
          await putPantry(entry);
        }
        console.log('✅ Pantry merged');
      }
      
      console.log('✅ Data merged successfully, rendering all views...');
      await renderDashboard();
      await renderWeekLog();
      await renderPantry();
      await renderWaste();
      console.log('✅ All views rendered after merge');
    } catch (err) {
      console.error('❌ Failed to merge data:', err);
    }
  }
  
  async syncNow() {
    if (!this.householdRef) {
      showToast('⚠️ Not connected to household', 'warning');
      return;
    }
    
    try {
      console.log('🔄 Manual sync started...');
      showToast('⏳ Syncing...', 'info');
      
      // First, download remote data
      console.log('📥 Downloading remote data...');
      const snapshot = await this.householdRef.child('data').once('value');
      const remoteData = snapshot.val();
      
      if (remoteData) {
        await this.mergeData(remoteData);
      }
      
      // Then, upload local data (merge with remote)
      console.log('📤 Uploading local data...');
      const localData = await this.getLocalData();
      
      // Merge local with remote instead of replacing
      if (remoteData && remoteData.weeklog) {
        localData.weeklog = { ...remoteData.weeklog, ...localData.weeklog };
      }
      if (remoteData && remoteData.pantry) {
        localData.pantry = { ...remoteData.pantry, ...localData.pantry };
      }
      
      await this.householdRef.child('data').set(localData);
      
      showToast('✓ Sync complete!', 'success');
      console.log('✅ Manual sync completed');
    } catch (err) {
      console.error('❌ Sync failed:', err);
      showToast('❌ Sync failed: ' + err.message, 'error');
    }
  }
  
  async disconnect() {
    if (this.householdRef) {
      // Remove device from list
      try {
        await this.householdRef.child('devices/' + this.deviceId).remove();
      } catch (err) {
        console.error('Failed to remove device:', err);
      }
      
      // Stop listening
      this.householdRef.off();
      this.householdRef = null;
    }
    
    this.householdCode = null;
    this.isHost = false;
    localStorage.removeItem('householdCode');
    localStorage.removeItem('isHost');
    this.updateUI();
    showToast('✓ Left household', 'info');
  }
  
  isConnected() {
    return this.householdCode !== null && this.householdRef !== null;
  }
  
  async updateUI() {
    const isConnected = this.isConnected();
    
    const notConnectedEl = document.getElementById('householdNotConnected');
    const connectedEl = document.getElementById('householdConnected');
    
    if (!notConnectedEl || !connectedEl) return;
    
    notConnectedEl.style.display = isConnected ? 'none' : 'block';
    connectedEl.style.display = isConnected ? 'block' : 'none';
    
    if (isConnected) {
      document.getElementById('householdCode').textContent = this.householdCode;
      document.getElementById('syncStatus').textContent = '● Connected';
      document.getElementById('syncStatus').style.color = '#10b981';
      
      // Get device count from Firebase
      if (this.householdRef) {
        try {
          const snapshot = await this.householdRef.child('devices').once('value');
          const devices = snapshot.val() || {};
          const deviceList = Object.entries(devices).map(([id, info]) => {
            const isYou = id === this.deviceId;
            const isHost = info.isHost;
            let label = info.name;
            if (isHost) label += ' (Host';
            if (isYou) label += isHost ? ', You)' : ' (You)';
            else if (isHost) label += ')';
            return label;
          });
          
          document.getElementById('deviceCount').textContent = deviceList.length;
          document.getElementById('deviceList').textContent = deviceList.join(' • ');
        } catch (err) {
          console.error('Failed to get devices:', err);
        }
      }
    }
  }
}

// Global instance
let householdSync = null;

// Initialize on app load
async function initHouseholdSync() {
  householdSync = new FirebaseHouseholdSync();
  await householdSync.initialize();
  
  // Setup UI handlers
  document.getElementById('btnCreateHousehold').addEventListener('click', async () => {
    if (householdSync.isConnected()) {
      showToast('⚠️ Already connected to a household', 'warning');
      return;
    }
    await householdSync.createHousehold();
  });
  
  document.getElementById('btnJoinHousehold').addEventListener('click', () => {
    document.getElementById('joinDialog').style.display = 'block';
    document.getElementById('joinCode').focus();
  });
  
  document.getElementById('btnConfirmJoin').addEventListener('click', async () => {
    const code = document.getElementById('joinCode').value.trim().toUpperCase();
    if (code.length === 6) {
      await householdSync.joinHousehold(code);
      document.getElementById('joinDialog').style.display = 'none';
      document.getElementById('joinCode').value = '';
    } else {
      showToast('❌ Please enter a valid 6-character code', 'error');
    }
  });
  
  document.getElementById('btnCancelJoin').addEventListener('click', () => {
    document.getElementById('joinDialog').style.display = 'none';
    document.getElementById('joinCode').value = '';
  });
  
  document.getElementById('btnLeaveHousehold').addEventListener('click', () => {
    if (confirm('Are you sure you want to leave this household?\n\nYour data will remain on this device, but you will no longer sync with others.')) {
      householdSync.disconnect();
    }
  });
  
  document.getElementById('btnSyncNow').addEventListener('click', async () => {
    await householdSync.syncNow();
  });
  
  document.getElementById('btnCopyCode').addEventListener('click', () => {
    const code = document.getElementById('householdCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
      showToast('✓ Code copied to clipboard!', 'success');
    });
  });
}

// Hook into data changes to broadcast updates
function notifyHouseholdUpdate(action, data) {
  if (householdSync && householdSync.isConnected()) {
    householdSync.broadcastUpdate({ action, data });
  }
}
