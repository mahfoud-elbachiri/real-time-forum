package handlers

import "net/http"

func HandleHome(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "frontend/public/login.html")
		} else {
			jsonResponse(w,http.StatusNotFound, http.StatusText(http.StatusNotFound),nil)
			return
		}
	} else {
		jsonResponse(w,http.StatusMethodNotAllowed, http.StatusText(http.StatusMethodNotAllowed),nil)
		return
	}
}
