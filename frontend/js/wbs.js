let websocket

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
        // console.log(users);
        if (users != null){
            users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.textContent = user.nickname;
                userElement.classList.add('user-item');
                const statu = document.createElement('div');
                statu.classList.add(`${user.nickname}`);
                if (user.unread_count > 0) {

                    statu.classList.add("new-message")
                }
                userElement.appendChild(statu);
                usersDiv.appendChild(userElement);
            });
        }
    } catch (error) {
        console.error("error in fetching users:", error);
        return false;
    }
}
let typingTimeouts = {};  // Timeout to detect when typing stops
let typingStatus = {};  // Track if a user is currently marked as "typing"

export function openChatPopup(username) {
    const divbutton = document.querySelector(`.${username}`);
    divbutton.classList.remove("new-message");

    if (document.getElementById('chat-' + username)) {
        return;
    }

    const chatBox = document.createElement('div');
    chatBox.classList.add('chat-box');
    chatBox.id = 'chat-' + username;

    const chatHeader = document.createElement('div');
    chatHeader.classList.add('chat-header');

    const headerContent = document.createElement('div');
    const userstatus = document.getElementsByClassName(username)[0];

    headerContent.innerHTML = `<span id=${userstatus.id}-bot></span> ${username}`;

    const x = document.createElement('div');
    x.classList.add('chat-x');
    x.id = username;
    x.innerText = "×";

    const chatMessages = document.createElement('div');
    chatMessages.classList.add('chat-messages');
    chatMessages.id = `chat-messages-${username}`;
    chatMessages.dataset.messageOffset = "10";
    chatMessages.dataset.hasMoreMessages = "true";

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

    textarea.addEventListener('input', function () {
        this.style.height = 'auto'
        this.style.height = (this.scrollHeight < 100) ? this.scrollHeight + 'px' : '100px'
        handleTyping(username);
    });

    sendButton.addEventListener("click", function () {
        sendMessage(username, textarea);
        clearTimeout(typingTimeouts[username])
        stopTyping(username)
    });

    textarea.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(username, textarea)
            clearTimeout(typingTimeouts[username])
            stopTyping(username)
        }
    });

    setupScrollListener(username)
    getmessagefromdb(username)
}

function handleTyping(username) {
    if (!typingStatus[username]) {
        typing(username)
        typingStatus[username] = true;
    }

    clearTimeout(typingTimeouts[username])

    typingTimeouts[username] = setTimeout(() => {
        stopTyping(username);
        typingStatus[username] = false
    }, 2000)
}

function typing(username) {
    websocket.send(JSON.stringify({
        type: "typing",
        reciver: username,
    }));
}

function stopTyping(username) {
    websocket.send(JSON.stringify({
        type: "stop_typing",
        reciver: username,
    }));
}


function getmessagefromdb(username, offset = 0, limit = 10) {
    const data = {
        type: "get-message",
        reciver: username,
        offset: offset,
        limit: limit
    };
    websocket.send(JSON.stringify(data));
}
//=================================scroll=============================
function setupScrollListener(username) {
    
    const chatMessages = document.getElementById(`chat-messages-${username}`);
    let offset = 10;
    chatMessages.addEventListener('scroll', function () {
        let hasMoreMessages = chatMessages.dataset.hasMoreMessages
        if (chatMessages.scrollTop < 10 &&   hasMoreMessages === "true") {
            getmessagefromdb(username, offset, 10);
            offset += 10;
            chatMessages.dataset.messageOffset = offset;
        }
    });
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
            messagewbs(data)
        } else if (data.Type === "chat-history") {
            getOldMessages(data)
        } else if (data.Type === "typing") {
            console.log("kteb l " , data.Receiver, data.Sender, "kikteb lih");
            const chatmessage = document.querySelector(`#chat-messages-${data.Sender}`)
            const points = document.querySelector(".typing")
            if (chatmessage && points === null) {
                const typing = document.createElement("div")
                typing.classList.add("typing")
                const typingdot = document.createElement("div")
                typingdot.classList.add("typing-dot")
                typing.appendChild(typingdot)

                const typingone = document.createElement("div")
                typingone.classList.add("typing-dot")
                typing.appendChild(typingone)

                const typingtwo = document.createElement("div")
                typingtwo.classList.add("typing-dot")
                typing.appendChild(typingtwo)
                chatmessage.appendChild(typing)
                chatmessage.scrollTop = chatmessage.scrollHeight
            }
        }else if (data.Type === "stop_typing") {
           document.querySelector(".typing").remove()
        }
    }
}
//======================old messages==========================
function getOldMessages(data){
    const chatId = `chat-messages-${data.ChatWith}`;
    const chat = document.getElementById(chatId);

    if (chat) {
        const isInitialLoad = chat.dataset.messageOffset === "10";

        if (data.Messages && data.Messages.length > 0) {
            const fragment = document.createDocumentFragment();
            const messagesToRender = data.Messages.reverse()
            messagesToRender.forEach(msg => {
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
                fragment.appendChild(messageDiv);
            });
            if (isInitialLoad) {
                chat.appendChild(fragment);
                chat.scrollTop = chat.scrollHeight;
            } else {
                chat.prepend(fragment);
            }
        }
        chat.dataset.hasMoreMessages = data.hasMoreMessages;
    }
}
//=============================msgwbs==================
function messagewbs(data){
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

    }else if (data.mymsg === undefined){
        let usersinfront = document.body.querySelectorAll(".user-item")
        usersinfront.forEach(user => {
            if (data.Sender === user.textContent.trim()) {
                const userdiv = document.getElementsByClassName(user.textContent)[0]
                userdiv.classList.add("new-message")
            } 
        });
    }
}

//================= close chat =========================
export function closechat(userId) {
    const childDiv = document.querySelector(`#chat-${userId}`);
    childDiv.remove()
}

//============================send messages=============================================
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

export function getWebSocket() {
    return websocket;
}