package routes

import (
	"net/http"

	"real-time-forum/backend/handlers"
)

func WebRoutes() {
	http.HandleFunc("/", handlers.HandleHome)
	http.HandleFunc("/login", handlers.RegisterHandler) 
	http.HandleFunc("/register", handlers.RegisterHandler)
	http.HandleFunc("/lougout", handlers.LogOutHandler)
	http.HandleFunc("/login",handlers.LoginHandler)
}
