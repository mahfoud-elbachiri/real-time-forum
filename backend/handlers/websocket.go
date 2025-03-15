package handlers

import (
	// "log"

	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"real-time-forum/database"

	"github.com/gorilla/websocket"
)

type dbmsg struct {
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
}

var (
	connmap = make(map[string]usersinfo)
	mu      sync.Mutex
)

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	ws, err := upgrader.Upgrade(w, r, nil)
	mu.Unlock()
	if err != nil {
		log.Fatal(err)
	}
	cookie, err := r.Cookie("session")
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "No session found", nil)
		return
	}
	var userID int

	err = database.DB.QueryRow("SELECT user_id FROM sessions WHERE session = ?", cookie.Value).Scan(&userID)
	if err != nil {
		jsonResponse(w, http.StatusOK, "Session valid", nil)
		if err == sql.ErrNoRows {
			jsonResponse(w, http.StatusUnauthorized, "Invalid session", nil)
		}
		return
	}
	var nickname string
	err = database.DB.QueryRow("SELECT nickname FROM users WHERE id =?", userID).Scan(&nickname)
	if err != nil {
		jsonResponse(w, http.StatusOK, "this is probleme in geting nickname from DB", nil)
		if err == sql.ErrNoRows {
			jsonResponse(w, http.StatusUnauthorized, "this is probleme in geting nickname from DB", nil)
		}
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
	// fmt.Println(connmap)
	for _, v := range connmap {
		v.conn.WriteJSON(data)
		// fmt.Println(err)
	}
}

func Removeconn(nickname string) {
	connmap[nickname].conn.Close()
	delete(connmap, nickname)
	enligneusers()
}

func hndlemessage(msg Message, userinfo usersinfo) {
	if msg.Type == "send-message" {
		query := `INSERT INTO messages (sender, receiver, content) VALUES (?, ?, ?)`
		_, err := database.DB.Exec(query, userinfo.nickname, msg.Receiver, msg.Msg)
		if err != nil {
			log.Println("Error inserting message into database:", err)
			return
		}

		if receiverInfo, exists := connmap[msg.Receiver]; exists {
			err := receiverInfo.conn.WriteJSON(map[string]interface{}{
				"Type":   "message",
				"Sender": userinfo.nickname,
				"msg":    msg.Msg,
				"time":   time.Now().Format("2006-01-02 15:04:05"),
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

		query := `SELECT sender, receiver, content, created_at FROM messages 
		WHERE (sender = ? AND receiver = ?) OR (receiver = ? AND sender = ?)`
		rows, err := database.DB.Query(query, userinfo.nickname, msg.Receiver, userinfo.nickname, msg.Receiver)
		if err != nil {
			fmt.Println(err)
			return
		}
		var allmsg []dbmsg
		for rows.Next() {
			var msg dbmsg
			if err := rows.Scan(&msg.sender, &msg.receiver, &msg.content, &msg.date); err != nil {
				log.Println("Error scanning row:", err)
				continue // Skip this row on error and continue with the next one
			}
			allmsg = append(allmsg, msg) // This should be outside the error condition
		}
		if err = rows.Err(); err != nil {
			log.Println("Error iterating through rows:", err)
			return
		}

		// Convert allmsg to a format suitable for JSON
		var messageData []map[string]string
		for _, message := range allmsg {
			messageData = append(messageData, map[string]string{
				"sender":   message.sender,
				"receiver": message.receiver,
				"content":  message.content,
				"date":     message.date,
			})
		}

		// Send all messages to the client (userinfo, not receiverInfo)
		err = userinfo.conn.WriteJSON(map[string]interface{}{
			"Type":     "chat-history",
			"ChatWith": msg.Receiver,
			"username": userinfo.nickname,
			"Messages": messageData,
		})
		if err != nil {
			log.Println("Error sending message history to client:", err)
		}
	}
}
