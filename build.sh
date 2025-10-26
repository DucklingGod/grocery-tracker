#!/bin/bash
# Vercel build script - creates config.js from environment variable

echo "Creating config.js from environment variable..."

cat > config.js << EOF
// Auto-generated configuration for production
const CONFIG = {
  OPENAI_API_KEY: '${OPENAI_API_KEY}',
  AI_MODEL: 'gpt-5-mini',
  AI_REASONING_EFFORT: 'low',
  AI_VERBOSITY: 'medium',
  AI_MAX_TOKENS: 1024
};

if (typeof window !== 'undefined') {
  window.APP_CONFIG = CONFIG;
}
EOF

echo "config.js created successfully!"
ls -la config.js
