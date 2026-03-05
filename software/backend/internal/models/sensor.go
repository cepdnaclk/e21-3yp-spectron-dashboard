package models

import (
	"time"

	"github.com/google/uuid"
)

type Sensor struct {
	ID           uuid.UUID  `json:"id"`
	ControllerID uuid.UUID  `json:"controller_id"`
	HWID         string     `json:"hw_id"`
	Type         string     `json:"type"`
	Name         *string    `json:"name,omitempty"`
	Purpose      *string    `json:"purpose,omitempty"`
	Unit         *string    `json:"unit,omitempty"`
	Status       string     `json:"status"` // OK, OFFLINE, ERROR
	ConfigActive bool       `json:"config_active"`
	LastSeen     *time.Time `json:"last_seen,omitempty"`
}

type SensorConfig struct {
	FriendlyName         string                     `json:"friendly_name"`
	Thresholds           ThresholdConfig            `json:"thresholds"`
	MetricThresholds     map[string]ThresholdConfig `json:"metric_thresholds,omitempty"`
	ReportIntervalPerDay int                        `json:"report_interval_per_day"`
	PowerManagement      PowerManagementConfig      `json:"power_management"`
}

type ThresholdConfig struct {
	Min        *float64 `json:"min,omitempty"`
	Max        *float64 `json:"max,omitempty"`
	WarningMin *float64 `json:"warning_min,omitempty"`
	WarningMax *float64 `json:"warning_max,omitempty"`
}

type PowerManagementConfig struct {
	BatteryLifeDays   int `json:"battery_life_days"`
	SamplingFrequency int `json:"sampling_frequency"`
}

type AISuggestRequest struct {
	Purpose                string `json:"purpose"`
	DesiredBatteryLifeDays *int   `json:"desired_battery_life_days,omitempty"`
	SamplingPreferences    *struct {
		Frequency *string `json:"frequency,omitempty"` // low, medium, high
	} `json:"sampling_preferences,omitempty"`
}

type AISuggestResponse struct {
	SuggestedConfig SensorConfig `json:"suggested_config"`
	Explanation     string       `json:"explanation"`
}
