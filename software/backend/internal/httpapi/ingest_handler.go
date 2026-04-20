package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"spectron-backend/internal/iot"
)

type IngestHandler struct {
	db        *pgxpool.Pool
	publisher iot.RawReadingsPublisher
}

func NewIngestHandler(db *pgxpool.Pool, publisher iot.RawReadingsPublisher) *IngestHandler {
	if publisher == nil {
		publisher = iot.NewDisabledPublisher("raw readings publisher is not configured")
	}

	return &IngestHandler{
		db:        db,
		publisher: publisher,
	}
}

func (h *IngestHandler) Upload(w http.ResponseWriter, r *http.Request) {
	var req iot.UploadRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := iot.ValidateUploadRequest(req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	deviceID := strings.TrimSpace(req.DeviceID)
	var controllerID uuid.UUID
	err := h.db.QueryRow(r.Context(), `
		SELECT id
		FROM controllers
		WHERE hw_id = $1
	`, deviceID).Scan(&controllerID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			http.Error(w, "unknown controller", http.StatusNotFound)
			return
		}
		http.Error(w, "failed to resolve controller", http.StatusInternalServerError)
		return
	}

	receivedAt := time.Now().UTC()
	event := iot.BuildRawReadingsEvent(req, receivedAt)
	if err := h.publisher.PublishRawReadings(r.Context(), event); err != nil {
		if errors.Is(err, iot.ErrProducerDisabled) {
			http.Error(w, err.Error(), http.StatusServiceUnavailable)
			return
		}
		http.Error(w, "failed to queue sensor data", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":           true,
		"queued":       true,
		"controller_id": controllerID,
		"device_id":    event.DeviceID,
		"event_id":     event.EventID,
		"reading_time": event.ReadingTime,
		"received_at":  event.ReceivedAt,
		"sensor_count": len(event.Sensors),
	})
}
