package handlers

import (
	"encoding/json"
	"net/http"

	"real-time-forum/backend/models"
	"real-time-forum/database"
)

func FetchPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
 
	var userID int
	cookie, err := r.Cookie("session")
	if err == nil {
		_ = database.DB.QueryRow(
			"SELECT user_id FROM sessions WHERE session = ?",
			cookie.Value,
		).Scan(&userID)
	}
 

	query := `
		SELECT
			p.id, p.user_id, p.title, p.content, p.category, p.created_at,
			u.nickname,

			(SELECT COUNT(*) FROM liked_posts lp WHERE lp.post_id = p.id),
			(SELECT COUNT(*) FROM disliked_posts dp WHERE dp.post_id = p.id),

			EXISTS (
				SELECT 1 FROM liked_posts
				WHERE post_id = p.id AND user_id = ?
			),

			EXISTS (
				SELECT 1 FROM disliked_posts
				WHERE post_id = p.id AND user_id = ?
			)

		FROM posts p
		JOIN users u ON p.user_id = u.id
		ORDER BY p.created_at DESC;
	`

	rows, err := database.DB.Query(query, userID, userID)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var posts []models.Post

	for rows.Next() {
		var post models.Post
		err := rows.Scan(
			&post.ID,
			&post.UserID,
			&post.Title,
			&post.Content,
			&post.Category,
			&post.CreatedAt,
			&post.Author,
			&post.LikesCount,
			&post.DislikesCount,
			&post.UserLiked,
			&post.UserDisliked,
		)
		if err != nil {
			continue
		}
		posts = append(posts, post)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
