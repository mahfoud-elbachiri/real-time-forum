package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"real-time-forum/backend/app"
	"real-time-forum/backend/models"
	"real-time-forum/database"
)

func CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	userID, err := app.ValidateCookie(database.DB, w, r)
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Unauthorized", nil)
		return
	}

	var post models.Post
	err = json.NewDecoder(r.Body).Decode(&post)
	if err != nil {
		fmt.Println(err)
		jsonResponse(w, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	if post.Title == "" || post.Content == "" || post.Category == "" {
		jsonResponse(w, http.StatusBadRequest, "Title, content, and category are required", nil)
		return
	}

	res, err := database.DB.Exec("INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)",
		userID, post.Title, post.Content, post.Category)
	if err != nil {
		fmt.Println("Error creating post:", err)
		jsonResponse(w, http.StatusInternalServerError, "Erroir creating post", err)
		return
	}
	//defer database.DB.Close()
	postID, err := res.LastInsertId()
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Error getting post ID", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Post created successfully",
		"id":      postID,
	})
}
