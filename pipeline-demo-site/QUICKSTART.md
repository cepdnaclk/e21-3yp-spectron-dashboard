⚡ **QUICK START** ⚡

## Get Running in 2 Minutes

### Prerequisites
- Node.js installed? → [Get Node.js](https://nodejs.org/) (includes npm)
- Python installed? → Already have it? Great!

### 3 Steps to Launch

#### Step 1: Install backend dependencies (1 min)
```powershell
cd d:\3Yp\e21-3yp-spectron-dashboard\pipeline-demo-site\server
npm install
```

#### Step 2: Open two terminals and run these

**Terminal 1 - Backend:**
```powershell
cd d:\3Yp\e21-3yp-spectron-dashboard\pipeline-demo-site\server
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd d:\3Yp\e21-3yp-spectron-dashboard\pipeline-demo-site
.\start-demo.ps1
```

#### Step 3: Open browser and click!
1. Go to: **http://localhost:4173**
2. Click **"Connect Source"** button
3. Watch packets flow through the pipeline! 🚀

## What You'll See

```
📊 Stats updating:
   • Connection: Live ✓
   • Packets Tracked: 1, 2, 3...
   • Active Stage: animating

🎨 Pipeline:
   • Glowing packet token moving through 6 stages
   • Colors: teal (active), green (done)

💾 Packet Data:
   • Latest packet shown as JSON
   • History list with timing

✨ That's it! Enjoy the demo!
```

## Stuck?

| Problem | Fix |
|---------|-----|
| "npm not found" | Install Node.js from nodejs.org |
| "Connection refused" | Make sure Terminal 1 shows "Server running at http://localhost:8080" |
| No packets appearing | Wait 5 seconds for first one to generate |
| Port 8080 in use | See SETUP.md for alternate port instructions |

## Want More Details?

👉 Read **SETUP.md** for full installation guide
👉 Read **README.md** for feature overview
👉 Read **IMPLEMENTATION.md** for architecture details
👉 Check **server/API.md** for API reference

---

**Need help?** Check the troubleshooting section in SETUP.md

**Happy demoing!** 🎉
