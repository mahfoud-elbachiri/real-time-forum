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

func HandleHome(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "/home/hkouki/Desktop/real-time-forum/frontend/public/index.html")
		} else {
			ErrorHundler(w, r, http.StatusNotFound, http.StatusText(http.StatusNotFound))
			return
		}
	} else {
		ErrorHundler(w, r, http.StatusMethodNotAllowed, "")
		return
	}
}

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
	err = bcrypt.CompareHashAndPassword([]byte(pasw), []byte(user.Password))
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



func LogOutHandler(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		cookie, err := r.Cookie("forum_session")
		if err != nil {
			http.Error(w, "No active session found", http.StatusUnauthorized)
			return
		}

		sessionID := cookie.Value
		query := `DELETE FROM sessions WHERE session = ?`
		res, err := database.DB.Exec(query, sessionID)
		if err != nil {
			fmt.Println("error executing the query")
		}
		rows, _ := res.RowsAffected()
		fmt.Println("rows :",rows)

		http.SetCookie(w, &http.Cookie{
			Name:   "forum_session",
			Value:  "",
			Path:   "/",
			MaxAge: -1,
		})

		http.Redirect(w, r, "/", http.StatusSeeOther)
	
}
