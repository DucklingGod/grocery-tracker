# Vercel Deployment Setup

## Setting up Environment Variables on Vercel

For the AI Assistant to work on Vercel, you need to add your OpenAI API key as an environment variable.

### Steps:

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/ducklinggod/grocery-tracker

2. **Navigate to Settings**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add the API Key**
   - Variable Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
   - Environment: Check all three (Production, Preview, Development)
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - Or just push a new commit to trigger automatic deployment

### How it Works

- `build.sh` runs during Vercel deployment
- It reads `$OPENAI_API_KEY` from environment variables
- Creates `config.js` with the API key
- All users of your deployed app share this API key
- The API key is never committed to git (protected by .gitignore)

### Security Notes

✅ **Secure**: API key stored in Vercel environment variables
✅ **Not in Git**: config.js is in .gitignore
⚠️ **Client-side**: API key is visible in browser (client-side app limitation)
⚠️ **Shared**: All users use the same API key (monitor usage)

### For Production Use

Consider:
- Setting up API key usage limits in OpenAI dashboard
- Implementing rate limiting on client side
- Using a backend proxy to hide the API key (more secure)
- Monitoring API usage and costs

## Alternative: User Provides Their Own Key

If you prefer users to provide their own API keys:
1. Don't set `OPENAI_API_KEY` in Vercel
2. Users will see the setup screen asking for their key
3. Each user's key is stored in their browser's localStorage
