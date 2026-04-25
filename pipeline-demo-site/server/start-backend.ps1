# Start Spectron Pipeline Mock Backend
# This script sets up and runs the Node.js mock backend server

Write-Host "Starting Spectron Pipeline Mock Backend..." -ForegroundColor Green
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# Check if node is installed
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm is not installed" -ForegroundColor Red
        exit 1
    }
    Write-Host "npm version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: npm is not installed" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Set environment variables if not already set
if (-not $env:PORT) {
    $env:PORT = "8080"
}

if (-not $env:AUTO_GENERATE) {
    $env:AUTO_GENERATE = "true"
}

if (-not $env:AUTO_GENERATE_INTERVAL) {
    $env:AUTO_GENERATE_INTERVAL = "5000"
}

Write-Host ""
Write-Host "Starting server with the following config:" -ForegroundColor Cyan
Write-Host "  PORT: $env:PORT" -ForegroundColor White
Write-Host "  AUTO_GENERATE: $env:AUTO_GENERATE" -ForegroundColor White
Write-Host "  AUTO_GENERATE_INTERVAL: $env:AUTO_GENERATE_INTERVAL ms" -ForegroundColor White
Write-Host ""
Write-Host "Use in the frontend:" -ForegroundColor Yellow
Write-Host "  Source URL: http://localhost:$env:PORT" -ForegroundColor White
Write-Host ""

npm start
