# IoT Debug Ingestion Server

Minimal HTTP-only ingestion backend to debug an ESP32 + SIM800C GPRS uplink.

- **Endpoint**: `POST /api/iot/upload`
- **Storage**: SQLite (`data.db` in this folder)
- **Dashboard**: `GET /` shows latest 50 uploads
- **Health**: `GET /health`

## Requirements

- Node.js 18+ (recommended)
- npm
- SQLite library is bundled via `better-sqlite3` and will create `data.db` automatically.

Change into this directory first:

```bash
cd iot-ingest
```

## Installation

```bash
npm install
```

## Running locally

```bash
npm start
# or, during development:
npm run dev
```

By default it listens on:

- `HOST=0.0.0.0`
- `PORT=8080`

So you can open:

- Dashboard: `http://localhost:8080/`
- Health: `http://localhost:8080/health`

You can override:

```bash
HOST=127.0.0.1 PORT=8080 npm start
```

## API endpoints

### 1) Ingest endpoint

**POST** `/api/iot/upload`

- Accepts **any** HTTP POST with a body.
- If body is valid JSON, it is parsed and stored as `payload_json`.
- If body is missing or invalid JSON, the raw body is still stored as `raw_body`.
- Extracts `deviceId` and `ts` fields from JSON (if present) into dedicated DB columns.
- Metadata stored: `received_at`, `ip`.
- Always returns HTTP 200 with JSON `{"ok": true}` (unless there is an internal server error).

**Example payload**:

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

### 2) Health

**GET** `/health` → returns plain text `OK`.

### 3) Dashboard

- **GET** `/` → HTML page with latest 50 uploads (table).
  - Columns: `id`, `received_at`, `device_id`, `ts`, preview of payload.
  - Clicking a row opens `/upload/<id>`.

- **GET** `/upload/<id>` → HTML page with:
  - Metadata (received time, device ID, ts, IP).
  - Pretty-printed JSON (if valid).
  - Raw body.

- **GET** `/uploads.json` → JSON array of the latest 50 uploads.

### 4) Dev clear endpoint

**GET** `/clear?token=dev123`

- Deletes all rows from `uploads`.
- Protected by the query parameter `token`.
- Default token is `dev123`.
- Recommended to change in production by setting the `CLEAR_TOKEN` environment variable or disabling this route.

---

## Database schema

SQLite file: `data.db` (auto-created in this directory)

Table `uploads`:

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `received_at` TEXT (ISO timestamp)
- `device_id` TEXT (nullable)
- `ts` INTEGER (nullable)
- `payload_json` TEXT (nullable)
- `raw_body` TEXT (nullable)
- `ip` TEXT (nullable)

---

## Example curl commands

### 1) Valid JSON payload

```bash
curl -v -X POST "http://localhost:8080/api/iot/upload" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"CTRL01","ts":1700000000,"sensors":[{"id":"T01","type":"temp","v":31.4},{"id":"M01","type":"motion","v":1}]}'
```

Expected response:

```json
{"ok":true}
```

Example log line in server console:

```text
[UPLOAD] time=2026-03-04T12:34:56.789Z ip=::1 ua="curl/8.0.0" content-length=123
```

You should then see the new entry on `http://localhost:8080/`.

### 2) Invalid JSON / raw text

```bash
curl -v -X POST "http://localhost:8080/api/iot/upload" \
  -H "Content-Type: application/json" \
  -d '{"not valid": }'
```

- Server will still return `{"ok":true}`.
- Raw body is stored in `raw_body`.
- `payload_json` will be `NULL`.
- Dashboard will show `(no valid JSON parsed)` and the raw text below.

### 3) Wrong path (for testing)

```bash
curl -v -X POST "http://localhost:8080/api/iot/wrongpath" \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"CTRL01"}'
```

- This will return `404 Not Found` (as expected).
- Make sure your ESP32 uses the correct path `/api/iot/upload`.

---

## Deploying on a VPS (HTTP only)

1. **Copy project to VPS**

```bash
# On VPS
mkdir -p ~/iot-ingest
cd ~/iot-ingest
# copy files here (e.g., via scp or git)
npm install
```

2. **Run the server**

Simple (foreground):

```bash
PORT=8080 HOST=0.0.0.0 npm start
```

Recommended (background, using `pm2`):

```bash
npm install -g pm2
PORT=8080 HOST=0.0.0.0 pm2 start server.js --name iot-ingest
pm2 save
```

3. **Firewall (UFW)**

If you expose port **8080** directly:

```bash
sudo ufw allow 8080/tcp
sudo ufw reload
```

If you use Nginx on port **80** as a reverse proxy (recommended), then:

```bash
sudo ufw allow 80/tcp
sudo ufw reload
```

---

## Optional: Nginx reverse proxy (port 80 → 8080)

Example `/etc/nginx/sites-available/iot-ingest`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your VPS IP

    access_log /var/log/nginx/iot-ingest.access.log;
    error_log  /var/log/nginx/iot-ingest.error.log;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
    }
}
```

Enable and reload Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/iot-ingest /etc/nginx/sites-enabled/iot-ingest
sudo nginx -t
sudo systemctl reload nginx
```

Now:

- Browser / ESP32 can use plain HTTP: `http://your-domain.com/api/iot/upload`
- Node app still listens on `127.0.0.1:8080`.

---

## Exact ESP32 / SIM800 settings

Assuming the VPS is reachable as `your-domain.com` and Nginx is set up as above:

- **HOST**: `your-domain.com`
- **PORT**: `80`
- **PATH**: `/api/iot/upload`
- **Scheme**: `http` (NOT `https`)

Full URL:

- `http://your-domain.com/api/iot/upload`

If you **do not** use Nginx and expose Node directly on port 8080 with public IP `1.2.3.4`:

- **HOST**: `1.2.3.4`
- **PORT**: `8080`
- **PATH**: `/api/iot/upload`
- Full URL: `http://1.2.3.4:8080/api/iot/upload`

---

## Common issues

- **Invalid JSON**
  - The server will still accept the request and store `raw_body`.
  - `device_id` and `ts` will be `NULL` because parsing failed.
  - Dashboard will show `(no valid JSON parsed)` and the raw text below.

- **Wrong path**
  - Ensure the path is exactly `/api/iot/upload`.
  - Requests to other paths (e.g., `/api/iot/uploads`) will return 404.

- **SIM800 can only do HTTP, not HTTPS**
  - This server is designed for plain HTTP.
  - Make sure your URL is `http://...`, not `https://...`.
  - On the VPS, use port 80 or 8080, both over HTTP.

- **Port blocked by firewall**
  - If using port 8080 directly: `sudo ufw allow 8080/tcp`.
  - If using Nginx on port 80: `sudo ufw allow 80/tcp`.
  - Confirm from another machine with: `curl -v http://your-domain.com/health`.

---

## Notes

- Change the clear token in production by setting `CLEAR_TOKEN` env var:

  ```bash
  CLEAR_TOKEN="some-secret" npm start
  ```

- To completely disable `/clear`, you can remove or comment out that route in `server.js`.

