package config

import (
	"net/url"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

const DefaultDevJWTSecret = "dev-only-change-me"

type Config struct {
	HTTPPort       string
	DatabaseURL    string
	JWTSecret      string
	AllowedOrigins []string
}

func Load() (*Config, error) {
	// Load .env if present; ignore error if file is missing
	_ = godotenv.Load()

	httpPort := getenv("PORT", "")
	if httpPort == "" {
		httpPort = getenv("HTTP_PORT", "8080")
	}
	dbURL := os.Getenv("DATABASE_URL")
	jwtSecret := getenv("JWT_SECRET", DefaultDevJWTSecret)
	allowedOrigins := parseAllowedOrigins(os.Getenv("ALLOWED_ORIGINS"))

	if dbURL == "" {
		// For local development and cloud deployments you can set individual parts instead.
		dbURL = buildDBURL()
	}

	return &Config{
		HTTPPort:       httpPort,
		DatabaseURL:    dbURL,
		JWTSecret:      jwtSecret,
		AllowedOrigins: allowedOrigins,
	}, nil
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func buildDBURL() string {
	host := getenv("DB_HOST", "localhost")
	port := getenv("DB_PORT", "5432")
	user := getenv("DB_USER", "spectron")
	pass := getenv("DB_PASSWORD", "spectron")
	name := getenv("DB_NAME", "spectron")
	sslMode := getenv("DB_SSLMODE", "disable")

	u := &url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(user, pass),
		Host:   host + ":" + port,
		Path:   "/" + name,
	}

	query := url.Values{}
	query.Set("sslmode", sslMode)
	u.RawQuery = query.Encode()

	return u.String()
}

func parseAllowedOrigins(raw string) []string {
	if strings.TrimSpace(raw) == "" {
		return []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:3001",
		}
	}

	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		origin := strings.TrimSpace(part)
		if origin == "" {
			continue
		}
		origins = append(origins, origin)
	}

	if len(origins) == 0 {
		return []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:3001",
		}
	}

	return origins
}
