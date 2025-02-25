package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"real-time-forum/backend/app"
	"real-time-forum/backend/tools"
	"real-time-forum/backend/models"
	"real-time-forum/database"

	"golang.org/x/crypto/bcrypt"
)


func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var user models.LoginCredentials
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Retrieve the hashed password from database
	var pasw string
	var user_id int
	err = database.DB.QueryRow("SELECT password, id FROM users WHERE email = ?", user.Email).Scan(&pasw, user_id)
	if err != nil {
		http.Error(w, "User not found or incorrect email", http.StatusUnauthorized)
		return
	}

	// Compare hashed password with provided password
	err = tools.CheckPassword(pasw , user.Password)
	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}

	// handling one session at a time
	deleteQuery := "DELETE FROM sessions WHERE user_id = ?"
	_, err = database.DB.Exec(deleteQuery, user_id)
	if err != nil {
		http.Error(w, "Error cleaning old sessions", http.StatusInternalServerError)
		return
	}

	cookie := app.CookieMaker(w)
	err = app.InsretCookie(database.DB, user_id, cookie, time.Now().Add(time.Hour*24))
	if err != nil {
		fmt.Println(err)
		return
	}

	// Respond with success
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Login successful"))
}
