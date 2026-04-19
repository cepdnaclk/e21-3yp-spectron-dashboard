package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"

	"spectron-backend/internal/auth"
	"spectron-backend/internal/config"
	"spectron-backend/internal/db"
	"spectron-backend/internal/httpapi"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}
	if cfg.JWTSecret == config.DefaultDevJWTSecret {
		log.Println("WARNING: using default development JWT secret. Set JWT_SECRET before deploying to AWS.")
	}

	pool, err := db.NewPool(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("connect db: %v", err)
	}
	defer pool.Close()

	if err := db.ApplyStartupMigrations(context.Background(), pool); err != nil {
		log.Fatalf("apply startup migrations: %v", err)
	}

	auth.SetJWTSecret(cfg.JWTSecret)

	r := chi.NewRouter()
	httpapi.RegisterRoutes(r, pool, cfg.AllowedOrigins)

	srv := &http.Server{
		Addr:         "0.0.0.0:" + cfg.HTTPPort, // Listen on all interfaces for mobile access
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("API server listening on 0.0.0.0:%s", cfg.HTTPPort)
		log.Printf("Mobile app should connect to: http://<your-ip>:%s", cfg.HTTPPort)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()

	// graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("server shutdown error: %v", err)
	}
}
