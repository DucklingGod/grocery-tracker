Grocery Tracker — Offline (PWA)

Quick start (local development):

1. **Setup API Configuration** (First time only):
   
   Copy the config template and add your API key:
   ```
   copy config.template.js config.js
   ```
   
   Then edit `config.js` and replace `'your-api-key-here'` with your OpenAI API key.
   
   Get your API key from: https://platform.openai.com/api-keys

2. Open PowerShell and change to the project folder:

   cd 'c:\Users\iHC\Desktop\grocery_offline_webapp'

3. Start a simple static server (two options):

   - With Node (recommended if you have Node):
     npx --yes http-server -p 8000 -c-1 .

   - With Python 3 (if Node isn't available):
     python -m http.server 8000 --bind 0.0.0.0

4. Open the app in your browser:

   http://localhost:8000

Notes:
- The app is a Progressive Web App (PWA) and uses IndexedDB for local storage and a Service Worker for offline caching.
- **config.js is NOT committed to git** - it contains your API key and is listed in .gitignore
- All users of the deployed app will share the same API key from config.js
- To stop a server started with the commands above, close the terminal or kill the process (e.g., via Task Manager or `taskkill /PID <pid> /F`).
- If you need me to run the server for a different port or set up an npm dev script, tell me which you prefer and I can add it.

