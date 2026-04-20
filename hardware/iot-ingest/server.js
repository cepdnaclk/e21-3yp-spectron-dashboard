'use strict';

const express = require('express');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const path = require('path');

// --- Config ---
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
const CLEAR_TOKEN = process.env.CLEAR_TOKEN || 'dev123';

// --- Database setup ---
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    received_at TEXT NOT NULL,
    device_id TEXT,
    ts INTEGER,
    payload_json TEXT,
    raw_body TEXT,
    ip TEXT
  );
`);

// Prepared statements
const insertUploadStmt = db.prepare(`
  INSERT INTO uploads (received_at, device_id, ts, payload_json, raw_body, ip)
  VALUES (@received_at, @device_id, @ts, @payload_json, @raw_body, @ip)
`);

const selectLatestStmt = db.prepare(`
  SELECT id, received_at, device_id, ts,
         COALESCE(payload_json, raw_body) AS payload_preview
  FROM uploads
  ORDER BY id DESC
  LIMIT 50
`);

const selectByIdStmt = db.prepare(`
  SELECT id, received_at, device_id, ts, payload_json, raw_body, ip
  FROM uploads
  WHERE id = ?
`);

const deleteAllStmt = db.prepare(`DELETE FROM uploads`);

// --- Express app setup ---
const app = express();

// If behind reverse proxy (e.g., Nginx) and want correct client IP
app.set('trust proxy', true);

// Allow the standalone pipeline demo site to poll recent uploads from the browser.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Logging
app.use(morgan('combined'));

// Body handling: accept any content type as text, parse JSON manually.
// This avoids Express rejecting invalid JSON.
app.use(express.text({ type: '*/*', limit: '1mb' }));

// --- Helpers ---
function getClientIp(req) {
  const xfwd = req.headers['x-forwarded-for'];
  if (xfwd && typeof xfwd === 'string') {
    return xfwd.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || '';
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shortPreview(text, maxLen) {
  if (!text) return '';
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 3) + '...';
}

// --- Routes ---

// 2) Health endpoint
app.get('/health', (req, res) => {
  res.type('text/plain').send('OK');
});

// 1) API endpoint: POST /api/iot/upload
app.post('/api/iot/upload', (req, res) => {
  const receivedAt = new Date().toISOString();
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';
  const contentLengthHeader = req.headers['content-length'];
  const rawBody = typeof req.body === 'string' ? req.body : '';

  let contentLength = 0;
  if (contentLengthHeader) {
    contentLength = parseInt(contentLengthHeader, 10) || 0;
  } else if (rawBody) {
    contentLength = Buffer.byteLength(rawBody, 'utf8');
  }

  let payloadJson = null;
  let deviceId = null;
  let ts = null;

  if (rawBody && rawBody.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawBody);
      payloadJson = JSON.stringify(parsed);

      // Extract deviceId and ts if present
      if (parsed && typeof parsed === 'object') {
        if (parsed.deviceId && typeof parsed.deviceId === 'string') {
          deviceId = parsed.deviceId;
        }
        if (parsed.ts !== undefined && parsed.ts !== null) {
          const tsNum = Number(parsed.ts);
          if (!Number.isNaN(tsNum)) {
            ts = tsNum;
          }
        }
      }
    } catch (err) {
      // Invalid JSON: keep payloadJson as null, still store raw_body
    }
  }

  console.log(
    `[UPLOAD] time=${receivedAt} ip=${ip} ua="${userAgent}" content-length=${contentLength}`
  );

  try {
    insertUploadStmt.run({
      received_at: receivedAt,
      device_id: deviceId,
      ts: ts,
      payload_json: payloadJson,
      raw_body: rawBody || null,
      ip: ip
    });

    // Always 200 unless server error
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error inserting upload:', err);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// 4) Dashboard: GET /
app.get('/', (req, res) => {
  const rows = selectLatestStmt.all();

  const tableRows = rows
    .map((row) => {
      const previewSource = row.payload_preview || '';
      const previewHtml = escapeHtml(shortPreview(previewSource, 120));

      return `
        <tr onclick="window.location.href='/upload/${row.id}'" style="cursor:pointer;">
          <td>${row.id}</td>
          <td>${escapeHtml(row.received_at)}</td>
          <td>${escapeHtml(row.device_id || '')}</td>
          <td>${row.ts !== null && row.ts !== undefined ? row.ts : ''}</td>
          <td><code>${previewHtml}</code></td>
        </tr>
      `;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>IoT Uploads Dashboard</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
      color: #222;
    }
    h1 {
      margin-bottom: 0.2em;
    }
    .subtitle {
      color: #555;
      margin-bottom: 1em;
      font-size: 0.9em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
      text-align: left;
      font-size: 0.9em;
    }
    th {
      background-color: #f0f0f0;
      font-weight: 600;
    }
    tr:hover {
      background-color: #f9f9f9;
    }
    code {
      font-family: "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.85em;
    }
    .top-links {
      margin-bottom: 1em;
      font-size: 0.9em;
    }
    .top-links a {
      margin-right: 10px;
      color: #007bff;
      text-decoration: none;
    }
    .top-links a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>IoT Uploads</h1>
  <div class="subtitle">Latest 50 uploads (click a row to view full payload)</div>
  <div class="top-links">
    <a href="/uploads.json">/uploads.json</a>
    <a href="/health">/health</a>
    <a href="/clear?token=${encodeURIComponent(CLEAR_TOKEN)}" onclick="return confirm('Clear ALL uploads?');">/clear (dev only)</a>
  </div>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Received At</th>
        <th>Device ID</th>
        <th>TS</th>
        <th>Payload Preview</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows || '<tr><td colspan="5">No uploads yet.</td></tr>'}
    </tbody>
  </table>
</body>
</html>`;

  res.type('html').send(html);
});

// 4) Detail view: GET /upload/:id
app.get('/upload/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).type('text/plain').send('Invalid ID');
  }

  const row = selectByIdStmt.get(id);
  if (!row) {
    return res.status(404).type('text/plain').send('Not found');
  }

  let prettyJson = '';
  if (row.payload_json) {
    try {
      const parsed = JSON.parse(row.payload_json);
      prettyJson = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // fallback to raw stored JSON string
      prettyJson = row.payload_json;
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Upload #${row.id}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
      color: #222;
    }
    h1 {
      margin-bottom: 0.2em;
    }
    .meta {
      margin-bottom: 1em;
      font-size: 0.9em;
    }
    pre {
      background: #1e1e1e;
      color: #f8f8f2;
      padding: 12px;
      overflow-x: auto;
      border-radius: 4px;
      font-size: 0.85em;
    }
    a {
      color: #007bff;
      text-decoration: none;
      font-size: 0.9em;
    }
    a:hover {
      text-decoration: underline;
    }
    .section-title {
      font-weight: 600;
      margin-top: 1em;
      margin-bottom: 0.3em;
    }
  </style>
</head>
<body>
  <a href="/">&larr; Back to list</a>
  <h1>Upload #${row.id}</h1>
  <div class="meta">
    <div><strong>Received At:</strong> ${escapeHtml(row.received_at)}</div>
    <div><strong>Device ID:</strong> ${escapeHtml(row.device_id || '')}</div>
    <div><strong>TS:</strong> ${row.ts !== null && row.ts !== undefined ? row.ts : ''}</div>
    <div><strong>IP:</strong> ${escapeHtml(row.ip || '')}</div>
  </div>

  <div class="section-title">Parsed JSON (if valid):</div>
  <pre>${prettyJson ? escapeHtml(prettyJson) : '(no valid JSON parsed)'}</pre>

  <div class="section-title">Raw Body:</div>
  <pre>${row.raw_body ? escapeHtml(row.raw_body) : '(no raw body stored)'}</pre>
</body>
</html>`;

  res.type('html').send(html);
});

// 4) /uploads.json: last 50 uploads as JSON
app.get('/uploads.json', (req, res) => {
  const rows = selectLatestStmt.all();
  res.json(rows);
});

// 4) /clear endpoint (dev only) to wipe DB with simple token
app.get('/clear', (req, res) => {
  const token = req.query.token;
  if (token !== CLEAR_TOKEN) {
    return res.status(403).type('text/plain').send('Forbidden');
  }

  deleteAllStmt.run();
  console.log('All uploads cleared via /clear');
  res.type('text/plain').send('All uploads cleared.');
});

// --- Start server ---
app.listen(PORT, HOST, () => {
  console.log(`IoT ingestion server listening on http://${HOST}:${PORT}`);
});

