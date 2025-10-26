# Quick Setup Guide - .env Configuration

## ✅ What's Been Set Up

1. **`.env` file** - Contains your API key (already created with your key)
2. **`.env.example`** - Template for other developers
3. **`build-local.ps1`** - PowerShell script to generate config.js from .env
4. **`build.sh`** - Bash script for Vercel deployment
5. **Updated README.md** - Complete documentation

## 🚀 How It Works

### For Local Development:
1. Your `.env` file contains: `OPENAI_API_KEY=your_key`
2. Run `.\build-local.ps1` to generate `config.js`
3. Start your server and the app loads the API key automatically
4. **Both `.env` and `config.js` are gitignored** - never committed!

### For Vercel Deployment:
1. Set `OPENAI_API_KEY` in Vercel Dashboard → Environment Variables
2. During build, `build.sh` runs and creates `config.js` from the env var
3. Deployed app uses the generated `config.js`

## 🔄 Workflow

**Every time you start working:**
```powershell
# Only needed if .env changed or config.js is missing
.\build-local.ps1

# Start your server
npx http-server -p 8000 -c-1 .
```

**Your API key is now:**
- ✅ Stored in `.env` (local only, not committed)
- ✅ Auto-loaded via `config.js` (generated from .env)
- ✅ Secure (both files are in .gitignore)
- ✅ Deployed via Vercel environment variables

## 📝 Files Status

- `.env` - ❌ Not tracked (in .gitignore) - Contains your API key
- `.env.example` - ✅ Tracked - Template without real key
- `config.js` - ❌ Not tracked (in .gitignore) - Auto-generated
- `config.template.js` - ✅ Tracked - Backup method
- `build-local.ps1` - ✅ Tracked - Build script for Windows
- `build.sh` - ✅ Tracked - Build script for Vercel/Linux

## 🎉 Benefits

1. **No manual config editing** - Just update .env
2. **Secure** - API key never committed to GitHub
3. **Easy deployment** - Vercel reads from environment variables
4. **Team friendly** - Other developers copy .env.example
5. **Simple workflow** - Run build script and go!
