package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/database"
)

func LikePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	cookie, err := r.Cookie("session")
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "No session found", nil)
		return
	}

	var userID int
	err = database.DB.QueryRow(
		"SELECT user_id FROM sessions WHERE session = ?",
		cookie.Value,
	).Scan(&userID)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Invalid session", nil)
		return
	}

	var payload struct {
		PostID int `json:"post_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		jsonResponse(w, http.StatusBadRequest, "Invalid request body", nil)
		return
	}

	if err := database.ToggleLike(database.DB, userID, payload.PostID); err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Failed to toggle like", nil)
		return
	}

	jsonResponse(w, http.StatusOK, "Like toggled successfully", nil)
}
