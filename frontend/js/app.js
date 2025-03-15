import { showError, clearErrors, showpopup, validateEmail } from '/frontend/js/error.js'
import { navigateTo } from '/frontend/js/pages.js'
let websocket
//  const socket = new WebSocket('ws://localhost:8005/ws');
export async function Register() {
    clearErrors()
    const obj = {
        nickname: document.getElementById("nickname").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        age: Number(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    };

    const fields = {
        nickname: { value: obj.nickname, message: "Nickname is required." },
        age: { value: obj.age, condition: obj.age <= 7 || isNaN(obj.age), message: "Please enter a valid age." },
        firstName: { value: obj.firstName, message: "First name is required." },
        lastName: { value: obj.lastName, message: "Last name is required." },
        email: { value: obj.email, condition: !validateEmail(obj.email), message: "Please enter a valid email address." },
        password: { value: obj.password, condition: obj.password.length < 6, message: "Password must be at least 6 characters." }
    };

    let hasError = Object.keys(fields).some(field => {
        const { value, condition, message } = fields[field];
        if (!value || condition) {
            document.getElementById(field).value = "";
            showError(field, message);
            return true;
        }
        return false;
    });

    if (hasError) return;


    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj),
        });

        const result = await response.json();
        console.log("Response:", result);

        if (!response.ok) {
            throw new Error(result.message);
        }

        showpopup("Registered successfully!", "success");
        navigateTo("login")
    } catch (error) {
        console.error("Error:", error);
        showpopup(error.message, "error");
    }
}


export async function Login() {
    const obj2 = {
        email: document.querySelector("#user").value,
        password: document.querySelector("#password").value
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj2)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message);
        }

        showpopup("Login successful!", "success");
        navigateTo("/");

    } catch (error) {
        console.log("Error:", error);
        showpopup(error.message, "error");
    }
}


export async function checkSession() {
    try {
        const response = await fetch("/checksession", {
            method: "GET",
            credentials: "include",
        });


        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Session check error:", error);
        return false;
    }
}

export async function logout() {
    try {
        const response = await fetch("/api/logout", {
            method: "POST"
        });

        if (response.ok) {
            showpopup("Logged out successfully", "success");
            websocket.close()
            websocket = null
        } else {
            const result = await response.json();
            throw new Error(result.message);
        }
    } catch (error) {
        console.error("Logout error:", error);
        showpopup(error.message, "error");
    } finally {
        // always navigate to login page after logout 
        navigateTo("login");
    }
}


export async function fetchPosts() {
    let respons
    const divpost = document.querySelector(".post-feed")
    try {

        respons = await fetch("/api/fetchposts", {
            headers: { "Content-Type": "application/json" },

        })
        var data = await respons.json();

    } catch (error) {
        showpopup(error.message)
    }
    data.forEach(element => {

        const divv = document.createElement('div')
        divv.innerHTML = ` <h2>${element.title}</h2>
                       <p>${element.content}</p>
                       
                       `

        divv.className = "poo"
        divpost.appendChild(divv)

    })

}

//============================================================================

export async function afficher_users() {
    try {
        const response = await fetch("/api/users", {
            method: "GET",
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(result.message);
        }
        const users = await response.json();
        const usersDiv = document.getElementById('users');
        usersDiv.innerHTML = ''
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.textContent = user.nickname;
            userElement.classList.add('user-item');
            const statu = document.createElement('div');
            statu.classList.add(`${user.nickname}`);
            userElement.appendChild(statu);
            usersDiv.appendChild(userElement);
        });
    } catch (error) {
        console.error("error in fetching users:", error);
        return false;
    }
}

//  export async function openChatPopup(nickname){
//     console.log(nickname);

//  }

// Open the chat popup with the selected user's nickname
export function openChatPopup(username) {
    if (document.getElementById('chat-' + username)) {
        return;
    }
    const chatBox = document.createElement('div');
    chatBox.classList.add('chat-box');
    chatBox.id = 'chat-' + username;

    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chat-header');

    const headerContent = document.createElement('div');
    const userstatus = document.getElementsByClassName(username)[0]

    headerContent.innerHTML = `<span id= ${userstatus.id}-bot></span> ${username}`;

    const x = document.createElement('div');
    x.classList.add('chat-x');
    x.id = username;
    x.innerText = "×";

    const chatMessages = document.createElement('div');
    chatMessages.classList.add('chat-messages');
    chatMessages.id = `chat-messages-${username}`;

    const chatInput = document.createElement('div');
    chatInput.classList.add('chat-input');

    const textarea = document.createElement('textarea');
    textarea.classList.add("messag-box");
    textarea.id = `box-${username}`;
    textarea.placeholder = "Aa";
    textarea.rows = 1;

    const sendButton = document.createElement('button');
    sendButton.classList.add("send");
    sendButton.id = `send-${username}`;
    sendButton.innerHTML = '<svg class="send-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>';

    chatInput.appendChild(textarea);
    chatInput.appendChild(sendButton);
    chatHeader.appendChild(headerContent);
    chatHeader.appendChild(x);

    chatBox.appendChild(chatHeader);
    chatBox.appendChild(chatMessages);
    chatBox.appendChild(chatInput);

    document.getElementById('chat-container').appendChild(chatBox);

    // Auto-resize textarea based on content
    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight < 100) ? this.scrollHeight + 'px' : '100px';
    });

    sendButton.addEventListener("click", function () {
        sendMessage(username, textarea);
    });

    textarea.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(username, textarea);
        }
    });
    getmessagefromdb(username)
}
function getmessagefromdb(username) {
    const data = {
        type: "get-message",
        reciver: username,
    };
    websocket.send(JSON.stringify(data));
}

//=========================================================================
function sendMessage(username, textarea) {


    const message = textarea.value.trim();
    if (message !== "") {
        const data = {
            type: "send-message",
            reciver: username,
            msg: message
        };
        websocket.send(JSON.stringify(data));
        textarea.value = "";
        textarea.style.height = 'auto';
    }
}

//===========================add popup======================
export function closechat(userId) {
    console.log(userId);
    const childDiv = document.querySelector(`#chat-${userId}`);
    childDiv.remove()
}

//========================================= websocket==================================

export function createWebSockets() {
    websocket = new WebSocket(`ws://${window.location.host}/ws`);

    websocket.onopen = function () {
        console.log('WebSocket opened');
    };

    websocket.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.Type === "enligneusers") {
            usersenligne(data.Enligneusers);
        }
        else if (data.Type === "message") {
            const chatId = data.mymsg ? `chat-messages-${data.receiver}` : `chat-messages-${data.Sender}`;
            const chat = document.getElementById(chatId);

            if (chat) {
                const messageDiv = document.createElement("div");
                messageDiv.classList.add("message");
                messageDiv.classList.add(data.mymsg ? "sent" : "received");

                const messageContent = document.createElement("div");
                messageContent.textContent = data.msg;

                const messageTime = document.createElement("div");
                messageTime.classList.add("message-time");
                messageTime.textContent = data.time;

                messageDiv.appendChild(messageContent);
                messageDiv.appendChild(messageTime);
                chat.appendChild(messageDiv);

                // Scroll to bottom
                chat.scrollTop = chat.scrollHeight;
            }
        } else if (data.Type === "chat-history") {
            // Handle chat history
            console.log("Chat history received:", data);

            // Use the ChatWith field to identify the chat correctly
            const chatId = `chat-messages-${data.ChatWith}`;
            const chat = document.getElementById(chatId);

            if (chat) {
                console.log("Found chat element:", chatId);

                // Clear existing messages if needed
                // chat.innerHTML = '';

                // Check if we have messages
                if (data.Messages && data.Messages.length > 0) {
                    data.Messages.forEach(msg => {
                        const messageDiv = document.createElement("div");
                        messageDiv.classList.add("message");
                        const isSent = msg.sender === data.username;
                        messageDiv.classList.add(isSent ? "sent" : "received");

                        const messageContent = document.createElement("div");
                        messageContent.textContent = msg.content;

                        const messageTime = document.createElement("div");
                        messageTime.classList.add("message-time");
                        messageTime.textContent = msg.date;

                        messageDiv.appendChild(messageContent);
                        messageDiv.appendChild(messageTime);
                        chat.appendChild(messageDiv);
                    });

                    // Scroll to bottom
                    chat.scrollTop = chat.scrollHeight;
                } else {
                    console.log("No messages found in the chat history");
                }
            } else {
                console.error("Chat element not found:", chatId);
            }
        }
    }
}
function usersenligne(enligneusers) {

    let usersinfront = document.body.querySelectorAll(".user-item")
    usersinfront.forEach(user => {
        if (enligneusers.includes(user.textContent)) {

            const userdiv = document.getElementsByClassName(user.textContent)[0]
            userdiv.id = "enligne"
        } else {
            const userdiv = document.getElementsByClassName(user.textContent)[0]
            userdiv.id = "ofligne"
        }
    });
}


