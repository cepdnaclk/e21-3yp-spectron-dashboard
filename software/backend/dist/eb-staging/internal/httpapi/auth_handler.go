package httpapi

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"spectron-backend/internal/auth"
	"spectron-backend/internal/models"
)

type AuthHandler struct {
	db *pgxpool.Pool
}

func NewAuthHandler(db *pgxpool.Pool) *AuthHandler {
	return &AuthHandler{db: db}
}

type RegisterRequest struct {
	Email    string  `json:"email"`
	Password string  `json:"password"`
	Phone    *string `json:"phone,omitempty"`
	Name     *string `json:"name,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

type CurrentUserResponse struct {
	ID       uuid.UUID                  `json:"id"`
	Email    string                     `json:"email"`
	Phone    *string                    `json:"phone,omitempty"`
	Accounts []CurrentUserAccountAccess `json:"accounts"`
}

type CurrentUserAccountAccess struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
	Role string    `json:"role"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		http.Error(w, "failed to hash password", http.StatusInternalServerError)
		return
	}

	// Create user and account in transaction
	tx, err := h.db.Begin(r.Context())
	if err != nil {
		log.Printf("Failed to begin transaction: %v", err)
		http.Error(w, "database error: failed to start transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	userID := uuid.New()
	accountID := uuid.New()

	// Create user
	_, err = tx.Exec(r.Context(), `
		INSERT INTO users (id, email, password_hash, phone)
		VALUES ($1, $2, $3, $4)
	`, userID, req.Email, hashedPassword, req.Phone)
	if err != nil {
		log.Printf("Failed to create user: %v", err)
		// Check if it's a duplicate email error
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			http.Error(w, "email already registered", http.StatusConflict)
		} else {
			http.Error(w, "failed to create user: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Create account
	accountName := req.Email
	if req.Name != nil {
		accountName = *req.Name
	}
	_, err = tx.Exec(r.Context(), `
		INSERT INTO accounts (id, name)
		VALUES ($1, $2)
	`, accountID, accountName)
	if err != nil {
		log.Printf("Failed to create account: %v", err)
		http.Error(w, "failed to create account: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create membership (user is OWNER of their account)
	_, err = tx.Exec(r.Context(), `
		INSERT INTO account_memberships (account_id, user_id, role)
		VALUES ($1, $2, 'OWNER')
	`, accountID, userID)
	if err != nil {
		log.Printf("Failed to create membership: %v", err)
		http.Error(w, "failed to create membership: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		log.Printf("Failed to commit transaction: %v", err)
		http.Error(w, "failed to commit transaction: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate token
	token, err := auth.GenerateToken(userID, accountID, req.Email)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	user := models.User{
		ID:    userID,
		Email: req.Email,
		Phone: req.Phone,
	}

	json.NewEncoder(w).Encode(AuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var userID uuid.UUID
	var accountID uuid.UUID
	var passwordHash string
	var phone *string

	err := h.db.QueryRow(r.Context(), `
		SELECT u.id, u.password_hash, u.phone, am.account_id
		FROM users u
		JOIN account_memberships am ON u.id = am.user_id
		WHERE u.email = $1 AND am.role = 'OWNER'
		LIMIT 1
	`, req.Email).Scan(&userID, &passwordHash, &phone, &accountID)
	if err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	if !auth.CheckPasswordHash(req.Password, passwordHash) {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate token
	token, err := auth.GenerateToken(userID, accountID, req.Email)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	user := models.User{
		ID:    userID,
		Email: req.Email,
		Phone: phone,
	}

	json.NewEncoder(w).Encode(AuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := GetUserID(r).(uuid.UUID)

	var user models.User
	var accounts []CurrentUserAccountAccess

	err := h.db.QueryRow(r.Context(), `
		SELECT id, email, phone, created_at
		FROM users
		WHERE id = $1
	`, userID).Scan(&user.ID, &user.Email, &user.Phone, &user.CreatedAt)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	rows, err := h.db.Query(r.Context(), `
		SELECT a.id, a.name, a.created_at, am.role
		FROM accounts a
		JOIN account_memberships am ON a.id = am.account_id
		WHERE am.user_id = $1
	`, userID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var acc CurrentUserAccountAccess
			var createdAtIgnored interface{}
			var role string
			if err := rows.Scan(&acc.ID, &acc.Name, &createdAtIgnored, &role); err != nil {
				continue
			}
			acc.Role = role
			accounts = append(accounts, acc)
		}
	}

	response := CurrentUserResponse{
		ID:       user.ID,
		Email:    user.Email,
		Phone:    user.Phone,
		Accounts: accounts,
	}

	json.NewEncoder(w).Encode(response)
}

// ListUsers returns all users in the same account(s) as the current user
func (h *AuthHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	accountID := GetAccountID(r).(uuid.UUID)

	// Get all users in the same account
	rows, err := h.db.Query(r.Context(), `
		SELECT DISTINCT u.id, u.email, u.phone, u.created_at, am.role
		FROM users u
		JOIN account_memberships am ON u.id = am.user_id
		WHERE am.account_id = $1
		ORDER BY u.created_at DESC
	`, accountID)
	if err != nil {
		http.Error(w, "database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type UserResponse struct {
		ID        uuid.UUID `json:"id"`
		Email     string    `json:"email"`
		Phone     *string   `json:"phone,omitempty"`
		CreatedAt string    `json:"created_at"`
		Role      string    `json:"role"`
	}

	var users []UserResponse
	for rows.Next() {
		var u UserResponse
		var createdAt string
		err := rows.Scan(&u.ID, &u.Email, &u.Phone, &createdAt, &u.Role)
		if err != nil {
			continue
		}
		u.CreatedAt = createdAt
		users = append(users, u)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"users": users,
		"count": len(users),
	})
}
