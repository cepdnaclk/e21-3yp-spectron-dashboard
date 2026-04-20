package iot

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RawReadingsProcessor struct {
	db *pgxpool.Pool
}

func NewRawReadingsProcessor(db *pgxpool.Pool) *RawReadingsProcessor {
	return &RawReadingsProcessor{db: db}
}

func (p *RawReadingsProcessor) ProcessEvent(ctx context.Context, event RawReadingsEvent) error {
	tx, err := p.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var controllerID uuid.UUID
	err = tx.QueryRow(ctx, `
		SELECT id
		FROM controllers
		WHERE hw_id = $1
	`, event.DeviceID).Scan(&controllerID)
	if err != nil {
		return fmt.Errorf("find controller %s: %w", event.DeviceID, err)
	}

	_, err = tx.Exec(ctx, `
		UPDATE controllers
		SET status = 'ONLINE',
		    last_seen = $2
		WHERE id = $1
	`, controllerID, event.ReadingTime)
	if err != nil {
		return fmt.Errorf("update controller status: %w", err)
	}

	for _, sensor := range event.Sensors {
		if err := p.upsertSensorReading(ctx, tx, controllerID, event, sensor); err != nil {
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit tx: %w", err)
	}

	return nil
}

func (p *RawReadingsProcessor) upsertSensorReading(ctx context.Context, tx pgx.Tx, controllerID uuid.UUID, event RawReadingsEvent, sensor RawReadingsMessage) error {
	sensorHWID := strings.TrimSpace(sensor.HWID)
	sensorType := strings.TrimSpace(sensor.Type)
	sensorName := fmt.Sprintf("Sensor %s", sensorHWID)
	sensorID := uuid.New()

	var persistedSensorID uuid.UUID
	err := tx.QueryRow(ctx, `
		INSERT INTO sensors (id, controller_id, hw_id, type, name, status, last_seen)
		VALUES ($1, $2, $3, $4, $5, 'OK', $6)
		ON CONFLICT (controller_id, hw_id) DO UPDATE
		SET type = EXCLUDED.type,
		    name = COALESCE(sensors.name, EXCLUDED.name),
		    status = 'OK',
		    last_seen = EXCLUDED.last_seen
		RETURNING id
	`, sensorID, controllerID, sensorHWID, sensorType, sensorName, event.ReadingTime).Scan(&persistedSensorID)
	if err != nil {
		return fmt.Errorf("upsert sensor %s: %w", sensorHWID, err)
	}

	meta, err := json.Marshal(map[string]any{
		"event_id":      event.EventID,
		"device_id":     event.DeviceID,
		"sensor_hw_id":  sensorHWID,
		"sensor_type":   sensorType,
		"received_at":   event.ReceivedAt,
		"reading_time":  event.ReadingTime,
		"timestamp_raw": event.TimestampRaw,
		"source":        event.Source,
	})
	if err != nil {
		return fmt.Errorf("marshal reading metadata: %w", err)
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO sensor_readings (time, sensor_id, value, meta)
		VALUES ($1, $2, $3, $4::jsonb)
		ON CONFLICT (time, sensor_id) DO UPDATE
		SET value = EXCLUDED.value,
		    meta = EXCLUDED.meta
	`, event.ReadingTime, persistedSensorID, sensor.Value, meta)
	if err != nil {
		return fmt.Errorf("insert sensor reading %s: %w", sensorHWID, err)
	}

	return nil
}
