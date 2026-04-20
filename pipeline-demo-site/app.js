const DEFAULT_SOURCE_URL = "http://localhost:8080";
const POLL_INTERVAL_MS = 3000;
const STAGE_ADVANCE_MS = 1100;
const MAX_TRACES = 8;

const liveStages = [
  {
    id: "controller-packet",
    title: "Controller Packet",
    description: "ESP32 and SIM800 assemble the JSON payload and start the HTTP uplink.",
  },
  {
    id: "http-ingest",
    title: "HTTP Ingest",
    description: "The packet reaches POST /api/iot/upload on the debug ingest server.",
  },
  {
    id: "upload-store",
    title: "Upload Store",
    description: "The ingest service writes the payload into SQLite and exposes it through uploads.json.",
  },
  {
    id: "tracker-visual",
    title: "Tracker Visual",
    description: "This separate demo site detects the new upload and animates the packet flow in realtime.",
  },
];

const futureStages = [
  {
    id: "backend-bridge",
    title: "Backend Bridge",
    description: "Next step: transform incoming uploads into the main PostgreSQL sensor_readings table.",
  },
  {
    id: "monitoring-alerts",
    title: "Monitoring and Alerts",
    description: "Next step: feed the main monitoring dashboard and automatic alert generation from live readings.",
  },
];

const stageNameById = Object.fromEntries(
  liveStages.concat(futureStages).map((stage) => [stage.id, stage.title])
);

const state = {
  sourceUrl: localStorage.getItem("spectron_pipeline_source") || DEFAULT_SOURCE_URL,
  connectionStatus: "checking",
  lastPollAt: null,
  latestUpload: null,
  traces: [],
  trackedPackets: 0,
  bootstrapped: false,
};

const seenUploadIds = new Set();
const timers = new Set();

const elements = {
  sourceUrlInput: document.getElementById("sourceUrlInput"),
  saveSourceButton: document.getElementById("saveSourceButton"),
  replayButton: document.getElementById("replayButton"),
  clearButton: document.getElementById("clearButton"),
  sourceHint: document.getElementById("sourceHint"),
  connectionValue: document.getElementById("connectionValue"),
  connectionMeta: document.getElementById("connectionMeta"),
  trackedValue: document.getElementById("trackedValue"),
  stageValue: document.getElementById("stageValue"),
  stageMeta: document.getElementById("stageMeta"),
  deviceValue: document.getElementById("deviceValue"),
  deviceMeta: document.getElementById("deviceMeta"),
  liveStages: document.getElementById("liveStages"),
  futureStages: document.getElementById("futureStages"),
  packetSummary: document.getElementById("packetSummary"),
  packetPreview: document.getElementById("packetPreview"),
  traceList: document.getElementById("traceList"),
  trackToken: document.getElementById("trackToken"),
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatTime(value) {
  if (!value) {
    return "Waiting";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

function formatShortTime(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString();
}

function prettyPayload(preview) {
  if (!preview) {
    return "No payload preview yet.";
  }

  try {
    const parsed = JSON.parse(preview);
    return JSON.stringify(parsed, null, 2);
  } catch (_error) {
    return String(preview);
  }
}

function normalizeSourceUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return DEFAULT_SOURCE_URL;
  }

  return raw.replace(/\/+$/, "");
}

function clearTimers() {
  timers.forEach((timerId) => window.clearTimeout(timerId));
  timers.clear();
}

function renderStageCards() {
  const focusTrace = state.traces[0] || null;

  elements.liveStages.innerHTML = liveStages
    .map((stage, index) => {
      let cardState = "idle";
      let stateLabel = "Waiting";

      if (focusTrace) {
        if (index < focusTrace.currentStageIndex || focusTrace.completed && index === focusTrace.currentStageIndex) {
          cardState = "completed";
          stateLabel = focusTrace.history[index] ? `Completed at ${formatShortTime(focusTrace.history[index].at)}` : "Completed";
        } else if (index === focusTrace.currentStageIndex) {
          cardState = focusTrace.completed ? "completed" : "active";
          stateLabel = focusTrace.completed ? `Completed at ${formatShortTime(focusTrace.history[index]?.at)}` : "Active now";
        }
      }

      return `
        <article class="stage-card" data-state="${cardState}">
          <div class="stage-index">${index + 1}</div>
          <h3 class="stage-title">${escapeHtml(stage.title)}</h3>
          <p class="stage-copy">${escapeHtml(stage.description)}</p>
          <div class="stage-state">${escapeHtml(stateLabel)}</div>
        </article>
      `;
    })
    .join("");

  elements.futureStages.innerHTML = futureStages
    .map(
      (stage, index) => `
        <article class="stage-card" data-state="planned">
          <div class="stage-index">${liveStages.length + index + 1}</div>
          <h3 class="stage-title">${escapeHtml(stage.title)}</h3>
          <p class="stage-copy">${escapeHtml(stage.description)}</p>
          <div class="stage-state">Next build phase</div>
        </article>
      `
    )
    .join("");
}

function renderTrackToken() {
  const focusTrace = state.traces[0] || null;
  if (!focusTrace) {
    elements.trackToken.classList.add("hidden");
    return;
  }

  const maxIndex = Math.max(liveStages.length - 1, 1);
  const progressRatio = focusTrace.currentStageIndex / maxIndex;
  const leftPercent = 7 + progressRatio * 86;

  elements.trackToken.style.left = `${leftPercent}%`;
  elements.trackToken.classList.remove("hidden");
}

function renderStats() {
  const focusTrace = state.traces[0] || null;
  const latestUpload = state.latestUpload;

  const connectionLabel =
    state.connectionStatus === "live"
      ? "Live"
      : state.connectionStatus === "offline"
        ? "Offline"
        : "Checking...";

  elements.connectionValue.textContent = connectionLabel;
  elements.connectionMeta.textContent =
    state.connectionStatus === "offline"
      ? `Could not reach ${state.sourceUrl}/uploads.json`
      : state.lastPollAt
        ? `Last refreshed at ${formatShortTime(state.lastPollAt)}`
        : "Waiting for first poll.";

  elements.trackedValue.textContent = String(state.trackedPackets);

  if (focusTrace) {
    elements.stageValue.textContent = stageNameById[liveStages[focusTrace.currentStageIndex].id];
    elements.stageMeta.textContent = focusTrace.completed
      ? "The current packet completed all live stages."
      : `Packet ${focusTrace.upload.id} is moving through the pipeline now.`;
  } else {
    elements.stageValue.textContent = "Idle";
    elements.stageMeta.textContent = "No live packet is moving right now.";
  }

  elements.deviceValue.textContent = latestUpload?.device_id || "Waiting";
  elements.deviceMeta.textContent = latestUpload
    ? `Last seen at ${formatShortTime(latestUpload.received_at)}`
    : "No packet observed yet.";
}

function renderInspector() {
  const latestUpload = state.latestUpload;
  if (!latestUpload) {
    elements.packetSummary.innerHTML = `
      <div class="empty-state">
        Start the ingest server and let the controller send a packet. The newest upload will appear here automatically.
      </div>
    `;
    elements.packetPreview.textContent = "No packet captured yet.";
    return;
  }

  const summaryRows = [
    ["Upload ID", latestUpload.id],
    ["Device ID", latestUpload.device_id || "Unknown"],
    ["Received At", formatTime(latestUpload.received_at)],
    ["Source Timestamp", latestUpload.ts ?? "Not provided"],
  ];

  elements.packetSummary.innerHTML = summaryRows
    .map(
      ([label, value]) => `
        <div class="summary-item">
          <span class="summary-label">${escapeHtml(label)}</span>
          <span class="summary-value">${escapeHtml(value)}</span>
        </div>
      `
    )
    .join("");

  elements.packetPreview.textContent = prettyPayload(latestUpload.payload_preview);
}

function renderTraceList() {
  if (state.traces.length === 0) {
    elements.traceList.innerHTML = `
      <p class="empty-state">
        No packet traces yet. This panel will fill with each new upload and show the exact stage history for the demo.
      </p>
    `;
    return;
  }

  elements.traceList.innerHTML = state.traces
    .map((trace) => {
      const progress = ((trace.currentStageIndex + (trace.completed ? 1 : 0)) / liveStages.length) * 100;
      const events = trace.history
        .map(
          (event) => `
            <li>
              <strong>${escapeHtml(stageNameById[event.stageId])}</strong>
              <span> at ${escapeHtml(formatShortTime(event.at))}</span>
            </li>
          `
        )
        .join("");

      return `
        <article class="trace-item">
          <div class="trace-top">
            <div>
              <h3 class="trace-name">${escapeHtml(trace.upload.device_id || `Packet ${trace.upload.id}`)}</h3>
              <p class="trace-meta">Upload #${escapeHtml(trace.upload.id)} from ${escapeHtml(formatShortTime(trace.upload.received_at))}</p>
            </div>
            <span class="trace-badge ${trace.source}">${trace.source === "replay" ? "Replay" : "Live"}</span>
          </div>
          <div class="trace-progress">
            <div class="trace-progress-bar" style="width: ${progress}%"></div>
          </div>
          <ul class="trace-events">${events}</ul>
        </article>
      `;
    })
    .join("");
}

function renderAll() {
  renderStageCards();
  renderTrackToken();
  renderStats();
  renderInspector();
  renderTraceList();
  elements.sourceUrlInput.value = state.sourceUrl;
  elements.sourceHint.textContent = `Polling ${state.sourceUrl}/uploads.json every ${Math.round(POLL_INTERVAL_MS / 1000)} seconds.`;
}

function updateTrace(traceId, updater) {
  state.traces = state.traces.map((trace) => (trace.id === traceId ? updater(trace) : trace));
  renderAll();
}

function advanceTrace(traceId, nextStageIndex) {
  updateTrace(traceId, (trace) => {
    const stage = liveStages[nextStageIndex];
    const eventTime = new Date().toISOString();
    return {
      ...trace,
      currentStageIndex: nextStageIndex,
      completed: nextStageIndex === liveStages.length - 1,
      history: trace.history.concat([{ stageId: stage.id, at: eventTime }]),
    };
  });

  if (nextStageIndex >= liveStages.length - 1) {
    return;
  }

  const timerId = window.setTimeout(() => {
    timers.delete(timerId);
    advanceTrace(traceId, nextStageIndex + 1);
  }, STAGE_ADVANCE_MS);

  timers.add(timerId);
}

function startTrace(upload, source) {
  if (!upload) {
    return;
  }

  const traceId = `${source}-${upload.id}-${Date.now()}`;
  const startedAt = new Date().toISOString();

  const trace = {
    id: traceId,
    source,
    upload,
    currentStageIndex: 0,
    completed: false,
    history: [{ stageId: liveStages[0].id, at: startedAt }],
  };

  state.trackedPackets += 1;
  state.traces = [trace].concat(state.traces).slice(0, MAX_TRACES);
  renderAll();

  const timerId = window.setTimeout(() => {
    timers.delete(timerId);
    advanceTrace(traceId, 1);
  }, STAGE_ADVANCE_MS);

  timers.add(timerId);
}

async function pollUploads() {
  try {
    const response = await fetch(`${state.sourceUrl}/uploads.json`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const uploads = await response.json();
    const latestUpload = Array.isArray(uploads) && uploads.length > 0 ? uploads[0] : null;

    state.connectionStatus = "live";
    state.lastPollAt = new Date().toISOString();
    state.latestUpload = latestUpload;

    if (!state.bootstrapped) {
      (Array.isArray(uploads) ? uploads : []).forEach((upload) => seenUploadIds.add(upload.id));
      state.bootstrapped = true;
      renderAll();
      return;
    }

    const newUploads = (Array.isArray(uploads) ? uploads : [])
      .filter((upload) => !seenUploadIds.has(upload.id))
      .sort((left, right) => left.id - right.id);

    newUploads.forEach((upload) => {
      seenUploadIds.add(upload.id);
      startTrace(upload, "live");
    });

    renderAll();
  } catch (error) {
    state.connectionStatus = "offline";
    state.lastPollAt = new Date().toISOString();
    renderAll();
  }
}

function connectSource() {
  state.sourceUrl = normalizeSourceUrl(elements.sourceUrlInput.value);
  localStorage.setItem("spectron_pipeline_source", state.sourceUrl);
  state.bootstrapped = false;
  seenUploadIds.clear();
  renderAll();
  pollUploads();
}

function replayLatestPacket() {
  if (!state.latestUpload) {
    alert("No packet has been seen yet. Let the ingest server receive one first.");
    return;
  }

  startTrace(state.latestUpload, "replay");
}

function clearHistory() {
  clearTimers();
  state.traces = [];
  state.trackedPackets = 0;
  renderAll();
}

function attachEvents() {
  elements.saveSourceButton.addEventListener("click", connectSource);
  elements.replayButton.addEventListener("click", replayLatestPacket);
  elements.clearButton.addEventListener("click", clearHistory);
  elements.sourceUrlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      connectSource();
    }
  });
}

function bootstrap() {
  attachEvents();
  renderAll();
  pollUploads();
  window.setInterval(pollUploads, POLL_INTERVAL_MS);
}

bootstrap();
