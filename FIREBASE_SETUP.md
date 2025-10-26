# 🔥 Firebase Setup for Household Sync

## Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `grocery-tracker` (or your choice)
4. Disable Google Analytics (not needed)
5. Click **"Create project"**

### Step 2: Enable Realtime Database

1. In Firebase console, click **"Realtime Database"** in the left menu
2. Click **"Create Database"**
3. Choose location: **United States** (or closest to you)
4. Start in **"Test mode"** (we'll secure it later)
5. Click **"Enable"**

### Step 3: Get Firebase Configuration

1. In Firebase console, click the **gear icon** → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **Web icon** `</>`
4. Enter app nickname: `grocery-tracker-web`
5. **DON'T** check "Also set up Firebase Hosting"
6. Click **"Register app"**
7. **Copy the firebaseConfig object**

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "grocery-tracker-XXXX.firebaseapp.com",
  databaseURL: "https://grocery-tracker-XXXX-default-rtdb.firebaseio.com",
  projectId: "grocery-tracker-XXXX",
  storageBucket: "grocery-tracker-XXXX.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### Step 4: Update Your App

1. Open `index.html` in your code editor
2. Find the `firebaseConfig` section (around line 342)
3. **Replace the dummy config** with your real config from Firebase
4. Save the file

### Step 5: Set Database Rules (Security)

1. In Firebase console, go to **"Realtime Database"** → **"Rules"** tab
2. Replace the rules with:

```json
{
  "rules": {
    "households": {
      "$householdId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

3. Click **"Publish"**

**Note:** These rules allow anyone to read/write. For production, you'd want to add authentication.

### Step 6: Test It!

1. **Commit and push** your changes:
   ```powershell
   git add .
   git commit -m "Switch to Firebase sync"
   git push
   ```

2. **Wait for Vercel to deploy** (1-2 minutes)

3. **Test on Vercel URL:**
   - Device 1: Create Household → Get code
   - Device 2: Join Household → Enter code
   - Add items on either device → See them sync! ✨

## How It Works

### Data Structure in Firebase

```
households/
  ABC123/                    # Household code
    createdAt: timestamp
    createdBy: device-xyz
    devices/
      device-xyz/
        name: "Quick Chef"
        isHost: true
        lastSeen: timestamp
      device-abc/
        name: "Smart Baker"
        isHost: false
        lastSeen: timestamp
    data/
      weeklog/
        1: { date, item, qty, ... }
        2: { date, item, qty, ... }
      pantry/
        "Rice": { item, qty, unit, ... }
        "Chicken": { item, qty, unit, ... }
```

### Features

✅ **Real-time sync** - Changes appear instantly on all devices
✅ **Reliable** - Firebase handles all the networking
✅ **Persistent** - Data stays in cloud even if devices go offline
✅ **Simple** - Just share a 6-digit code
✅ **Free** - Firebase free tier is generous (50K reads, 20K writes per day)

### Advantages over PeerJS

| Feature | Firebase | PeerJS (P2P) |
|---------|----------|--------------|
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Setup | Easy | Complex |
| Works behind firewall | ✅ Yes | ❌ Often blocked |
| Offline resilience | ✅ Yes | ❌ No |
| Device count | Unlimited | Limited |
| Cost | Free (up to limits) | Free |

## Monitoring Usage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **"Realtime Database"** → **"Usage"** tab
4. Monitor:
   - **Simultaneous connections** (free tier: 100)
   - **Data stored** (free tier: 1 GB)
   - **Data downloaded** (free tier: 10 GB/month)

Your grocery tracker will use **very little** data:
- ~1 KB per grocery item
- ~10 KB total for typical household
- ~100 items = 100 KB (0.0001 GB)

**You'll stay well within free tier limits!** 🎉

## Troubleshooting

### "Permission denied" error
- Check database rules allow read/write
- Make sure rules are published

### Changes not syncing
- Check Firebase console → Database → Data tab
- Verify data is being written
- Check browser console for errors

### Slow sync
- Firebase is global but works best in same region
- Check your internet connection

## Security (Optional - For Production)

For better security, enable Firebase Authentication:

1. **Enable Email/Password auth:**
   - Firebase Console → Authentication → Sign-in method
   - Enable Email/Password

2. **Update database rules:**
   ```json
   {
     "rules": {
       "households": {
         "$householdId": {
           ".read": "auth != null",
           ".write": "auth != null"
         }
       }
     }
   }
   ```

3. **Add authentication to app** (requires code changes)

For your personal/family use, the simple rules are fine!

## Alternative: Use Your Own Database

Firebase Realtime Database is owned by Google. If you prefer self-hosting:

1. **Supabase** (PostgreSQL) - Free tier, open source
2. **PocketBase** - Self-hosted, super lightweight
3. **Your own server** with WebSockets

But Firebase is the easiest and most reliable option! 🔥

---

**Need help?** Check the [Firebase documentation](https://firebase.google.com/docs/database) or open an issue on GitHub!
