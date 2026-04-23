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
		"ok":            true,
		"queued":        true,
		"controller_id": controllerID,
		"device_id":     event.DeviceID,
		"event_id":      event.EventID,
		"reading_time":  event.ReadingTime,
		"received_at":   event.ReceivedAt,
		"sensor_count":  len(event.Sensors),
	})
}

func (h *IngestHandler) Discover(w http.ResponseWriter, r *http.Request) {
	var req iot.SensorDiscoveryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := iot.ValidateSensorDiscoveryRequest(req); err != nil {
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

	discoveredAt := iot.ResolveReadingTime(req.TS, time.Now().UTC())
	tx, err := h.db.Begin(r.Context())
	if err != nil {
		http.Error(w, "failed to begin discovery", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	_, err = tx.Exec(r.Context(), `
		UPDATE controllers
		SET status = 'ONLINE',
		    last_seen = $2
		WHERE id = $1
	`, controllerID, discoveredAt)
	if err != nil {
		http.Error(w, "failed to update controller discovery status", http.StatusInternalServerError)
		return
	}

	for _, sensor := range req.Sensors {
		sensorHWID := strings.TrimSpace(sensor.ID)
		sensorType := strings.TrimSpace(sensor.Type)
		defaultName := "Sensor " + sensorHWID
		name := nullableTrimmed(sensor.Name)
		unit := nullableTrimmed(sensor.Unit)

		_, err = tx.Exec(r.Context(), `
			INSERT INTO sensors (id, controller_id, hw_id, type, name, unit, status, last_seen)
			VALUES ($1, $2, $3, $4, COALESCE($5, $6), $7, 'OK', $8)
			ON CONFLICT (controller_id, hw_id) DO UPDATE
			SET type = EXCLUDED.type,
			    name = COALESCE($5, sensors.name),
			    unit = COALESCE($7, sensors.unit),
			    status = 'OK',
			    last_seen = EXCLUDED.last_seen
		`, uuid.New(), controllerID, sensorHWID, sensorType, name, defaultName, unit, discoveredAt)
		if err != nil {
			http.Error(w, "failed to register sensor list", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(r.Context()); err != nil {
		http.Error(w, "failed to save sensor discovery", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"ok":            true,
		"discovered":    true,
		"controller_id": controllerID,
		"device_id":     deviceID,
		"sensor_count":  len(req.Sensors),
		"discovered_at": discoveredAt,
	})
}

func nullableTrimmed(value string) *string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
