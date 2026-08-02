package weather

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCurrentSummary(t *testing.T) {
	s := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"current":{"time":"2026-07-18T10:00","temperature_2m":29.2,"relative_humidity_2m":78,"precipitation":0.4,"weather_code":61,"wind_speed_10m":12.3},"daily":{"time":["2026-07-18"],"temperature_2m_max":[31.5],"temperature_2m_min":[24.1],"precipitation_sum":[8.2]}}`))
	}))
	defer s.Close()
	c := &Client{HTTP: s.Client(), BaseURL: s.URL}
	summary, err := c.CurrentSummary(context.Background(), 7.1, 80.2)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(summary, "29.2 C") || !strings.Contains(summary, "78%") || !strings.Contains(summary, "rain") || !strings.Contains(summary, "8.2 mm") {
		t.Fatalf("unexpected summary: %s", summary)
	}
}
