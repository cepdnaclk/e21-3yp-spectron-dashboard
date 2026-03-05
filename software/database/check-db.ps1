$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
& (Join-Path $scriptDir "scripts\check-db.ps1") @args
