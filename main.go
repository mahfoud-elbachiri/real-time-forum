package main

import (
	"fmt"
	"net/http"
	"real-time-forum/backend/routes"
	dataBase "real-time-forum/database"
	"real-time-forum/backend/handlers"
	_ "github.com/mattn/go-sqlite3"
)

func main() {

	dataBase.InitSchema()

	Servingfiles()
	routes.WebRoutes()


	//handlers 

	http.HandleFunc("/register" , handlers.RegisterHandler)
	http.HandleFunc("/login" , handlers.RegisterHandler)
	http.HandleFunc("/lougout" , handlers.LogOutHandler)




	fmt.Println("Starting server on :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		fmt.Println("err starting the server : ", err)
		return
	}
}

func Servingfiles() {
	http.Handle("/css/", http.StripPrefix("/css/", http.FileServer(http.Dir("../frontend/css"))))
	http.Handle("/js/", http.StripPrefix("/js/", http.FileServer(http.Dir("../frontend/js"))))
	http.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("../public/js"))))
}
