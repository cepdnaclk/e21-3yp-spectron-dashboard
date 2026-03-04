package httpapi

import (
	"context"
	"net/http"
	"strings"

	"spectron-backend/internal/auth"
)

type contextKey string

const userIDKey contextKey = "user_id"
const accountIDKey contextKey = "account_id"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "missing authorization header", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "invalid authorization header", http.StatusUnauthorized)
			return
		}

		claims, err := auth.ValidateToken(parts[1])
		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, claims.UserID)
		ctx = context.WithValue(ctx, accountIDKey, claims.AccountID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetUserID(r *http.Request) interface{} {
	return r.Context().Value(userIDKey)
}

func GetAccountID(r *http.Request) interface{} {
	return r.Context().Value(accountIDKey)
}
