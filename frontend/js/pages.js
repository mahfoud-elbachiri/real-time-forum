// document.querySelector(".register-btn").addEventListener("click", function () {
//     navigateTo("register")
// })

import {Register,Login} from '/frontend/js/app.js'
 
function addListers() {
    document.body.addEventListener("click", function (event) {
        if (event.target.matches(".register-btn")) {
            navigateTo("register");
        } 
        else if (event.target.matches("#register-submit")) {
            Register();
        } 
        else if (event.target.matches("#link-login")) {
            navigateTo("login");
        }else if (event.target.matches(".login-btn")) {
            Login();
        }
    });
}

 export function navigateTo(page) {
    let content = ""
    
 
    if (page === "login") {

 content = `

    <div id="loginform">
        <div class="container">
            <h2>Login</h2>
            <input type="text" id="user" placeholder="Username or Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button class="login-btn">Login</button>
            <button class="register-btn">register</button>
        </div>
    </div>
       
        `;
    }
    else if (page === "register") {
        content = `
    <div class="container">
        <h2>Register</h2>
        <div class="form-group">
            <label for="nickname">Nickname</label>
            <input type="text" id="nickname" required>
        </div>
        <div class="form-group">
            <label for="age">Age</label>
            <input type="number" id="age" required>
        </div>
        <div class="form-group">
            <label for="gender">Gender</label>
            <select id="gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
        </div>
        <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" required>
        </div>
        <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" required>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
        </div>
        <button  id="register-submit">Register</button>
        <p>Already have an account ? <a id="link-login">Login</a></p>
    </div>
        `;
    }else if (page === "home") {
     content=   `
     <div class="home-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <h2>Forum Menu</h2>
            <ul>
                <li><button onclick="navigateTo('createPost')">➕ Create Post</button></li>
                <li><button onclick="filterPosts('all')">📌 All Posts</button></li>
                <li><button onclick="filterPosts('my')">📝 My Posts</button></li>
                <li><button onclick="filterPosts('liked')">❤️ Liked Posts</button></li>
                <li><button onclick="logout()">🚪 Logout</button></li>
            </ul>
    
            <h3>Categories</h3>
            <ul id="category-list">
                <li><button onclick="filterPosts('tech')">💻 Tech</button></li>
                <li><button onclick="filterPosts('gaming')">🎮 Gaming</button></li>
                <li><button onclick="filterPosts('sports')">⚽ Sports</button></li>
            </ul>
        </aside>
    
        <!-- Main Content -->
        <main class="content">
            <h2>Forum Posts</h2>
            <div id="post-feed">Loading posts...</div>
        </main>
    
        <!-- Private Messages Section -->
        <aside class="messages">
            <h2>Private Messages</h2>
            <div id="message-list">
                <p>No messages yet.</p>
            </div>
            <input type="text" id="messageInput" placeholder="Type a message...">
            <button onclick="sendMessage()">Send</button>
        </aside>
    </div>
        `
    }

    const stylo = document.getElementById('page-style');
    if (stylo) {
        stylo.href = `/frontend/css/${page}.css`
    }

    const app = document.getElementById('app');
        if (app) {
            app.innerHTML = content;
        }

      //  addListers()
 }


 addListers()