$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
& (Join-Path $scriptDir "scripts\verify-user.ps1") @args
