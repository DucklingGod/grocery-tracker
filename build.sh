#!/bin/bash
# Vercel build script - creates config.js from environment variable

echo "Creating config.js from environment variable..."

cat > config.js << EOF
// Auto-generated configuration for production
window.APP_CONFIG = {
  OPENAI_API_KEY: '${OPENAI_API_KEY}',
  AI_MODEL: 'gpt-4o-mini'
};

console.log('✅ Config loaded:', { hasAPIKey: !!window.APP_CONFIG.OPENAI_API_KEY });
EOF

echo "config.js created successfully!"
ls -la config.js
