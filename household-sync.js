// Household Sync - Peer-to-Peer Data Synchronization
// Uses PeerJS for WebRTC connections (works across networks via relay server)

class HouseholdSync {
  constructor() {
    this.peer = null;
    this.connections = new Map(); // peerId -> connection
    this.deviceNames = new Map(); // peerId -> device name
    this.householdCode = localStorage.getItem('householdCode') || null;
    this.deviceId = localStorage.getItem('deviceId') || this.generateDeviceId();
    this.deviceName = localStorage.getItem('deviceName') || this.generateDeviceName();
    this.isHost = false;
    this.syncCallbacks = [];
    this.lastSyncTime = 0;
    
    // Store device ID and name
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
    // Generate 6-character alphanumeric code
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  
  async initialize() {
    // Load PeerJS from CDN
    if (typeof Peer === 'undefined') {
      await this.loadPeerJS();
    }
    
    // If we have a saved household code, try to reconnect
    if (this.householdCode) {
      const isHost = localStorage.getItem('isHost') === 'true';
      if (isHost) {
        await this.createHousehold(this.householdCode);
      } else {
        await this.joinHousehold(this.householdCode);
      }
    }
  }
  
  loadPeerJS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.2/dist/peerjs.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  async createHousehold(customCode = null) {
    try {
      const code = customCode || this.generateHouseholdCode();
      this.householdCode = code;
      this.isHost = true;
      
      // Create peer with household code as ID
      this.peer = new Peer('household-' + code, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });
      
      this.peer.on('open', (id) => {
        console.log('Household created:', code);
        localStorage.setItem('householdCode', code);
        localStorage.setItem('isHost', 'true');
        this.updateUI();
        showToast(`🏠 Household created! Code: ${code}`, 'success');
      });
      
      this.peer.on('connection', (conn) => {
        this.handleConnection(conn);
      });
      
      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        if (err.type === 'unavailable-id') {
          showToast('❌ Household code already in use', 'error');
          this.disconnect();
        }
      });
      
    } catch (err) {
      console.error('Failed to create household:', err);
      showToast('❌ Failed to create household', 'error');
    }
  }
  
  async joinHousehold(code) {
    try {
      this.householdCode = code;
      this.isHost = false;
      
      // Create peer with unique device ID
      this.peer = new Peer(this.deviceId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });
      
      this.peer.on('open', (id) => {
        console.log('Connecting to household:', code);
        
        // Connect to host
        const conn = this.peer.connect('household-' + code, {
          reliable: true,
          serialization: 'json'
        });
        
        conn.on('open', () => {
          console.log('Connected to household!');
          localStorage.setItem('householdCode', code);
          localStorage.setItem('isHost', 'false');
          this.handleConnection(conn);
          this.updateUI();
          showToast(`✓ Joined household: ${code}`, 'success');
          
          // Request initial sync
          this.requestSync();
        });
        
        conn.on('error', (err) => {
          console.error('Connection error:', err);
          showToast('❌ Failed to connect to household', 'error');
        });
      });
      
      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        showToast('❌ Connection failed. Check the code and try again.', 'error');
      });
      
    } catch (err) {
      console.error('Failed to join household:', err);
      showToast('❌ Failed to join household', 'error');
    }
  }
  
  handleConnection(conn) {
    console.log('New connection:', conn.peer);
    this.connections.set(conn.peer, conn);
    
    conn.on('data', async (data) => {
      await this.handleMessage(data, conn);
    });
    
    conn.on('open', () => {
      console.log('Connection opened:', conn.peer);
      // Send hello message with device name
      conn.send({
        type: 'hello',
        deviceId: this.deviceId,
        deviceName: this.deviceName,
        isHost: this.isHost
      });
      this.updateUI();
    });
    
    conn.on('close', () => {
      console.log('Connection closed:', conn.peer);
      this.connections.delete(conn.peer);
      this.deviceNames.delete(conn.peer);
      this.updateUI();
    });
    
    conn.on('error', (err) => {
      console.error('Connection error:', err);
      this.connections.delete(conn.peer);
      this.deviceNames.delete(conn.peer);
      this.updateUI();
    });
    
    this.updateUI();
  }
  
  async handleMessage(data, conn) {
    console.log('Received message:', data.type);
    
    switch (data.type) {
      case 'hello':
        // Store device info
        this.deviceNames.set(conn.peer, data.deviceName || 'Unknown Device');
        this.updateUI();
        
        // Send hello back
        conn.send({
          type: 'hello',
          deviceId: this.deviceId,
          deviceName: this.deviceName,
          isHost: this.isHost
        });
        
        // If we're host, send full data
        if (this.isHost) {
          const fullData = await this.getLocalData();
          conn.send({
            type: 'sync-data',
            data: fullData,
            timestamp: Date.now()
          });
        }
        break;
      
      case 'sync-request':
        // Send full data to requester
        const fullData = await this.getLocalData();
        conn.send({
          type: 'sync-data',
          data: fullData,
          timestamp: Date.now()
        });
        break;
        
      case 'sync-data':
        // Merge received data with local
        await this.mergeData(data.data);
        showToast('✓ Synced with household', 'success');
        break;
        
      case 'update':
        // Apply single update (skip if from ourselves)
        if (data.deviceId !== this.deviceId) {
          await this.applyUpdate(data.update);
          showToast('📥 Update received from household', 'info');
        }
        break;
        
      case 'ping':
        conn.send({ 
          type: 'pong', 
          deviceId: this.deviceId,
          deviceName: this.deviceName
        });
        break;
        
      case 'pong':
        // Store device info from pong
        if (data.deviceName) {
          this.deviceNames.set(conn.peer, data.deviceName);
          this.updateUI();
        }
        break;
    }
  }
  
  async getLocalData() {
    const weeklog = await getAll('weeklog');
    const pantry = await getAll('pantry');
    return { weeklog, pantry };
  }
  
  async mergeData(remoteData) {
    // Simple merge: remote wins if newer
    // In production, you'd want conflict resolution
    
    if (remoteData.weeklog) {
      const store = tx('weeklog', 'readwrite');
      for (const item of remoteData.weeklog) {
        await new Promise((resolve, reject) => {
          const req = store.put(item);
          req.onsuccess = resolve;
          req.onerror = () => reject(req.error);
        });
      }
    }
    
    if (remoteData.pantry) {
      for (const item of remoteData.pantry) {
        await putPantry(item);
      }
    }
    
    // Refresh all views
    renderDashboard();
    renderWeekLog();
    renderPantry();
    renderWaste();
  }
  
  async applyUpdate(update) {
    // Apply a single update (add, modify, delete)
    try {
      switch (update.action) {
        case 'add-weeklog':
          const store = tx('weeklog', 'readwrite');
          // Remove id if it exists to avoid conflicts
          const dataToAdd = {...update.data};
          delete dataToAdd.id;
          await new Promise((resolve, reject) => {
            const req = store.add(dataToAdd);
            req.onsuccess = resolve;
            req.onerror = () => reject(req.error);
          });
          break;
          
        case 'update-pantry':
          await putPantry(update.data);
          break;
          
        case 'delete-weeklog':
          await deleteWeekLog(update.id || update.data?.id);
          break;
      }
      
      // Refresh views
      renderDashboard();
      renderWeekLog();
      renderPantry();
      renderWaste();
    } catch (err) {
      console.error('Error applying update:', err);
      // Continue even if error - maybe item already exists
    }
  }
  
  broadcastUpdate(update) {
    // Send update to all connected devices
    const message = {
      type: 'update',
      update: update,
      timestamp: Date.now(),
      deviceId: this.deviceId
    };
    
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }
  
  requestSync() {
    // Request full sync from household
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send({ type: 'sync-request', deviceId: this.deviceId });
      }
    });
  }
  
  async syncNow() {
    if (this.isHost) {
      // Host broadcasts to all
      const data = await this.getLocalData();
      this.connections.forEach((conn) => {
        if (conn.open) {
          conn.send({
            type: 'sync-data',
            data: data,
            timestamp: Date.now()
          });
        }
      });
      showToast('✓ Data broadcast to all devices', 'success');
    } else {
      // Member requests from host
      this.requestSync();
    }
  }
  
  disconnect() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.connections.clear();
    this.householdCode = null;
    this.isHost = false;
    localStorage.removeItem('householdCode');
    localStorage.removeItem('isHost');
    this.updateUI();
    showToast('✓ Left household', 'info');
  }
  
  updateUI() {
    const isConnected = this.householdCode !== null && this.peer !== null;
    
    document.getElementById('householdNotConnected').style.display = isConnected ? 'none' : 'block';
    document.getElementById('householdConnected').style.display = isConnected ? 'block' : 'none';
    
    if (isConnected) {
      document.getElementById('householdCode').textContent = this.householdCode;
      document.getElementById('deviceCount').textContent = (this.connections.size + 1).toString();
      
      const status = this.peer && this.peer.open ? '● Connected' : '○ Connecting...';
      const color = this.peer && this.peer.open ? '#10b981' : '#f59e0b';
      document.getElementById('syncStatus').textContent = status;
      document.getElementById('syncStatus').style.color = color;
      
      // Update device list with names
      const deviceList = document.getElementById('deviceList');
      const devices = [this.deviceName + (this.isHost ? ' (Host - You)' : ' (You)')];
      
      this.connections.forEach((conn, peerId) => {
        if (conn.open) {
          const deviceName = this.deviceNames.get(peerId) || 'Unknown Device';
          devices.push(deviceName);
        }
      });
      
      deviceList.textContent = devices.join(' • ');
    }
  }
  
  isConnected() {
    return this.householdCode !== null && this.peer !== null && this.peer.open;
  }
}

// Global instance
let householdSync = null;

// Initialize on app load
async function initHouseholdSync() {
  householdSync = new HouseholdSync();
  await householdSync.initialize();
  
  // Setup UI handlers
  document.getElementById('btnCreateHousehold').addEventListener('click', async () => {
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
  
  // Auto-sync every 30 seconds
  setInterval(() => {
    if (householdSync && householdSync.isConnected() && !householdSync.isHost) {
      householdSync.requestSync();
    }
  }, 30000);
}

// Hook into data changes to broadcast updates
function notifyHouseholdUpdate(action, data) {
  if (householdSync && householdSync.isConnected()) {
    householdSync.broadcastUpdate({ action, data });
  }
}
