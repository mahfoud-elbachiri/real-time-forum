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
	var user models.User
	if r.Method != http.MethodPost {
		http.Error(w, "invalid request method", http.StatusMethodNotAllowed)
		return
	}
	fmt.Println("wslet")
	

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	fmt.Println(user)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	if user.Nickname == "" {
		jsonResponse(w, http.StatusBadRequest, "All fields are required")
		return
	}

	res, err := database.DB.Exec("INSERT INTO users (nickname,email,password,first_name,last_name,age,gender) VALUES(?,?,?,?,?,?,?)", user.Nickname, user.Email, string(hashedPassword), user.FirstName, user.LastName, user.Age, user.Gender, user.CreatedAt, user.LastSeen)
	if err != nil {
		fmt.Println(err)
		//http.Error(w, "Error saving user", http.StatusInternalServerError)
		jsonResponse(w, http.StatusInternalServerError, "Error saving user")
		return
	}

	user_id, err := res.LastInsertId()
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("last user :",user_id)
	
	cookie := app.CookieMaker(w)
	err = app.InsretCookie(database.DB, int(user_id), cookie, time.Now().Add(time.Hour*24))
	if err != nil {
		fmt.Println(err)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintln(w, "User registered successfully")
}

func jsonResponse(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}
