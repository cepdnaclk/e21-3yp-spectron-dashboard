package advisor

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestGroqProviderParsesStructuredAdvice(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Fatalf("missing authorization")
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"choices":[{"message":{"content":"{\"status\":\"NEEDS_ATTENTION\",\"summary\":\"Inspect leaves\",\"actions_now\":[\"Check lower leaves\"],\"monitor_next\":[],\"confidence\":\"MEDIUM\"}"}}]}`))
	}))
	defer server.Close()
	p := &GroqProvider{Key: "test-key", Model: "test-model", BaseURL: server.URL, Client: server.Client()}
	result, err := p.Generate(context.Background(), Request{Crop: "Tomato", Observation: "Leaf spots"})
	if err != nil {
		t.Fatal(err)
	}
	if result.Summary != "Inspect leaves" || result.Status != "NEEDS_ATTENTION" {
		t.Fatalf("unexpected result: %+v", result)
	}
}

func TestGroqProviderRequiresKey(t *testing.T) {
	p := &GroqProvider{}
	if _, err := p.Generate(context.Background(), Request{}); err == nil {
		t.Fatal("expected missing key error")
	}
}

func TestGroqProviderAcceptsFencedJSONAndNormalizesFields(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte("{\"choices\":[{\"message\":{\"content\":\"```json\\n{\\\"status\\\":\\\"needs_attention\\\",\\\"summary\\\":\\\"Inspect leaves\\\",\\\"confidence\\\":\\\"unexpected\\\"}\\n```\"}}]}"))
	}))
	defer server.Close()
	p := &GroqProvider{Key: "test-key", Model: "test-model", BaseURL: server.URL, Client: server.Client()}
	result, err := p.Generate(context.Background(), Request{Crop: "Tomato", Observation: "Leaf spots"})
	if err != nil {
		t.Fatal(err)
	}
	if result.Status != "NEEDS_ATTENTION" || result.Confidence != "LOW" || result.ActionsNow == nil || result.MonitorNext == nil {
		t.Fatalf("unexpected normalized result: %+v", result)
	}
}

func TestGroqProviderAcceptsTextLists(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"choices":[{"message":{"content":"{\"status\":\"WAIT_AND_WATCH\",\"summary\":\"Inspect leaves\",\"recheck\":[\"Check tomorrow.\",\"Compare new leaves.\"],\"confidence\":\"LOW\"}"}}]}`))
	}))
	defer server.Close()
	p := &GroqProvider{Key: "test-key", Model: "test-model", BaseURL: server.URL, Client: server.Client()}
	result, err := p.Generate(context.Background(), Request{Crop: "Tomato", Observation: "Yellow leaves"})
	if err != nil {
		t.Fatal(err)
	}
	if string(result.Recheck) != "Check tomorrow. Compare new leaves." {
		t.Fatalf("unexpected recheck: %q", result.Recheck)
	}
}

func TestGeminiProviderParsesStructuredAdvice(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("x-goog-api-key") != "gemini-test-key" {
			t.Fatalf("missing Gemini API key")
		}
		if r.URL.Path != "/v1beta/models/test-gemini:generateContent" {
			t.Fatalf("unexpected Gemini path: %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"candidates":[{"content":{"parts":[{"text":"{\"status\":\"GOOD\",\"headline\":\"Field looks stable\",\"do_now\":[],\"check_next\":[],\"confidence\":\"HIGH\"}"}]}}]}`))
	}))
	defer server.Close()
	p := &GeminiProvider{Key: "gemini-test-key", Model: "test-gemini", BaseURL: server.URL + "/v1beta", Client: server.Client()}
	result, err := p.Generate(context.Background(), Request{Crop: "Paddy", Observation: "No visible change"})
	if err != nil {
		t.Fatal(err)
	}
	if result.Status != "GOOD" || result.Headline != "Field looks stable" {
		t.Fatalf("unexpected Gemini result: %+v", result)
	}
}

func TestGroqProviderLive(t *testing.T) {
	if os.Getenv("ADVISOR_LIVE_TEST") != "1" {
		t.Skip("set ADVISOR_LIVE_TEST=1 to run the hosted advisor test")
	}
	p := NewGroqProvider()
	result, err := p.Generate(context.Background(), Request{
		Crop:          "Tomato",
		Stage:         "Vegetative growth",
		Observation:   "Older lower leaves are yellow between the veins. No insects or dark spots are visible.",
		SensorSummary: "No recent field sensor readings are available. Do not infer sensor conditions.",
		WeatherSummary: "Current weather data is temporarily unavailable. " +
			"Do not infer weather conditions.",
		CropContext: []map[string]any{
			{"category": "disease", "topic": "Early blight", "content": "Early blight can produce dark lesions with concentric rings."},
			{"category": "irrigation", "topic": "Water confirmation", "content": "Check root-zone moisture before recommending irrigation."},
			{"category": "observation", "topic": "Yellow leaves", "content": "Interveinal yellowing can have several causes; confirm moisture and fertilizer history."},
		},
	})
	if err != nil {
		t.Fatalf("live advisor request failed: %v", err)
	}
	if result.Summary == "" || result.Status == "" {
		t.Fatalf("live advisor returned incomplete result: %+v", result)
	}
	t.Logf("live advisor status=%s confidence=%s summary=%s", result.Status, result.Confidence, result.Summary)
}
