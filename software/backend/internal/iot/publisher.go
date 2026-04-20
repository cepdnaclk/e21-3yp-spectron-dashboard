package iot

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/segmentio/kafka-go"
)

var ErrProducerDisabled = errors.New("raw readings producer is disabled")

type RawReadingsPublisher interface {
	PublishRawReadings(ctx context.Context, event RawReadingsEvent) error
	Close() error
}

type DisabledPublisher struct {
	reason string
}

func NewDisabledPublisher(reason string) *DisabledPublisher {
	return &DisabledPublisher{reason: strings.TrimSpace(reason)}
}

func (p *DisabledPublisher) PublishRawReadings(context.Context, RawReadingsEvent) error {
	if p.reason == "" {
		return ErrProducerDisabled
	}
	return fmt.Errorf("%w: %s", ErrProducerDisabled, p.reason)
}

func (p *DisabledPublisher) Close() error {
	return nil
}

type KafkaPublisher struct {
	writer *kafka.Writer
}

func NewKafkaPublisher(brokers []string, topic string) RawReadingsPublisher {
	trimmedTopic := strings.TrimSpace(topic)
	if len(brokers) == 0 || trimmedTopic == "" {
		return NewDisabledPublisher("configure KAFKA_BROKERS and KAFKA_RAW_READINGS_TOPIC to enable device ingest")
	}

	return &KafkaPublisher{
		writer: &kafka.Writer{
			Addr:         kafka.TCP(brokers...),
			Topic:        trimmedTopic,
			Balancer:     &kafka.Hash{},
			RequiredAcks: kafka.RequireOne,
			Async:        false,
			BatchTimeout: 250 * time.Millisecond,
		},
	}
}

func (p *KafkaPublisher) PublishRawReadings(ctx context.Context, event RawReadingsEvent) error {
	payload, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("marshal raw readings event: %w", err)
	}

	err = p.writer.WriteMessages(ctx, kafka.Message{
		Key:   []byte(event.DeviceID),
		Time:  event.ReceivedAt,
		Value: payload,
		Headers: []kafka.Header{
			{Key: "event_id", Value: []byte(event.EventID)},
			{Key: "device_id", Value: []byte(event.DeviceID)},
		},
	})
	if err != nil {
		return fmt.Errorf("publish raw readings event: %w", err)
	}

	return nil
}

func (p *KafkaPublisher) Close() error {
	if p == nil || p.writer == nil {
		return nil
	}
	return p.writer.Close()
}
