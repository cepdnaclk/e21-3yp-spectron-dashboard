package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	HTTPPort    string
	DatabaseURL string
}

func Load() (*Config, error) {
	// Load .env if present; ignore error if file is missing
	_ = godotenv.Load()

	httpPort := getenv("HTTP_PORT", "8080")
	dbURL := os.Getenv("DATABASE_URL")

	if dbURL == "" {
		// For local development you can set individual parts instead
		dbURL = buildLocalDBURL()
	}

	return &Config{
		HTTPPort:    httpPort,
		DatabaseURL: dbURL,
	}, nil
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func buildLocalDBURL() string {
	host := getenv("DB_HOST", "localhost")
	port := getenv("DB_PORT", "5432")
	user := getenv("DB_USER", "spectron")
	pass := getenv("DB_PASSWORD", "spectron")
	name := getenv("DB_NAME", "spectron")

	return "postgres://" + user + ":" + pass + "@" + host + ":" + port + "/" + name + "?sslmode=disable"
}

