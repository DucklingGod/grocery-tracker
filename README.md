# Grocery Tracker — Offline PWA with AI AssistantGrocery Tracker — Offline (PWA)



A Progressive Web App for tracking groceries, pantry inventory, and food waste with AI-powered recipe suggestions.Quick start (local development):



## 🚀 Quick Start (Local Development)1. **Setup API Configuration** (First time only):

   

### 1. Setup API Configuration (First time only)   Copy the config template and add your API key:

   ```

**Option A: Using .env file (Recommended)**   copy config.template.js config.js

   ```

1. Copy the environment template:   

   ```powershell   Then edit `config.js` and replace `'your-api-key-here'` with your OpenAI API key.

   Copy-Item .env.example .env   

   ```   Get your API key from: https://platform.openai.com/api-keys



2. Edit `.env` and add your OpenAI API key:2. Open PowerShell and change to the project folder:

   ```

   OPENAI_API_KEY=your_actual_api_key_here   cd 'c:\Users\iHC\Desktop\grocery_offline_webapp'

   ```

3. Start a simple static server (two options):

3. Generate config.js from .env:

   ```powershell   - With Node (recommended if you have Node):

   .\build-local.ps1     npx --yes http-server -p 8000 -c-1 .

   ```

   - With Python 3 (if Node isn't available):

**Option B: Manual config.js**     python -m http.server 8000 --bind 0.0.0.0



1. Copy the config template:4. Open the app in your browser:

   ```powershell

   Copy-Item config.template.js config.js   http://localhost:8000

   ```

Notes:

2. Edit `config.js` and replace `'your-api-key-here'` with your OpenAI API key.- The app is a Progressive Web App (PWA) and uses IndexedDB for local storage and a Service Worker for offline caching.

- **config.js is NOT committed to git** - it contains your API key and is listed in .gitignore

**Get your API key from:** https://platform.openai.com/api-keys- All users of the deployed app will share the same API key from config.js

- To stop a server started with the commands above, close the terminal or kill the process (e.g., via Task Manager or `taskkill /PID <pid> /F`).

### 2. Start Local Server- If you need me to run the server for a different port or set up an npm dev script, tell me which you prefer and I can add it.



Open PowerShell in the project folder:

```powershell
cd 'c:\Users\iHC\Desktop\grocery_offline_webapp'
```

Start a simple static server:

**With Node (recommended):**
```powershell
npx --yes http-server -p 8000 -c-1 .
```

**With Python 3:**
```powershell
python -m http.server 8000 --bind 0.0.0.0
```

### 3. Open the App

Navigate to: http://localhost:8000

## 🌐 Deploying to Vercel

1. Push your code to GitHub (`.env` is automatically ignored)

2. In Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add: `OPENAI_API_KEY` with your API key value
   - Save and redeploy

3. The `build.sh` script will automatically generate `config.js` during deployment

## 📝 Notes

- **Security**: `.env` and `config.js` are NOT committed to git (listed in `.gitignore`)
- **PWA Features**: Uses IndexedDB for storage and Service Worker for offline caching
- **Shared API Key**: All users of the deployed app share the same API key from environment variables
- **AI Model**: Currently using OpenAI's `gpt-4o-mini` model
- To stop the server, close the terminal or use Task Manager

## 🤖 AI Assistant Features

- **Recipe Ideas**: Get cooking suggestions based on your pantry inventory
- **Shopping Lists**: Generate shopping lists from inventory needs
- **Meal Planning**: Plan meals for the week
- **Reduce Waste**: Get tips on using items before they expire
- **Smart Context**: AI has access to your pantry, purchase history, and waste log

## 🔧 Troubleshooting

- If changes don't appear, clear browser cache or use incognito mode
- Service Worker caches aggressively - bump version in `service-worker.js` if needed
- Run `.\build-local.ps1` after updating `.env` file
