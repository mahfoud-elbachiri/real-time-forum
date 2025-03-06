package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"real-time-forum/backend/app"
	"real-time-forum/backend/models"
	"real-time-forum/backend/tools"
	"real-time-forum/database"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("login")
	var pasw string
	var user_id int

	if r.Method != http.MethodPost {
		jsonResponse(w, http.StatusMethodNotAllowed, "Invalid request method", nil)
		return
	}

	var user models.LoginCredentials
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, "error :", err)
		fmt.Println(err)
		return
	}

	err = database.DB.QueryRow("SELECT password, id FROM users WHERE nickname = ? OR email = ?", user.Email, user.Email).Scan(&pasw, &user_id)
	if err != nil {
		// fmt.Println("pasw:", pasw, "  user id :", user_id, "error : ", err)
		jsonResponse(w, http.StatusUnauthorized, "User not found or incorrect email", nil)
		return
	}
	 
	err = tools.CheckPassword(pasw, user.Password)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Invalid password", nil)
		return
	}

	// handling one session at a time
	deleteQuery := "DELETE FROM sessions WHERE user_id = ?"
	_, err = database.DB.Exec(deleteQuery, user_id)
	if err != nil {
		fmt.Println("Error cleaning old sessions", err)
		return
	}

	cookie := app.CookieMaker(w)
	err = app.InsretCookie(database.DB, user_id, cookie, time.Now().Add(time.Hour*24))
	if err != nil {
		fmt.Println(err)
		return
	}

	// Respond with success

	jsonResponse(w, http.StatusOK, "Login successful", nil)
}

// CheckSessionHandler verifies if a user has a valid session
func CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("wslaaaaaat")
	if r.Method != http.MethodGet {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	 
	cookie, err := r.Cookie("session")
	if err != nil {
		 
		jsonResponse(w, http.StatusUnauthorized, "No session found", nil)
		return
	}
	fmt.Println("koki:", cookie.Value)
	 
	var userID int
	var expiry time.Time
	err = database.DB.QueryRow("SELECT user_id, exp_date FROM sessions WHERE session = ?", cookie.Value).Scan(&userID, &expiry)
	if err != nil {
		jsonResponse(w, http.StatusOK, "Session valid", nil)
		if err == sql.ErrNoRows {
			// Session not found in database
			jsonResponse(w, http.StatusUnauthorized, "Invalid session", nil)
		} else {
			// Database error
			jsonResponse(w, http.StatusInternalServerError, "Error verifying session", nil)
		}
		return
	}

	// Check if session has expired
	if time.Now().After(expiry) {
		// Delete expired session
		database.DB.Exec("DELETE FROM sessions WHERE session = ?", cookie.Value)
		jsonResponse(w, http.StatusUnauthorized, "Session expired", nil)
		return
	}

	// Session is valid
	 
	jsonResponse(w, http.StatusOK, "Session valid", nil)
}
