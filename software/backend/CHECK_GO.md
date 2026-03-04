# How to Check if Go is Installed and in PATH

## Quick Check Commands

### 1. Check if Go is in PATH (can run from anywhere):
```powershell
go version
```

**If you see:** `go version go1.21.x windows/amd64` (or similar)
✅ **Go is installed AND in PATH**

**If you see:** `go: command not found` or error
❌ **Go is either not installed OR not in PATH**

### 2. Check if Go executable exists:
```powershell
# Check common installation locations
Test-Path "C:\Program Files\Go\bin\go.exe"
Test-Path "C:\Go\bin\go.exe"
```

**If either returns `True`:**
✅ **Go is installed** (but may not be in PATH)

**If both return `False`:**
❌ **Go is not installed**

### 3. Check if Go is in your PATH:
```powershell
$env:Path -split ';' | Select-String -Pattern 'go' -CaseSensitive:$false
```

**If you see paths like:**
- `C:\Program Files\Go\bin`
- `C:\Go\bin`

✅ **Go is in PATH**

**If nothing is shown:**
❌ **Go is not in PATH**

### 4. Find where Go is installed (if it exists):
```powershell
Get-ChildItem "C:\Program Files" -Filter "Go" -Directory -ErrorAction SilentlyContinue
Get-ChildItem "C:\" -Filter "Go" -Directory -ErrorAction SilentlyContinue
```

## Your Current Status

Based on the checks:
- ❌ Go is **NOT** in PATH
- ❌ Go is **NOT** found in common installation locations
- **Conclusion: Go is likely NOT installed**

## How to Install Go

### Step 1: Download Go
1. Go to: https://go.dev/dl/
2. Download the Windows installer (`.msi` file)
   - Example: `go1.21.5.windows-amd64.msi`

### Step 2: Install Go
1. Run the downloaded `.msi` installer
2. Follow the installation wizard
3. **Important:** The installer will automatically add Go to your PATH
4. Default installation location: `C:\Program Files\Go`

### Step 3: Verify Installation
1. **Close and reopen PowerShell** (important for PATH changes to take effect)
2. Run: `go version`
3. Should see: `go version go1.21.x windows/amd64`

## If Go is Installed but Not in PATH

If Go exists but isn't in PATH, you can:

### Option 1: Add to PATH for current session
```powershell
$env:Path += ";C:\Program Files\Go\bin"
go version  # Should work now
```

### Option 2: Add to PATH permanently
1. Open System Properties → Environment Variables
2. Edit "Path" under "User variables" or "System variables"
3. Add: `C:\Program Files\Go\bin`
4. Click OK and restart PowerShell

### Option 3: Use full path
```powershell
& "C:\Program Files\Go\bin\go.exe" version
```

## Next Steps

1. **Install Go** from https://go.dev/dl/
2. **Restart PowerShell** after installation
3. **Verify** with: `go version`
4. **Run backend** with: `go run cmd\api\main.go`
