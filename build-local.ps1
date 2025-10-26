# Local build script - creates config.js from .env file
Write-Host "Creating config.js from .env file..." -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example" -ForegroundColor Yellow
    exit 1
}

# Read API key from .env file
$envContent = Get-Content ".env" | Where-Object { $_ -match "^OPENAI_API_KEY=" }
if ($envContent) {
    $apiKey = $envContent -replace "^OPENAI_API_KEY=", ""
    Write-Host "Found API key in .env file" -ForegroundColor Green
} else {
    Write-Host "Error: OPENAI_API_KEY not found in .env file!" -ForegroundColor Red
    exit 1
}

# Create config.js
$configContent = @"
// Auto-generated configuration from .env
window.APP_CONFIG = {
  OPENAI_API_KEY: '$apiKey',
  AI_MODEL: 'gpt-4o-mini'
};

console.log('✅ Config loaded:', { hasAPIKey: !!window.APP_CONFIG.OPENAI_API_KEY });
"@

$configContent | Out-File -FilePath "config.js" -Encoding utf8 -NoNewline

Write-Host "config.js created successfully!" -ForegroundColor Green
Get-Item config.js | Select-Object Name, Length, LastWriteTime
