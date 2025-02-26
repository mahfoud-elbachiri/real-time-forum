package handlers

import (
	"encoding/json"
	"net/http"
)

// func ErrorHundler(w http.ResponseWriter, r *http.Request, StatusCode int, message string) {
// 	errPage := "/home/hkouki/Desktop/real-time-forum/frontend/public/error.html"
// 	tmp, err := template.ParseFiles(errPage)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// 	errType := models.ErrorType{
// 		Code:    StatusCode,
// 		Message: http.StatusText(StatusCode),
// 	}
// 	if message != "" {
// 		errType.Message = message
// 	}
// 	w.WriteHeader(StatusCode)
// 	if err := tmp.Execute(w, errType); err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}
// }

func jsonResponse(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}
