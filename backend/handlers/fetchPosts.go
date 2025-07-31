package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"real-time-forum/backend/models"
	"real-time-forum/database"
)

func FetchPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	query := `
		SELECT p.id, p.user_id, p.title, p.content, p.category, p.created_at, u.nickname 
		FROM posts p
		JOIN users u ON p.user_id = u.id
		ORDER BY p.created_at DESC
	`

	var post models.Post
	var posts []models.Post

	rows, err := database.DB.Query(query)
	if err != nil {
		fmt.Println("Error querying posts:", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content, &post.Category, &post.CreatedAt, &post.Author)
		if err != nil {
			fmt.Println("Error scanning post:", err)
			continue
		}
		posts = append(posts, post)
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Error iterating rows:", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(posts)
}
