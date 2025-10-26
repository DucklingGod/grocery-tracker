// Firebase-based Household Sync
// Much more reliable than P2P WebRTC

class FirebaseHouseholdSync {
  constructor() {
    this.db = null;
    this.householdRef = null;
    this.householdCode = localStorage.getItem('householdCode') || null;
    this.deviceId = localStorage.getItem('deviceId') || this.generateDeviceId();
    this.deviceName = localStorage.getItem('deviceName') || this.generateDeviceName();
    this.isHost = false;
    this.unsubscribe = null;
    
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
    
    // Listen to data changes
    this.householdRef.child('data').on('value', async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log('📥 Received household data update');
        await this.mergeData(data);
        renderDashboard();
      }
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
    
    console.log('📤 Broadcasting update:', update.action);
    
    try {
      // Update specific data based on action
      if (update.action === 'add-weeklog') {
        await this.householdRef.child('data/weeklog/' + update.data.id).set(update.data);
      } else if (update.action === 'delete-weeklog') {
        await this.householdRef.child('data/weeklog/' + update.data.id).remove();
      } else if (update.action === 'update-pantry') {
        await this.householdRef.child('data/pantry/' + update.data.item).set(update.data);
      }
      
      console.log('✅ Update broadcasted');
    } catch (err) {
      console.error('❌ Failed to broadcast update:', err);
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
    console.log('🔄 Merging remote data with local...');
    
    try {
      // Merge weeklog
      if (remoteData.weeklog) {
        const weeklogEntries = Object.values(remoteData.weeklog);
        for (const entry of weeklogEntries) {
          await tx('weeklog', 'readwrite', store => {
            store.put(entry);
          });
        }
      }
      
      // Merge pantry
      if (remoteData.pantry) {
        const pantryEntries = Object.values(remoteData.pantry);
        for (const entry of pantryEntries) {
          await putPantry(entry);
        }
      }
      
      console.log('✅ Data merged successfully');
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
      
      // Upload local data
      const localData = await this.getLocalData();
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
