# Backend (Go API)

This folder contains the Go backend API and backend utility scripts.

## Prerequisites

- Go 1.21+ installed and available in `PATH`
- PostgreSQL running (local or remote)
- Database already created (default project DB is `spectron`)

Check Go:

```powershell
go version
```

## Run the Backend

From this folder (`software/backend`):

```powershell
.\start-backend.ps1
```

This script:
- checks Go installation,
- sets default `DATABASE_URL` if missing,
- picks port `8080` (or `8081` if busy),
- runs `go run cmd\api\main.go`.

Health check:

```powershell
curl http://localhost:8080/healthz
```

If the script switched to 8081, use:

```powershell
curl http://localhost:8081/healthz
```

## Run Manually (without script)

```powershell
go mod download
go mod tidy
go run cmd\api\main.go
```

## Environment Variables

Most important variable:

```powershell
$env:DATABASE_URL="postgres://spectron:spectron@localhost:5432/spectron?sslmode=disable"
```

Optional:

```powershell
$env:HTTP_PORT="8080"
```

## Helpful Scripts in This Folder

- `create-test-user.ps1`
- `test-login.ps1`
- `test-registration.ps1`
- `test-get-users.ps1`
- `get-users-simple.ps1`

Run example:

```powershell
.\test-login.ps1
```
