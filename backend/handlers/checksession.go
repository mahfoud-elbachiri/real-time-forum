package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"real-time-forum/database"
)


func CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	cookie, err := r.Cookie("session")
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "No session found", nil)
		return
	}

	var userID int
	var expiry time.Time
	err = database.DB.QueryRow("SELECT user_id, exp_date FROM sessions WHERE session = ?", cookie.Value).Scan(&userID, &expiry)
	if err != nil {
		jsonResponse(w, http.StatusOK, "Session valid", nil)
		if err == sql.ErrNoRows {
			jsonResponse(w, http.StatusUnauthorized, "Invalid session", nil)
		}
		return
	}

	if time.Now().After(expiry) {

		database.DB.Exec("DELETE FROM sessions WHERE session = ?", cookie.Value)
		jsonResponse(w, http.StatusUnauthorized, "Session expired", nil)
		return
	}

	jsonResponse(w, http.StatusOK, "Session valid", nil)
}
