package handlers

import (
	// "log"

	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"real-time-forum/database"

	"github.com/gorilla/websocket"
)

type dbmsg struct {
	id       int
	sender   string
	receiver string
	content  string
	date     string
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type usersinfo struct {
	id       int
	nickname string
	conn     *websocket.Conn
}

type Message struct {
	Type     string `json:"type"`
	Receiver string `json:"reciver"`
	Msg      string `json:"msg"`
	Offset   int    `json:"offset"`
	Limit    int    `json:"limit"`
}

var (
	connmap = make(map[string]usersinfo)
	mu      sync.Mutex
)

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session")
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "No session found", nil)
		return
	}
	var userID int

	err = database.DB.QueryRow("SELECT user_id FROM sessions WHERE session = ?", cookie.Value).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			jsonResponse(w, http.StatusUnauthorized, "Invalid session", nil)
		} else {
			jsonResponse(w, http.StatusInternalServerError, "Database error", nil)
		}
		return
	}
	var nickname string
	err = database.DB.QueryRow("SELECT nickname FROM users WHERE id =?", userID).Scan(&nickname)
	if err != nil {
		if err == sql.ErrNoRows {
			jsonResponse(w, http.StatusUnauthorized, "User not found", nil)
		} else {
			jsonResponse(w, http.StatusInternalServerError, "Database error", nil)
		}
		return
	}

	mu.Lock()
	ws, err := upgrader.Upgrade(w, r, nil)
	mu.Unlock()
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	var userinfo usersinfo
	userinfo.id = userID
	userinfo.nickname = nickname
	userinfo.conn = ws
	mu.Lock()
	connmap[nickname] = userinfo
	mu.Unlock()
	enligneusers()
	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			break
		}
		var msg Message
		err = json.Unmarshal(message, &msg)
		if err != nil {
			log.Println("Error unmarshalling message:", err)
			return
		}
		hndlemessage(msg, userinfo)

	}
	defer Removeconn(nickname)
}

func enligneusers() {
	var enligneusers []string
	for nickename := range connmap {
		enligneusers = append(enligneusers, nickename)
	}
	data := struct {
		Type         string
		Enligneusers []string
	}{
		Type:         "enligneusers",
		Enligneusers: enligneusers,
	}
	for _, v := range connmap {
		v.conn.WriteJSON(data)
	}
}

func Removeconn(nickname string) {
	connmap[nickname].conn.Close()
	delete(connmap, nickname)
	enligneusers()
}

func hndlemessage(msg Message, userinfo usersinfo) {
	if msg.Type == "send-message" {
		// Get receiver ID
		var receiverID int
		err := database.DB.QueryRow("SELECT id FROM users WHERE nickname = ?", msg.Receiver).Scan(&receiverID)
		if err != nil {
			log.Println("Error finding receiver user ID:", err)
			return
		}

		query := `INSERT INTO messages (sender, receiver, content) VALUES (?, ?, ?)`
		_, err = database.DB.Exec(query, userinfo.id, receiverID, msg.Msg)
		if err != nil {
			log.Println("Error inserting message into database:", err)
			return
		}
		if receiverInfo, exists := connmap[msg.Receiver]; exists {
			err := receiverInfo.conn.WriteJSON(map[string]interface{}{
				"Type":     "message",
				"Sender":   userinfo.nickname,
				"Receiver": msg.Receiver,
				"msg":      msg.Msg,
				"time":     time.Now().Format("2006-01-02 15:04:05"),
			})
			if err != nil {
				log.Println("Error sending message to receiver:", err)
			}
		}
		err = userinfo.conn.WriteJSON(map[string]interface{}{
			"Type":     "message",
			"receiver": msg.Receiver,
			"Sender":   userinfo.nickname,
			"mymsg":    true,
			"msg":      msg.Msg,
			"time":     time.Now().Format("2006-01-02 15:04:05"),
		})
		if err != nil {
			log.Println("Error sending message confirmation to sender:", err)
		}
	} else if msg.Type == "get-message" {
		// Get chatWith ID
		var chatWithID int
		err := database.DB.QueryRow("SELECT id FROM users WHERE nickname = ?", msg.Receiver).Scan(&chatWithID)
		if err != nil {
			log.Println("Error finding chat partner ID:", err)
			return
		}

		updateQuery := `UPDATE messages 
		SET read_status = 1 
		WHERE receiver = ? AND sender = ?`
		_, err = database.DB.Exec(updateQuery, userinfo.id, chatWithID)
		if err != nil {
			log.Println("Error updating message read status:", err)
			return
		}


		query := `SELECT id, sender, receiver, content, created_at FROM messages 
          WHERE (sender = ? AND receiver = ?) OR (receiver = ? AND sender = ?)
          ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`

		rows, err := database.DB.Query(query, userinfo.id, chatWithID, userinfo.id, chatWithID, msg.Limit, msg.Offset)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer rows.Close()

		var allmsg []dbmsg
		for rows.Next() {
			var senderID, receiverID int
			var dbMessage dbmsg

			if err := rows.Scan(&dbMessage.id, &senderID, &receiverID, &dbMessage.content, &dbMessage.date); err != nil {
				log.Println("Error scanning row:", err)
				continue
			}

			
			if senderID == userinfo.id {
				dbMessage.sender = userinfo.nickname
			} else {
				dbMessage.sender = msg.Receiver 
			}


			if receiverID == userinfo.id {
				dbMessage.receiver = userinfo.nickname
			} else {
				dbMessage.receiver = msg.Receiver
			}

			allmsg = append(allmsg, dbMessage)
		}

		hasMoreMessages := len(allmsg) >= msg.Limit
		if err = rows.Err(); err != nil {
			log.Println("Error iterating through rows:", err)
			return
		}
		var messageData []map[string]string
		for _, message := range allmsg {
			messageData = append(messageData, map[string]string{
				"id":       strconv.Itoa(message.id),
				"sender":   message.sender,
				"receiver": message.receiver,
				"content":  message.content,
				"date":     message.date,
			})
		}

		err = userinfo.conn.WriteJSON(map[string]interface{}{
			"Type":            "chat-history",
			"ChatWith":        msg.Receiver,
			"username":        userinfo.nickname,
			"Messages":        messageData,
			"hasMoreMessages": hasMoreMessages,
		})
		if err != nil {
			log.Println("Error sending message history to client:", err)
		}
	} else if msg.Type == "typing" {
		if receiverconn, exists := connmap[msg.Receiver]; exists {
			err := receiverconn.conn.WriteJSON(map[string]interface{}{
				"Type":     "typing",
				"Sender":   userinfo.nickname,
				"Receiver": msg.Receiver,
			})
			if err != nil {
				log.Println("Error sending typing to receiver:", err)
			}
		}
	} else if msg.Type == "stop_typing" {
		if receiverconn, exists := connmap[msg.Receiver]; exists {
			err := receiverconn.conn.WriteJSON(map[string]interface{}{
				"Type":     "stop_typing",
				"Sender":   userinfo.nickname,
				"Receiver": msg.Receiver,
			})
			if err != nil {
				log.Println("Error sending stop_typing to receiver:", err)
			}
		}
	}
}
