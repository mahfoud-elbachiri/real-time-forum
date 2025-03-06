package routes

import (
	"net/http"

	"real-time-forum/backend/handlers"
)

func WebRoutes() {
	// API endpoints
	http.HandleFunc("/api/login", handlers.LoginHandler)
	http.HandleFunc("/api/register", handlers.RegisterHandler)
	http.HandleFunc("/api/logout", handlers.LogOutHandler) // Fixed the typo

	// Add a session check endpoint
	http.HandleFunc("/checksession", handlers.CheckSessionHandler)
	
	// The SPA handler must be last to catch all frontend routes
	http.HandleFunc("/", handlers.HandleHome)
}