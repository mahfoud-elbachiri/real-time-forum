package models

import "time"

type ErrorType struct {
	Message string
	Code    int
}

type User struct {
	ID        string    `json:"id"`
	Nickname  string    `json:"nickname"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Age       int       `json:"age"`
	Gender    string    `json:"gender"`
	CreatedAt time.Time `json:"created_at"`
	LastSeen  time.Time `json:"last_seen"`
}
type LoginCredentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

type Post struct {
	ID        int       `json:"id"`
	UserID    string    `json:"user_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Category  string    `json:"category"`
	CreatedAt time.Time `json:"created_at"`
}

type Comment struct {
	ID        string    `json:"id"`
	PostID    string    `json:"post_id"`
	UserID    string    `json:"user_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type Message struct {
	Sender    string    `json:"sender"`
	Receiver  string    `json:"receiver"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type DislikedPost struct {
	ID     int `json:"id"`
	PostID int `json:"post_id"`
	UserID int `json:"user_id"`
}

type LikedPost struct {
	ID     int `json:"id"`
	PostID int `json:"post_id"`
	UserID int `json:"user_id"`
}

type Nickname struct {
	Username string `json:"nickname"`
}
