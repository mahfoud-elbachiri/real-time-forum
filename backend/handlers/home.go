package handlers

import "net/http"

func HandleHome(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "frontend/public/login.html")
		} else {
			ErrorHundler(w, r, http.StatusNotFound, http.StatusText(http.StatusNotFound))
			return
		}
	} else {
		ErrorHundler(w, r, http.StatusMethodNotAllowed, "")
		return
	}
}
