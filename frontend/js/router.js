
import { Register, Login, checkSession, logout } from '/frontend/js/auth.js';
import { fetchPosts } from '/frontend/js/posts.js';
import { createComment } from '/frontend/js/comments.js';
import { openChatPopup, afficher_users, closechat, createWebSockets } from '/frontend/js/chat.js';

const publicRoutes = ["/login", "/register"];
let nchat = 0;

 
function showApp() {
    const app = document.getElementById('app');
    const spinner = document.getElementById('loading-spinner');
    if (app) app.classList.add('loaded');
    if (spinner) spinner.classList.add('hidden');
}

// Add event listeners
function addListeners() {
    document.body.addEventListener("click", function (event) {
        if (event.target.matches(".register-btn")) {
            navigateTo("register");
        } else if (event.target.matches("#register-submit")) {
            Register();
        } else if (event.target.matches("#link-login")) {
            navigateTo("login");
        } else if (event.target.matches(".login-btn")) {
            Login();
        } else if (event.target.matches(".logout-btn")) {
            logout();
        } else if (event.target.matches(".user-item")) {
            if (nchat < 3) {
                const userNickname = event.target.textContent.trim();
                openChatPopup(userNickname);
                nchat += 1;
            }
        } else if (event.target.matches(".chat-x")) {
            closechat(event.target.id);
            nchat -= 1;
        } else if (event.target.matches(".comment-btn")) {
            createComment(event.target.id);
        }
    });
}

// Navigation function
export async function navigateTo(page) {
    let content = "";

    if (page === "login") {
        content = `
            <div id="loginform">
                <div class="container">
                    <h2>Login</h2>
                    <input type="text" id="user" placeholder="Username or Email" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <button class="login-btn">Login</button>
                    <button class="register-btn">Register</button>
                </div>
            </div>
        `;
    } else if (page === "register") {
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
                <button id="register-submit">Register</button>
                <p>Already have an account? <a id="link-login">Login</a></p>
            </div>
        `;
    } else if (page === "/") {
        content = `
            <div class="home-container">
                <!-- Sidebar -->
                <aside class="sidebar">
                    <h2>Forum Menu</h2>
                    <ul>
                        <li><button onclick="createPost()">➕ Create Post</button></li>
                        <li><button onclick="filterPosts('all')">📌 All Posts</button></li>
                        <li><button onclick="filterPosts('my')">📝 My Posts</button></li>
                        <li><button onclick="filterPosts('liked')">❤️ Liked Posts</button></li>
                        <li><button class="logout-btn">🚪 Logout</button></li>
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
                    <div class="post-feed">Loading posts...</div>
                </main>

                <!-- Private Messages Section -->
                <aside class="messages">
                    <h2>Private Messages</h2>
                    <div id="allusers">
                        <div id="users"></div>
                    </div>
                </aside>
                <div id="chat-container"></div>
            </div>
            <p></p>
        `;
    } else if (page === "404") {
        content = `
            <div id="loginform">
                <div class="container">
                    <h2>404 - Page Not Found</h2>
                    <button class="login-btn">Go to Login</button>
                </div>
            </div>
        `;
    } else {
        content = `<h2>404 not found</h2>`;
    }

    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = content;
    }

    const stylo = document.getElementById('page-style');
    if (stylo) {
        if (page === "/") {
            fetchPosts();
            await afficher_users();
            createWebSockets();
            stylo.href = `/frontend/css/home.css`;
        } else {
            stylo.href = `/frontend/css/${page}.css`;
        }
    }

    if (history.length > 1) {
        history.pushState({ page: page }, "", page);
    } else {
        history.replaceState({ page: page }, "", page);
    }

    // Show content after everything is ready
    showApp();
}

const routes = {
    "/": "/",
    "/login": "login",
    "/register": "register",
    404: "404"
};

async function router() {
    let path = window.location.pathname;

    if (path !== "/" && path.endsWith("/")) {
        path = path.slice(0, -1);
    }

    let page = routes[path] || "404";
    const isLoggedIn = await checkSession();

    if (!publicRoutes.includes(path) && !isLoggedIn) {
        console.log("not logged in");
        page = "login";
        window.history.replaceState({ page: page }, "", "/login");
    }

    if (isLoggedIn && publicRoutes.includes(path)) {
        console.log("already logged in");
        page = "/";
        window.history.replaceState({ page: page }, "", "/");
    }

    navigateTo(page);
}

// Initialize
addListeners();
window.addEventListener("popstate", router);
router();
