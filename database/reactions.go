package database

import "database/sql"

func ToggleLike(db *sql.DB, userID, postID int) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var exists int
	err = tx.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM liked_posts
			WHERE post_id = ? AND user_id = ?
		)
	`, postID, userID).Scan(&exists)
	if err != nil {
		return err
	}

	if exists == 1 {
		// Unlike
		_, err = tx.Exec(`
			DELETE FROM liked_posts
			WHERE post_id = ? AND user_id = ?
		`, postID, userID)
		if err != nil {
			return err
		}
	} else {
		 
		_, err = tx.Exec(`
			DELETE FROM disliked_posts
			WHERE post_id = ? AND user_id = ?
		`, postID, userID)
		if err != nil {
			return err
		}

		 
		_, err = tx.Exec(`
			INSERT INTO liked_posts (post_id, user_id)
			VALUES (?, ?)
		`, postID, userID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func ToggleDislike(db *sql.DB, userID, postID int) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var exists int
	err = tx.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM disliked_posts
			WHERE post_id = ? AND user_id = ?
		)
	`, postID, userID).Scan(&exists)
	if err != nil {
		return err
	}

	if exists == 1 {
 		_, err = tx.Exec(`
			DELETE FROM disliked_posts
			WHERE post_id = ? AND user_id = ?
		`, postID, userID)
		if err != nil {
			return err
		}
	} else {
 		_, err = tx.Exec(`
			DELETE FROM liked_posts
			WHERE post_id = ? AND user_id = ?
		`, postID, userID)
		if err != nil {
			return err
		}

		 
		_, err = tx.Exec(`
			INSERT INTO disliked_posts (post_id, user_id)
			VALUES (?, ?)
		`, postID, userID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}