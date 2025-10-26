# ๐ŸŒ Vercel Deployment Guide - Fix API Key Issue

## โš ๏ธ Problem
API key isn't loading on Vercel because `.env` file is only for local development.

## โœ… Solution: Add Environment Variable in Vercel Dashboard

### ๐Ÿ"ง Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select project: **grocery-tracker**

2. **Open Settings**
   - Click **Settings** tab at the top

3. **Add Environment Variable**
   - Left sidebar โ†' Click **Environment Variables**
   - Click **Add New** button
   - Fill in the form:
     ```
     Key: OPENAI_API_KEY
     Value: <your OpenAI API key from https://platform.openai.com/api-keys>
     ```
   - Select environments: **Production**, **Preview**, **Development** (check all)
   - Click **Save**

4. **Redeploy Your Site**
   - Go to **Deployments** tab
   - Find latest deployment
   - Click **โ‹ฎ** (three dots menu)
   - Click **Redeploy**
   - Wait 30-60 seconds for deployment

5. **Test It!**
   - Open your Vercel URL in **incognito/private mode**
   - Click **AI Assistant** tab
   - Should see greeting message automatically
   - No API key input needed! โœ…

## ๐Ÿ"Š How It Works

**Local (your computer):**
- `.env` file โ†' `build-local.ps1` โ†' creates `config.js`

**Vercel (cloud):**
- Environment variable in dashboard โ†' `build.sh` runs โ†' creates `config.js`

## ๐Ÿ› ๏ธ If It Still Doesn't Work

1. **Check if environment variable was saved:**
   - Vercel Dashboard โ†' Settings โ†' Environment Variables
   - Should see `OPENAI_API_KEY` listed

2. **View build logs:**
   - Deployments โ†' Click on latest deployment
   - Scroll to "Build Logs"
   - Look for "โœ… Using OPENAI_API_KEY from environment"

3. **Test config.js directly:**
   - Visit: `https://your-app-url.vercel.app/config.js`
   - Should see JavaScript with OPENAI_API_KEY defined
   - If 404 error, build script didn't run

4. **Clear cache:**
   - Use incognito/private mode
   - Or hard refresh: `Ctrl + Shift + R`

5. **Check browser console:**
   - Press `F12`
   - Look for "โœ… Config loaded" message
   - Should show `hasAPIKey: true`

## ๐Ÿ"' Security

- โœ… Environment variables are encrypted by Vercel
- โœ… Never committed to GitHub
- โœ… Only visible to project owner/collaborators
- โš ๏ธ All users share the same API key (standard for client-side apps)

## ๐Ÿ"ฑ Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **OpenAI API Keys**: https://platform.openai.com/api-keys
- **Project Repository**: https://github.com/DucklingGod/grocery-tracker
