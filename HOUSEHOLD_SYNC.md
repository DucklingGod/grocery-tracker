# 🏠 Household Sync Feature

## Overview

The Household Sync feature allows multiple people in the same household to share and synchronize their grocery pantry in real-time. All household members will see the same inventory, transactions, and updates instantly.

## How It Works

### Technology
- **WebRTC** for peer-to-peer connections
- **PeerJS** library for simplified WebRTC implementation
- **Public STUN servers** (Google) for NAT traversal
- **Real-time sync** - changes propagate instantly

### Architecture
- One device acts as the **Host** (household creator)
- Other devices **Join** using a 6-character code
- Data syncs peer-to-peer through WebRTC
- Works across different networks (home WiFi, mobile data, etc.)
- No backend server needed - fully decentralized!

## Usage

### Creating a Household

1. Go to **Settings** (Alt+6)
2. Click **"🏠 Create New Household"**
3. You'll get a 6-character code (e.g., `ABC123`)
4. Share this code with household members

### Joining a Household

1. Go to **Settings** (Alt+6)
2. Click **"🔗 Join Existing Household"**
3. Enter the 6-character code
4. Click **"✓ Join"**
5. Your data will sync automatically

### Managing Household

- **View connected devices**: See how many devices are connected
- **Sync Now**: Force immediate synchronization
- **Leave Household**: Disconnect from the household (your data remains local)
- **Copy Code**: Share household code via WhatsApp, Line, etc.

## Features

✅ **Real-time sync** - Changes appear instantly on all devices  
✅ **Works offline** - Sync resumes when back online  
✅ **Cross-network** - Works even if devices are on different WiFi  
✅ **Privacy-focused** - No data stored on servers  
✅ **Auto-reconnect** - Reconnects automatically if disconnected  
✅ **Conflict-free** - Last update wins (simple merge strategy)  

## Synced Data

The following data syncs across all household devices:

- **Week Log**: All Buy/Use/Waste transactions
- **Pantry Inventory**: Current stock levels, thresholds, expiration dates
- **Dashboard Stats**: Automatically recalculated on each device

## Important Notes

### ⚠️ Before Using

1. **Backup your data** - Export JSON backup before connecting to household
2. **Same household** - Only share codes with people you trust
3. **Last update wins** - If two people edit at once, last save wins

### Network Requirements

- Internet connection (for initial connection)
- Works on: Home WiFi, Mobile data, Office network
- Uses STUN servers for NAT traversal

### Privacy & Security

- ✅ Peer-to-peer - no centralized server
- ✅ Data stays between devices only
- ⚠️ Code is not password-protected (share carefully)
- ⚠️ Anyone with code can join household

## Troubleshooting

### Can't Connect to Household

- Check internet connection
- Verify the 6-character code is correct
- Make sure the host device is online and connected
- Try creating a new household

### Devices Not Syncing

- Click **"🔄 Sync Now"** button
- Check if other device shows as connected
- Leave and rejoin the household
- Check browser console for errors (F12)

### Data Conflicts

- If data looks wrong, use **Export/Import** to backup and restore
- Leave household and rejoin to force full sync
- As a last resort, use **Erase All Data** and import backup

## Technical Details

### How Sync Works

1. **Host creates** a peer with ID `household-XXXXXX`
2. **Members connect** to host using peer ID
3. **Changes broadcast** to all connected peers
4. **Auto-sync** every 30 seconds (members only)
5. **Merge strategy**: Remote data overrides local on sync

### Data Flow

```
User adds item → Save to IndexedDB → Broadcast to peers → Peers update their IndexedDB
```

### Supported Actions

- `add-weeklog` - New transaction added
- `update-pantry` - Pantry item updated
- `delete-weeklog` - Transaction deleted
- `sync-request` - Request full data
- `sync-data` - Full data transfer

## Future Enhancements

Possible improvements for future versions:

- 🔒 Password protection for households
- 🕐 Conflict resolution with timestamps
- 📊 Per-user activity tracking
- 💬 Chat between household members
- 🔔 Push notifications for low stock
- 📱 Better mobile app integration

## Deployment on Vercel

The household sync works perfectly on Vercel because:

- Static files only (HTML, JS, CSS)
- No backend required
- Uses public STUN servers
- Peer-to-peer connections

Just deploy and share the URL with your household!

---

**Need Help?** Open browser console (F12) to see connection logs.
