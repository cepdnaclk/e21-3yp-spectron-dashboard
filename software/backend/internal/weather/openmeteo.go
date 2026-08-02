package weather

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

type Client struct {
	HTTP    *http.Client
	BaseURL string
}

func NewClient() *Client {
	return &Client{HTTP: &http.Client{Timeout: 10 * time.Second}, BaseURL: "https://api.open-meteo.com/v1/forecast"}
}

func (c *Client) CurrentSummary(ctx context.Context, latitude, longitude float64) (string, error) {
	q := url.Values{}
	q.Set("latitude", fmt.Sprintf("%.6f", latitude))
	q.Set("longitude", fmt.Sprintf("%.6f", longitude))
	q.Set("current", "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m")
	q.Set("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum")
	q.Set("forecast_days", "2")
	q.Set("timezone", "auto")
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.BaseURL+"?"+q.Encode(), nil)
	if err != nil {
		return "", err
	}
	resp, err := c.HTTP.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("weather returned %s", resp.Status)
	}
	var payload struct {
		Current struct {
			Time          string  `json:"time"`
			Temperature   float64 `json:"temperature_2m"`
			Humidity      float64 `json:"relative_humidity_2m"`
			Precipitation float64 `json:"precipitation"`
			WeatherCode   int     `json:"weather_code"`
			WindSpeed     float64 `json:"wind_speed_10m"`
		} `json:"current"`
		Daily struct {
			Time             []string  `json:"time"`
			TemperatureMax   []float64 `json:"temperature_2m_max"`
			TemperatureMin   []float64 `json:"temperature_2m_min"`
			PrecipitationSum []float64 `json:"precipitation_sum"`
		} `json:"daily"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return "", err
	}
	summary := fmt.Sprintf(
		"Observed at %s: %s, temperature %.1f C, relative humidity %.0f%%, current precipitation %.1f mm, wind %.1f km/h.",
		payload.Current.Time,
		weatherDescription(payload.Current.WeatherCode),
		payload.Current.Temperature,
		payload.Current.Humidity,
		payload.Current.Precipitation,
		payload.Current.WindSpeed,
	)
	if len(payload.Daily.Time) > 0 && len(payload.Daily.TemperatureMin) > 0 && len(payload.Daily.TemperatureMax) > 0 && len(payload.Daily.PrecipitationSum) > 0 {
		summary += fmt.Sprintf(
			" Forecast for %s: minimum %.1f C, maximum %.1f C, total precipitation %.1f mm.",
			payload.Daily.Time[0],
			payload.Daily.TemperatureMin[0],
			payload.Daily.TemperatureMax[0],
			payload.Daily.PrecipitationSum[0],
		)
	}
	return summary, nil
}

func weatherDescription(code int) string {
	switch {
	case code == 0:
		return "clear sky"
	case code == 1:
		return "mainly clear"
	case code == 2:
		return "partly cloudy"
	case code == 3:
		return "overcast"
	case code == 45 || code == 48:
		return "fog"
	case code >= 51 && code <= 57:
		return "drizzle"
	case code >= 61 && code <= 67:
		return "rain"
	case code >= 71 && code <= 77:
		return "snow"
	case code >= 80 && code <= 82:
		return "rain showers"
	case code >= 85 && code <= 86:
		return "snow showers"
	case code >= 95 && code <= 99:
		return "thunderstorm"
	default:
		return "unclassified conditions"
	}
}
