package routes

import (
	"net/http"

	"real-time-forum/backend/handlers"
)

func WebRoutes() {
	 
	http.HandleFunc("/api/login", handlers.LoginHandler)
	http.HandleFunc("/api/register", handlers.RegisterHandler)
	http.HandleFunc("/api/logout", handlers.LogOutHandler)  
	http.HandleFunc("/api/fetchposts", handlers.FetchPosts)  
 
	http.HandleFunc("/checksession", handlers.CheckSessionHandler)
	
 
	http.HandleFunc("/", handlers.HandleHome)
}