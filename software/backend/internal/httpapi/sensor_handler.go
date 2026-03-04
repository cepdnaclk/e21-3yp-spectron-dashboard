package httpapi

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"spectron-backend/internal/models"
)

type SensorHandler struct {
	db *pgxpool.Pool
}

func NewSensorHandler(db *pgxpool.Pool) *SensorHandler {
	return &SensorHandler{db: db}
}

func (h *SensorHandler) List(w http.ResponseWriter, r *http.Request) {
	controllerID, err := uuid.Parse(chi.URLParam(r, "controllerId"))
	if err != nil {
		http.Error(w, "invalid controller id", http.StatusBadRequest)
		return
	}

	accountID := GetAccountID(r).(uuid.UUID)

	// Verify controller belongs to account
	var controllerAccountID uuid.UUID
	err = h.db.QueryRow(r.Context(), `
		SELECT account_id FROM controllers WHERE id = $1
	`, controllerID).Scan(&controllerAccountID)
	if err != nil {
		http.Error(w, "controller not found", http.StatusNotFound)
		return
	}
	if controllerAccountID != accountID {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(r.Context(), `
		SELECT id, controller_id, hw_id, type, name, purpose, unit, status, last_seen
		FROM sensors
		WHERE controller_id = $1
		ORDER BY last_seen DESC NULLS LAST, hw_id ASC
	`, controllerID)
	if err != nil {
		http.Error(w, "database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var sensors []models.Sensor
	for rows.Next() {
		var s models.Sensor
		err := rows.Scan(&s.ID, &s.ControllerID, &s.HWID, &s.Type, &s.Name, &s.Purpose, &s.Unit, &s.Status, &s.LastSeen)
		if err != nil {
			continue
		}
		sensors = append(sensors, s)
	}

	json.NewEncoder(w).Encode(sensors)
}

func (h *SensorHandler) Get(w http.ResponseWriter, r *http.Request) {
	sensorID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid sensor id", http.StatusBadRequest)
		return
	}

	accountID := GetAccountID(r).(uuid.UUID)

	var s models.Sensor
	err = h.db.QueryRow(r.Context(), `
		SELECT s.id, s.controller_id, s.hw_id, s.type, s.name, s.purpose, s.unit, s.status, s.last_seen
		FROM sensors s
		JOIN controllers c ON s.controller_id = c.id
		WHERE s.id = $1 AND c.account_id = $2
	`, sensorID, accountID).Scan(&s.ID, &s.ControllerID, &s.HWID, &s.Type, &s.Name, &s.Purpose, &s.Unit, &s.Status, &s.LastSeen)
	if err != nil {
		http.Error(w, "sensor not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(s)
}

func (h *SensorHandler) AISuggestConfig(w http.ResponseWriter, r *http.Request) {
	sensorID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid sensor id", http.StatusBadRequest)
		return
	}

	var req models.AISuggestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Get sensor info
	var sensorType string
	err = h.db.QueryRow(r.Context(), `
		SELECT type FROM sensors WHERE id = $1
	`, sensorID).Scan(&sensorType)
	if err != nil {
		http.Error(w, "sensor not found", http.StatusNotFound)
		return
	}

	// Simple AI suggestion logic (in production, this would call an AI service)
	suggestedConfig := h.generateAISuggestion(sensorType, req)

	response := models.AISuggestResponse{
		SuggestedConfig: suggestedConfig,
		Explanation:     "Configuration suggested based on your purpose and sensor type.",
	}

	json.NewEncoder(w).Encode(response)
}

func (h *SensorHandler) generateAISuggestion(sensorType string, req models.AISuggestRequest) models.SensorConfig {
	// Default values
	reportsPerDay := 24

	if req.DesiredBatteryLifeDays != nil {
		desired := *req.DesiredBatteryLifeDays
		if desired > 0 {
			reportsPerDay = 720 / desired // 720 = 30 days * 24 reports
		}
	}

	if reportsPerDay < 1 {
		reportsPerDay = 1
	}
	if reportsPerDay > 144 {
		reportsPerDay = 144 // Max 144 reports per day (every 10 minutes)
	}

	// Generate friendly name from purpose
	friendlyName := "Sensor"
	if len(req.Purpose) > 0 {
		// Simple extraction: take first few words
		words := strings.Fields(req.Purpose)
		if len(words) > 0 {
			friendlyName = strings.Join(words[:min(3, len(words))], " ")
		}
	}

	// Default thresholds based on sensor type
	metricThresholds := map[string]models.ThresholdConfig{}
	var thresholds models.ThresholdConfig
	metricCount := 1
	switch sensorType {
	case "temperature":
		thresholds = models.ThresholdConfig{
			Min:        floatPtr(18.0),
			Max:        floatPtr(25.0),
			WarningMin: floatPtr(15.0),
			WarningMax: floatPtr(28.0),
		}
		metricThresholds["temperature"] = thresholds
	case "humidity":
		thresholds = models.ThresholdConfig{
			Min:        floatPtr(30.0),
			Max:        floatPtr(70.0),
			WarningMin: floatPtr(20.0),
			WarningMax: floatPtr(80.0),
		}
		metricThresholds["humidity"] = thresholds
	case "temperature_humidity", "temp_humidity", "dht11", "dht22":
		metricCount = 2
		metricThresholds["temperature"] = models.ThresholdConfig{
			Min:        floatPtr(18.0),
			Max:        floatPtr(25.0),
			WarningMin: floatPtr(15.0),
			WarningMax: floatPtr(28.0),
		}
		metricThresholds["humidity"] = models.ThresholdConfig{
			Min:        floatPtr(30.0),
			Max:        floatPtr(70.0),
			WarningMin: floatPtr(20.0),
			WarningMax: floatPtr(80.0),
		}
		thresholds = metricThresholds["temperature"]
	case "ultrasonic":
		thresholds = models.ThresholdConfig{
			Max:        floatPtr(80.0), // 80% full
			WarningMax: floatPtr(90.0),
		}
		metricThresholds["fill_level"] = thresholds
	case "air_quality":
		thresholds = models.ThresholdConfig{
			Max:        floatPtr(120.0),
			WarningMax: floatPtr(100.0),
		}
		metricThresholds["aqi"] = thresholds
	default:
		thresholds = models.ThresholdConfig{}
		metricThresholds["value"] = thresholds
	}

	batteryLifeDays := estimateBatteryLifeDays(reportsPerDay, metricCount)

	return models.SensorConfig{
		FriendlyName:         friendlyName,
		Thresholds:           thresholds,
		MetricThresholds:     metricThresholds,
		ReportIntervalPerDay: reportsPerDay,
		PowerManagement: models.PowerManagementConfig{
			BatteryLifeDays:   batteryLifeDays,
			SamplingFrequency: reportsPerDay,
		},
	}
}

func estimateBatteryLifeDays(reportsPerDay int, metricCount int) int {
	if reportsPerDay < 1 {
		reportsPerDay = 1
	}
	if metricCount < 1 {
		metricCount = 1
	}

	const batteryCapacityMah = 2400.0
	const standbyMahPerDay = 2.0
	const txMahPerReportPerMetric = 0.6

	dailyConsumption := standbyMahPerDay + (float64(reportsPerDay) * float64(metricCount) * txMahPerReportPerMetric)
	if dailyConsumption <= 0 {
		return 365
	}

	batteryDays := int(batteryCapacityMah / dailyConsumption)
	if batteryDays < 1 {
		return 1
	}
	if batteryDays > 730 {
		return 730
	}

	return batteryDays
}

func (h *SensorHandler) SaveConfig(w http.ResponseWriter, r *http.Request) {
	sensorID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid sensor id", http.StatusBadRequest)
		return
	}

	accountID := GetAccountID(r).(uuid.UUID)

	// Verify sensor belongs to account
	var controllerID uuid.UUID
	err = h.db.QueryRow(r.Context(), `
		SELECT s.controller_id
		FROM sensors s
		JOIN controllers c ON s.controller_id = c.id
		WHERE s.id = $1 AND c.account_id = $2
	`, sensorID, accountID).Scan(&controllerID)
	if err != nil {
		http.Error(w, "sensor not found", http.StatusNotFound)
		return
	}

	var config models.SensorConfig
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Convert config to JSON
	configJSON, err := json.Marshal(config)
	if err != nil {
		http.Error(w, "failed to marshal config", http.StatusInternalServerError)
		return
	}

	// Save config
	_, err = h.db.Exec(r.Context(), `
		INSERT INTO sensor_configs (sensor_id, config_json, active)
		VALUES ($1, $2, true)
		ON CONFLICT (sensor_id) DO UPDATE SET config_json = $2, active = true
	`, sensorID, configJSON)
	if err != nil {
		http.Error(w, "failed to save config", http.StatusInternalServerError)
		return
	}

	// Update sensor name and purpose
	_, err = h.db.Exec(r.Context(), `
		UPDATE sensors
		SET name = $1, purpose = $2
		WHERE id = $3
	`, config.FriendlyName, "", sensorID) // Purpose can be stored separately if needed
	if err != nil {
		// Non-critical error
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func floatPtr(f float64) *float64 {
	return &f
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
