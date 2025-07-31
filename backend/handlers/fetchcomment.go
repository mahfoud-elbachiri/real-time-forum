package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"real-time-forum/backend/models"
	"real-time-forum/database"
)

func FetchComments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	postIDStr := r.URL.Query().Get("post_id")
	if postIDStr == "" {
		jsonResponse(w, http.StatusBadRequest, "Post ID is required", nil)
		return
	}

	query := `
		SELECT c.id, c.post_id, c.user_id, c.content, c.created_at, COALESCE(u.nickname, 'Unknown')
		FROM comments c
		LEFT JOIN users u ON CAST(c.user_id AS INTEGER) = u.id
		WHERE c.post_id = ?
		ORDER BY c.created_at ASC
	`

	rows, err := database.DB.Query(query, postIDStr)
	if err != nil {
		fmt.Println("Error querying comments:", err)
		jsonResponse(w, http.StatusInternalServerError, "Error fetching comments", nil)
		return
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var comment models.Comment
		err := rows.Scan(
			&comment.ID,
			&comment.PostID,
			&comment.UserID,
			&comment.Content,
			&comment.CreatedAt,
			&comment.Author,
		)
		if err != nil {
			fmt.Println("Error scanning comment row:", err)
			continue
		}
		comments = append(comments, comment)
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Error iterating through rows:", err)
		jsonResponse(w, http.StatusInternalServerError, "Error processing comments", nil)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(comments)
}
