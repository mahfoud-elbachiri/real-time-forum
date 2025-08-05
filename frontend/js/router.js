
import { Register, Login, checkSession, logout } from '/frontend/js/auth.js';
import { fetchPosts } from '/frontend/js/posts.js';
import { createComment } from '/frontend/js/comments.js';
import { openChatPopup, afficher_users, closechat, createWebSockets } from '/frontend/js/chat.js';
import { avatars } from '/frontend/js/avatars.js';

const publicRoutes = ["/login", "/register"];
let nchat = 0;


function showApp() {
    const app = document.getElementById('app');
    const spinner = document.getElementById('loading-spinner');
    if (app) app.classList.add('loaded');
    if (spinner) spinner.classList.add('hidden');
}

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
                <div class="form-group">
                <div class="form-group">
                    <label>Choose Avatar</label>
                    <div class="avatar-selection">
                        <div class="avatar-category">
                            <span>Men</span>
                            <div class="avatars-grid">
                                ${avatars.men.map((src, i) => `
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="${src}">
                                        <img src="${src}" alt="Man ${i + 1}" loading="lazy">
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <div class="avatar-category">
                            <span>Women</span>
                            <div class="avatars-grid">
                                ${avatars.women.map((src, i) => `
                                    <label class="avatar-option">
                                        <input type="radio" name="avatar" value="${src}">
                                        <img src="${src}" alt="Woman ${i + 1}" loading="lazy">
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                </div>
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
                        <li><button class="logout-btn">🚪 Logout</button></li>
                    </ul>

                    <h3>Categories</h3>
                    <ul id="category-list">
                        <li><button data-category="tech" onclick="filterByCategory('tech')">💻 Tech</button></li>
                        <li><button data-category="gaming" onclick="filterByCategory('gaming')">🎮 Gaming</button></li>
                        <li><button data-category="sports" onclick="filterByCategory('sports')">⚽ Sports</button></li>
                    </ul>
                </aside>

                <!-- Main Content -->
                <main class="content">
                    <div class="content-header">
                        <h2>Forum Posts</h2>
                        <div class="sort-dropdown">
                            <button class="sort-dropdown-btn" onclick="toggleSortDropdown()">
                                <span id="current-sort-icon">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </span>
                                <span id="current-sort-label">Latest</span>
                                <span class="dropdown-arrow">▼</span>
                            </button>
                            <div class="sort-dropdown-menu" id="sort-dropdown-menu">
                                <div class="sort-dropdown-header">Sort by</div>
                                <button data-sort="latest" onclick="setSort('latest')">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    Latest
                                </button>
                                <button data-sort="hot" onclick="setSort('hot')">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                                    Hot
                                </button>
                                <button data-sort="my" onclick="setSort('my')">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    My Posts
                                </button>
                                <button data-sort="rising" onclick="setSort('rising')">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                                    Rising
                                </button>
                            </div>
                        </div>
                       
                       
                    </div>
                    <div class="input-wrapper">
                     <input type="text" id="thread-title" placeholder="Thread Title"> 
                        <button onclick="createPost()">+</button>
                    </div>
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
