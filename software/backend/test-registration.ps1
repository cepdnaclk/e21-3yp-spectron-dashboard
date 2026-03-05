$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
& (Join-Path $scriptDir "scripts\test-registration.ps1") @args
