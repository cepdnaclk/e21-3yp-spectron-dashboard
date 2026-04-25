# Start Spectron Pipeline Demo Frontend
# This script starts a simple HTTP server to serve the static site.

param(
    [int]$Port = 4173
)

Set-Location $PSScriptRoot

function Write-StartupInfo {
    param(
        [string]$Runner
    )

    Write-Host ""
    Write-Host "+------------------------------------------------------------+" -ForegroundColor Cyan
    Write-Host "|  Spectron Live Pipeline Tracker                            |" -ForegroundColor Cyan
    Write-Host "|  Frontend Dev Server                                       |" -ForegroundColor Cyan
    Write-Host "+------------------------------------------------------------+" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Starting server with $Runner..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Frontend available at:" -ForegroundColor White
    Write-Host "   http://localhost:$Port" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Backend should be running at:" -ForegroundColor White
    Write-Host "   http://localhost:8080" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Features:" -ForegroundColor White
    Write-Host "   - Real-time pipeline visualization" -ForegroundColor White
    Write-Host "   - 6-stage packet animation" -ForegroundColor White
    Write-Host "   - Live connection status" -ForegroundColor White
    Write-Host "   - Packet replay and history" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
}

# Try Python first, then the Windows launcher.
if (Get-Command python -ErrorAction SilentlyContinue) {
    Write-StartupInfo -Runner "Python"
    python -m http.server $Port
    exit $LASTEXITCODE
}

if (Get-Command py -ErrorAction SilentlyContinue) {
    Write-StartupInfo -Runner "py"
    py -m http.server $Port
    exit $LASTEXITCODE
}

# If no Python is available, show a helpful error message.
Write-Host "Error: Python was not found in PATH" -ForegroundColor Red
Write-Host ""
Write-Host "To fix this, you can either:" -ForegroundColor Yellow
Write-Host "1. Install Python from https://www.python.org/" -ForegroundColor White
Write-Host "2. Or use VS Code Live Server extension (recommended)" -ForegroundColor White
Write-Host "3. Or use any other static HTTP server" -ForegroundColor White
Write-Host ""
Write-Host "To start manually with VS Code:" -ForegroundColor Cyan
Write-Host "1. Right-click on index.html" -ForegroundColor White
Write-Host "2. Select 'Open with Live Server'" -ForegroundColor White
