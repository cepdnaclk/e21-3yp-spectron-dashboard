$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
& (Join-Path $scriptDir "scripts\start-backend.ps1") @args
