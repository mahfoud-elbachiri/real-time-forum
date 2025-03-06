package handlers

import (
	"net/http"
	"strings"
)

func HandleHome(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		jsonResponse(w, http.StatusMethodNotAllowed, http.StatusText(http.StatusMethodNotAllowed), nil)
		return
	}

	
	if strings.HasPrefix(r.URL.Path, "/api/") {
		
		http.NotFound(w, r)
		return
	}

	// For all non-API paths, serve the index.html file

	http.ServeFile(w, r, "frontend/public/login.html")
}
