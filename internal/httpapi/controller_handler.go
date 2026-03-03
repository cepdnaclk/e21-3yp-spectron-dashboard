package httpapi

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"spectron-backend/internal/models"
)

type ControllerHandler struct {
	db *pgxpool.Pool
}

func NewControllerHandler(db *pgxpool.Pool) *ControllerHandler {
	return &ControllerHandler{db: db}
}

func (h *ControllerHandler) List(w http.ResponseWriter, r *http.Request) {
	accountID := GetAccountID(r).(uuid.UUID)

	rows, err := h.db.Query(r.Context(), `
		SELECT id, account_id, hw_id, name, purpose, location, status, last_seen, created_at
		FROM controllers
		WHERE account_id = $1
		ORDER BY created_at DESC
	`, accountID)
	if err != nil {
		http.Error(w, "database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var controllers []models.Controller
	for rows.Next() {
		var c models.Controller
		err := rows.Scan(&c.ID, &c.AccountID, &c.HWID, &c.Name, &c.Purpose, &c.Location, &c.Status, &c.LastSeen, &c.CreatedAt)
		if err != nil {
			continue
		}
		controllers = append(controllers, c)
	}

	json.NewEncoder(w).Encode(controllers)
}

func (h *ControllerHandler) Get(w http.ResponseWriter, r *http.Request) {
	controllerID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid controller id", http.StatusBadRequest)
		return
	}

	accountID := GetAccountID(r).(uuid.UUID)

	var c models.Controller
	err = h.db.QueryRow(r.Context(), `
		SELECT id, account_id, hw_id, name, purpose, location, status, last_seen, created_at
		FROM controllers
		WHERE id = $1 AND account_id = $2
	`, controllerID, accountID).Scan(&c.ID, &c.AccountID, &c.HWID, &c.Name, &c.Purpose, &c.Location, &c.Status, &c.LastSeen, &c.CreatedAt)
	if err != nil {
		http.Error(w, "controller not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(c)
}

func (h *ControllerHandler) Pair(w http.ResponseWriter, r *http.Request) {
	accountID := GetAccountID(r).(uuid.UUID)

	var req models.PairControllerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// In a real implementation, you would validate the QR token
	// For now, we'll create a controller with the QR token as hw_id
	controllerID := uuid.New()
	hwID := req.QRToken // In production, decode QR token to get actual hw_id

	now := time.Now()
	_, err := h.db.Exec(r.Context(), `
		INSERT INTO controllers (id, account_id, hw_id, status, created_at)
		VALUES ($1, $2, $3, 'PENDING_CONFIG', $4)
		ON CONFLICT (hw_id) DO UPDATE SET account_id = $2
	`, controllerID, accountID, hwID, now)
	if err != nil {
		http.Error(w, "failed to pair controller", http.StatusInternalServerError)
		return
	}

	var c models.Controller
	err = h.db.QueryRow(r.Context(), `
		SELECT id, account_id, hw_id, name, purpose, location, status, last_seen, created_at
		FROM controllers
		WHERE id = $1
	`, controllerID).Scan(&c.ID, &c.AccountID, &c.HWID, &c.Name, &c.Purpose, &c.Location, &c.Status, &c.LastSeen, &c.CreatedAt)
	if err != nil {
		http.Error(w, "failed to retrieve controller", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(c)
}

func (h *ControllerHandler) Update(w http.ResponseWriter, r *http.Request) {
	controllerID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid controller id", http.StatusBadRequest)
		return
	}

	accountID := GetAccountID(r).(uuid.UUID)

	var req models.UpdateControllerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Build update query dynamically
	updates := []string{}
	args := []interface{}{}
	argPos := 1

	if req.Name != nil {
		updates = append(updates, "name = $"+fmt.Sprintf("%d", argPos))
		args = append(args, *req.Name)
		argPos++
	}
	if req.Purpose != nil {
		updates = append(updates, "purpose = $"+fmt.Sprintf("%d", argPos))
		args = append(args, *req.Purpose)
		argPos++
	}
	if req.Location != nil {
		updates = append(updates, "location = $"+fmt.Sprintf("%d", argPos))
		args = append(args, *req.Location)
		argPos++
	}

	if len(updates) == 0 {
		http.Error(w, "no fields to update", http.StatusBadRequest)
		return
	}

	args = append(args, controllerID, accountID)
	query := "UPDATE controllers SET " + strings.Join(updates, ", ") + " WHERE id = $" + fmt.Sprintf("%d", argPos) + " AND account_id = $" + fmt.Sprintf("%d", argPos+1)

	_, err = h.db.Exec(r.Context(), query, args...)
	if err != nil {
		http.Error(w, "failed to update controller", http.StatusInternalServerError)
		return
	}

	// Return updated controller
	h.Get(w, r)
}
