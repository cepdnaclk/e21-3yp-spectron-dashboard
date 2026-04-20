# Pipeline Demo Site

This is a separate demo site for presentation use. It watches the ingest server and visualizes each new packet as it moves through the live demo pipeline.

## What It Shows

- Packet arrival from the controller
- HTTP ingest endpoint hit
- Upload storage in the debug ingest server
- Realtime visualization in this standalone tracker
- Future stages that are still planned next

## Run It

1. Start the ingest server:

```powershell
cd hardware\iot-ingest
npm start
```

2. Start this standalone site:

```powershell
cd pipeline-demo-site
.\start-demo.ps1
```

3. Open:

```text
http://localhost:4173
```

If your ingest server is not running on `http://localhost:8080`, change the source URL in the page header and click `Connect Source`.

## Notes

- The site polls `uploads.json` every 3 seconds.
- It keeps the latest packet inspector on the right side.
- `Replay Latest Packet` is useful if you want to repeat the animation during the demo without sending a fresh upload.
- Browser access works because the ingest server now exposes simple CORS headers.
