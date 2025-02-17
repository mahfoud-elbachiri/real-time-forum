package handlers

import (
	"html/template"
	"net/http"

	"real-time-forum/backend/models"
)

func ErrorHundler(w http.ResponseWriter, r *http.Request, StatusCode int, message string) {
	errPage := "/home/hkouki/Desktop/real-time-forum/frontend/public/error.html"
	tmp, err := template.ParseFiles(errPage)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	errType := models.ErrorType{
		Code:    StatusCode,
		Message: http.StatusText(StatusCode),
	}
	if message != "" {
		errType.Message = message
	}
	w.WriteHeader(StatusCode)
	if err := tmp.Execute(w, errType); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
