param(
    [int]$Port = 4173
)

Set-Location $PSScriptRoot

if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server $Port
    exit $LASTEXITCODE
}

if (Get-Command py -ErrorAction SilentlyContinue) {
    py -m http.server $Port
    exit $LASTEXITCODE
}

Write-Error "Python was not found. Serve this folder with any static server, for example VS Code Live Server."
