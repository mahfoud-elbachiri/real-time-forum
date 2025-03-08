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
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed",nil)
		return
	}


	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		jsonResponse(w, http.StatusBadRequest, "invalid input",nil)
		return
	}


	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("error : ", err)
		return
	}

	if user.Nickname == "" || user.Email == "" {
		jsonResponse(w, http.StatusBadRequest, "All fields are required",nil)
		return
	}
	var exist bool
	err = database.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE nickname = ? OR email = ?)", user.Nickname, user.Email).Scan(&exist)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Database Error",nil)
		return
	}

	if exist {
		jsonResponse(w, http.StatusBadRequest, "Username or Email already exists",nil)
		return
	}
	res, err := database.DB.Exec("INSERT INTO users (nickname,email,password,first_name,last_name,age,gender) VALUES(?,?,?,?,?,?,?)", user.Nickname, user.Email, string(hashedPassword), user.FirstName, user.LastName, user.Age, user.Gender, user.CreatedAt, user.LastSeen)
	if err != nil {
		fmt.Println("error in insert : ", err)
		jsonResponse(w, http.StatusInternalServerError, "some input are not allowed",nil)
		return
	}

	user_id, err := res.LastInsertId()
	if err != nil {
		fmt.Println(err)
		return
	}
	

	cookie := app.CookieMaker(w)
	err3 := app.InsretCookie(database.DB, int(user_id), cookie, time.Now().Add(time.Hour*24))
	if err3 != nil {
		fmt.Println(err3.Error())
		return
	}
	fmt.Println("username : ", user.Nickname, "registred *****")
	w.WriteHeader(http.StatusCreated)
	//	fmt.Fprintln(w, "User registered successfully")
	jsonResponse(w, http.StatusCreated, "User registered successfully",nil)
}
