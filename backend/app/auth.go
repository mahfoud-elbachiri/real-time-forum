package app

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gofrs/uuid"
)

func InsretCookie(db *sql.DB, user_id int, cookie string, exp_date time.Time) error {
	query := `INSERT INTO sessions (user_id, session, exp_date) VALUES (?, ?, ?)`
	_, err := db.Exec(query, user_id, cookie, exp_date)
	if err != nil {
		return err
	}

	return nil
}

func CookieMaker(w http.ResponseWriter) string {
	u, err := uuid.NewV4()
	if err != nil {
		log.Fatalf("failed to generate UUID: %v", err)
	}

	cookie := &http.Cookie{
		Name:     "forum_session",
		Value:    u.String(),
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().Add(time.Hour * 24),
	}
	http.SetCookie(w, cookie)
	return u.String()
}

func ValidateCookie(db *sql.DB, w http.ResponseWriter, r *http.Request) (int, error) {
	cookie, err := r.Cookie("forum_session")
	if err != nil {
		return 0, err
	}

	sessionID := cookie.Value
	query1 := `SELECT user_id FROM sessions WHERE session = ? AND exp_date > datetime('now') `
	var user_id int
	err = db.QueryRow(query1, sessionID).Scan(&user_id)
	
	if err != nil {
		log.Printf("Failed to validate session for GET: %v", err)
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return 0, errors.New("error")
	}
	return user_id, nil
}

func isLoged(db *sql.DB, r *http.Request) int {
	var user_id int
	cookie, err := r.Cookie("forum_session")
	
	if err != nil {
		user_id = 0
	} else {
		sessionID := cookie.Value
		query1 := `SELECT user_id FROM sessions WHERE session = ?`
		err = db.QueryRow(query1, sessionID).Scan(&user_id)
		if err != nil {
			user_id = 0
		}
	}
	return user_id
}
