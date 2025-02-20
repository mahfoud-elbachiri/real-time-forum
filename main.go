package main

import (
	"database/sql"
	"fmt"
	"net/http"

	"real-time-forum/backend/routes"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func main() {
	var errdb error
	db, errdb = sql.Open("sqlite3", "./databasse.sqlite")
	if errdb != nil {
		fmt.Println(errdb)
	}
	defer db.Close()
	Servingfiles()
	routes.WebRoutes()
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
