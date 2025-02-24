package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"real-time-forum/backend/app"
	"real-time-forum/backend/models"
	"real-time-forum/database"

	"golang.org/x/crypto/bcrypt"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var user models.User

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	if user.Nickname == "" || user.Email == "" || user.FirstName == "" || user.Gender == "" || user.LastName == "" || user.Password == "" || user.Age < 0 {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	res, err := database.DB.Exec("INSER INTO users (nickname,email,password,first_name,last_name,age,gender,created_at,last_seen) VALUES(?,?,?,?,?,?,?,?)", user.Nickname, user.Email, string(hashedPassword), user.FirstName, user.LastName, user.Age, user.Gender, user.CreatedAt, user.LastSeen)
	if err != nil {
		http.Error(w, "Error saving user", http.StatusInternalServerError)
		return
	}

	user_id, err := res.LastInsertId()
	if err != nil {
		fmt.Println(err)
		return
	}

	cookie := app.CookieMaker(w)
	err = app.InsretCookie(database.DB, int(user_id), cookie, time.Now().Add(time.Hour*24))
	if err != nil {
		fmt.Println(err)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "User registered successfully")
}
