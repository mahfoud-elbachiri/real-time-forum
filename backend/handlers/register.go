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
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	fmt.Println("wslet")
	

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, "invalid input")
		return
	}
	fmt.Println(user)

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("error : ",err)
		return
	}

	if user.Nickname == "" {
		jsonResponse(w, http.StatusBadRequest, "All fields are required")
		return
	}
	var exist bool
	err = database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE nickname = ? OR email = ?)",user.Nickname,user.Email).Scan(&exist)
	if err != nil {
		jsonResponse(w,http.StatusInternalServerError,"Database Error")
		return
	}

	if exist {
		jsonResponse(w, http.StatusBadRequest, "Username or Email already exists")
		return
	}
	res, err := database.DB.Exec("INSERT INTO users (nickname,email,password,first_name,last_name,age,gender) VALUES(?,?,?,?,?,?,?)", user.Nickname, user.Email, string(hashedPassword), user.FirstName, user.LastName, user.Age, user.Gender, user.CreatedAt, user.LastSeen)
	if err != nil {
		fmt.Println("error in insert : ",err)
		 http.Error(w, "Error saving user", http.StatusInternalServerError)
		//jsonResponse(w, http.StatusBadRequest, "Username or Email , Already Exist")
		return
	}

	user_id, err := res.LastInsertId()
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("last user :",user_id)
	
	cookie := app.CookieMaker(w)
	err3 := app.InsretCookie(database.DB, int(user_id), cookie, time.Now().Add(time.Hour*24))
	if err3 != nil {
		fmt.Println(err3.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
//	fmt.Fprintln(w, "User registered successfully")
	jsonResponse(w, http.StatusCreated, "User registered successfully")
}

func jsonResponse(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}
