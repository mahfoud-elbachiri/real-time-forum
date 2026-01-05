# Orbit Forum (Real-Time Forum)

A real-time forum application built with a generic Go backend and a vanilla JavaScript frontend. It features live chat, posts, comments, and real-time user interactions using WebSockets.

## Features

- **User Authentication**: Register, Login, and Logout functionality.
- **Real-Time Communication**: Instant updates for chat and interactions using WebSockets.
- **Posts**: Create and view posts in real-time.
- **Comments**: Comment on posts.
- **Reactions**: Like and dislike posts.
- **User Presence**: See online users.
- **Responsive Design**: Built with vanilla CSS for a unified look.

## Tech Stack

- **Backend**: Go (Golang)
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **WebSockets**: For real-time event handling

## Prerequisites

- **Go**: Version 1.18 or higher installed on your system.
- **GCC**: Required for `go-sqlite3` (CGO).
- **Git**: To clone the repository.

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd real-time-forum
   ```

2. **Install Go dependencies**
   ```bash
   go mod tidy
   ```

3. **Database Setup**
   The application uses SQLite. The database file `mydatabase.db` will be verified or initialized automatically when the server starts.

## Running the Application

1. **Start the server**
   Run the following command in the root directory:
   ```bash
   go run main.go
   ```

2. **Access the application**
   Open your browser and navigate to:
   [http://localhost:8063](http://localhost:8063)

## Project Structure

```
real-time-forum/
├── backend/
│   ├── handlers/       # HTTP and WebSocket handlers
│   ├── routes/         # Route definitions
│   └── ...
├── frontend/           # Static frontend files
│   ├── css/
│   ├── js/
│   └── public/
├── database/           # Database initialization
├── main.go             # Entry point
└── go.mod              # Go module definition
```

## Troubleshooting

- **"gcc: executable file not found"**: Ensure you have a C compiler installed (like GCC) as `go-sqlite3` requires CGO.
- **Port already in use**: If port `8063` is busy, check if another instance is running or modify `main.go` to use a different port.
