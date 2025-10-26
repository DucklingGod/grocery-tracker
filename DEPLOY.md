# 🚀 Deploy to Vercel

## Quick Deploy (2 minutes!)

### Method 1: GitHub + Vercel (Recommended)

1. **Create GitHub Repository**
   ```powershell
   cd c:\Users\iHC\Desktop\grocery_offline_webapp
   git init
   git add .
   git commit -m "Initial commit - Grocery Tracker PWA"
   ```

2. **Push to GitHub**
   - Go to [github.com](https://github.com) and create new repository
   - Follow the commands to push:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/grocery-tracker.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click **"New Project"**
   - **Import** your GitHub repository
   - Click **"Deploy"**
   - Done! 🎉

Your app will be live at: `https://your-project-name.vercel.app`

### Method 2: Vercel CLI (Quick)

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd c:\Users\iHC\Desktop\grocery_offline_webapp
vercel

# Follow prompts:
# - Setup project? Yes
# - Project name? grocery-tracker
# - Directory? ./
# - Deploy? Yes
```

### Method 3: Drag & Drop

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. **Drag and drop** your folder
4. Click **"Deploy"**

## What Gets Deployed

✅ All static files (HTML, CSS, JS)  
✅ PWA manifest and service worker  
✅ Household sync feature (WebRTC)  
✅ Icons and assets  

## After Deployment

### Share Your App

1. Copy your Vercel URL: `https://grocery-tracker.vercel.app`
2. Share with friends/family
3. They can install it as a PWA on their phones!

### Test Household Sync

1. Open app on Device 1 → Create Household
2. Copy the 6-digit code
3. Open same URL on Device 2 → Join Household
4. Make changes on either device → See it sync!

### Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `mygrocery.com`)
3. Follow DNS configuration instructions

## Environment & Settings

No environment variables needed! Everything works client-side.

### Vercel Configuration

The included `vercel.json` configures:
- Static file serving
- Proper routing for PWA
- Cache headers for service worker

### Build Settings

- **Framework Preset**: None (vanilla JS)
- **Build Command**: None required
- **Output Directory**: `.` (root)
- **Install Command**: None required

## Features That Work on Vercel

✅ **Offline Mode** - Service worker caches everything  
✅ **IndexedDB** - Data stored in browser  
✅ **PWA Install** - Add to home screen  
✅ **Household Sync** - Peer-to-peer WebRTC  
✅ **Mobile Responsive** - Works on all devices  

## Monitoring & Analytics

### Add Google Analytics (Optional)

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

### Vercel Analytics

Enable in Vercel dashboard:
1. Go to project **Settings**
2. Click **Analytics**
3. Enable analytics

## Performance

Vercel automatically provides:
- ⚡ Global CDN
- 🗜️ Brotli/Gzip compression
- 🚀 HTTP/2 & HTTP/3
- 📦 Asset optimization
- 🌍 Edge network

Expected performance:
- **Lighthouse Score**: 95+ on all metrics
- **First Load**: < 1 second
- **TTI**: < 2 seconds

## Updating Your App

### Via GitHub (Automatic)

```powershell
git add .
git commit -m "Update features"
git push
```

Vercel auto-deploys on push! ✨

### Via CLI

```powershell
vercel --prod
```

## Troubleshooting

### Deployment Failed

- Check all files are committed
- Ensure `vercel.json` is present
- Try deleting `.vercel` folder and redeploy

### Service Worker Not Updating

- Hard refresh: Ctrl+Shift+R
- Clear cache and reload
- Check cache version in `service-worker.js`

### Household Sync Not Working

- Check browser console (F12)
- Ensure PeerJS CDN is accessible
- Verify STUN servers are reachable
- Try in incognito mode

## Security Considerations

### What's Safe

✅ All data stored locally (IndexedDB)  
✅ Peer-to-peer connections (no server)  
✅ HTTPS enforced by Vercel  
✅ No sensitive data transmitted  

### Best Practices

- Don't share household codes publicly
- Regular backups via Export feature
- Use on trusted devices only
- Clear data when sharing device

## Cost

**Vercel Hobby Plan (FREE):**
- ✅ Unlimited projects
- ✅ Automatic HTTPS
- ✅ 100GB bandwidth/month
- ✅ Perfect for personal use

**Upgrades needed if:**
- 100+ GB bandwidth/month
- Need team collaboration
- Want advanced analytics

## Support

- **Vercel Docs**: https://vercel.com/docs
- **PeerJS Docs**: https://peerjs.com/docs
- **PWA Guide**: https://web.dev/progressive-web-apps/

---

## Quick Reference

```powershell
# First time
npm install -g vercel
vercel login
vercel

# Updates
git push  # if using GitHub
# or
vercel --prod  # direct CLI deploy

# Logs
vercel logs

# Remove deployment
vercel rm PROJECT_NAME
```

**Your app is now live! 🎉**

Share the URL and let others test your awesome grocery tracker!
