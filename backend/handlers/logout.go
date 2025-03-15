package handlers

import (
	"fmt"
	"net/http"

	"real-time-forum/database"
)

func LogOutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("session")
	if err != nil {
		http.Error(w, "No active session found", http.StatusUnauthorized)
		return
	}

	sessionID := cookie.Value
	query := `DELETE FROM sessions WHERE session = ?`
	_, err = database.DB.Exec(query, sessionID)
	if err != nil {
		fmt.Println("error executing the query")
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "session",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	// Removeconn()
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
