# Backend (Go API)

This folder contains the Go backend API and backend utility scripts.

## Folder Layout

- `cmd/` → Go entry points (`api`, utilities)
- `internal/` → core backend packages
- `scripts/` → operational/test PowerShell scripts
- root `*.ps1` files → compatibility wrappers that call `scripts/`

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
go run cmd\api\main.go
```

To run the Kafka-backed readings consumer:

```powershell
go run cmd\readings-consumer\main.go
```

## Environment Variables

Most important variable:

```powershell
$env:DATABASE_URL="postgres://spectron:spectron@localhost:5432/spectron?sslmode=disable"
```

Optional:

```powershell
$env:HTTP_PORT="8080"
$env:KAFKA_BROKERS="172.31.13.87:9092"
$env:KAFKA_RAW_READINGS_TOPIC="spectron.raw-readings"
$env:KAFKA_CONSUMER_GROUP="spectron-readings-consumer"
```

`POST /api/iot/upload` now accepts controller payloads in this shape and publishes them to Kafka:

```json
{
  "deviceId": "CTRL01",
  "ts": 1700000000,
  "sensors": [
    { "id": "T01", "type": "temp", "v": 31.4 },
    { "id": "M01", "type": "motion", "v": 1 }
  ]
}
```

The consumer reads `spectron.raw-readings`, upserts sensors for the controller, writes `sensor_readings`, and marks the controller/sensors as online.

## Typical Kafka Demo Run

In one terminal:

```powershell
$env:DATABASE_URL="postgres://spectron:spectron@localhost:5432/spectron?sslmode=disable"
$env:KAFKA_BROKERS="172.31.13.87:9092"
go run cmd\readings-consumer\main.go
```

In another terminal:

```powershell
$env:DATABASE_URL="postgres://spectron:spectron@localhost:5432/spectron?sslmode=disable"
$env:KAFKA_BROKERS="172.31.13.87:9092"
go run cmd\api\main.go
```

## Helpful Scripts in This Folder

- `scripts/create-test-user.ps1`
- `scripts/test-login.ps1`
- `scripts/test-registration.ps1`
- `scripts/test-get-users.ps1`
- `scripts/get-users-simple.ps1`

You can still run legacy root commands (for example `./test-login.ps1`) because wrappers are kept for compatibility.

Run example:

```powershell
.\test-login.ps1
```
