// Configuration Template
// Copy this file to 'config.js' and add your API keys

window.APP_CONFIG = {
  // OpenAI API Key - Get from https://platform.openai.com/api-keys
  OPENAI_API_KEY: 'your-api-key-here',
  
  // AI Model Configuration
  AI_MODEL: 'gpt-5-mini',
  AI_REASONING_EFFORT: 'low',    // Options: 'minimal', 'low', 'medium', 'high'
  AI_VERBOSITY: 'medium',         // Options: 'low', 'medium', 'high'
  AI_MAX_TOKENS: 1024
};

console.log('✅ Config loaded:', { hasAPIKey: !!window.APP_CONFIG.OPENAI_API_KEY });
