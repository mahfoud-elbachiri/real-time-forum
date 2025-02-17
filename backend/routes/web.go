package routes

import (
	"real-time-forum/backend/handlers"
	"net/http"
)

func WebRoutes(){
	http.HandleFunc("/", handlers.HandleHome)
}