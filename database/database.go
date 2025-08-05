package database

import (
	"database/sql"
	"log"
	"sync"

	_ "modernc.org/sqlite"
)

var (
	DB   *sql.DB
	once sync.Once
)

func GetDB() *sql.DB {
	once.Do(func() {
		var err error
		DB, err = sql.Open("sqlite", "file:mydatabase.db?_pragma=foreign_keys(1)")
		if err != nil {
			log.Fatal(err)
		}

		if _, err = DB.Exec(`PRAGMA foreign_keys = ON;`); err != nil {
			log.Fatal(err)
		}

		if err = DB.Ping(); err != nil {
			log.Fatal(err)
		}
	})
	return DB
}

func DropAllTables() {
	db := GetDB()

	queries := []string{
		`PRAGMA foreign_keys = OFF;`,

		`DROP TABLE IF EXISTS disliked_posts;`,
		`DROP TABLE IF EXISTS liked_posts;`,
		`DROP TABLE IF EXISTS comments;`,
		`DROP TABLE IF EXISTS messages;`,
		`DROP TABLE IF EXISTS posts;`,
		`DROP TABLE IF EXISTS sessions;`,
		`DROP TABLE IF EXISTS users;`,

		`PRAGMA foreign_keys = ON;`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			log.Fatalf("Failed to drop tables: %v\nQuery: %s", err, q)
		}
	}
}

func InitSchema() {

	db := GetDB()

	queries := []string{

		
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nickname TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL CHECK(email LIKE '%@%'),
			password TEXT NOT NULL,
			first_name TEXT NOT NULL,
			last_name TEXT NOT NULL,
			age INTEGER NOT NULL,
			gender TEXT NOT NULL,
			avatar_url TEXT DEFAULT ''
		);`,

		
		`CREATE TABLE IF NOT EXISTS sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			session TEXT NOT NULL,
			user_id INTEGER NOT NULL,
			exp_date DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);`,

		
		`CREATE TABLE IF NOT EXISTS posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			title TEXT NOT NULL,
			content TEXT NOT NULL,
			category TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);`,

		`CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			post_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);`,

		`CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender INTEGER NOT NULL,
			receiver INTEGER NOT NULL,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			read_status INTEGER DEFAULT 0,
			FOREIGN KEY (sender) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (receiver) REFERENCES users(id) ON DELETE CASCADE
		);`,

		`CREATE TABLE IF NOT EXISTS liked_posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			post_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE (post_id, user_id)
		);`,

		`CREATE TABLE IF NOT EXISTS disliked_posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			post_id INTEGER NOT NULL,
			user_id INTEGER NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE (post_id, user_id)
		);`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			log.Fatalf("Schema error: %v\nQuery:\n%s", err, q)
		}
	}

 

	createIndexes(db)
}

func createIndexes(db *sql.DB) {
	indexes := []string{
		`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);`,
		`CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);`,
		`CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);`,
		`CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);`,
		`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);`,
		`CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver);`,
	}

	for _, idx := range indexes {
		if _, err := db.Exec(idx); err != nil {
			log.Fatalf("Index error: %v\nQuery:\n%s", err, idx)
		}
	}
}
