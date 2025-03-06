import { Register, Login, checkSession, logout } from '/frontend/js/app.js';


// Define which routes are public (don't require login)
const publicRoutes = ["/login", "/register"];

// Add event listeners
function addListeners() {
  document.body.addEventListener("click", function (event) {
    if (event.target.matches(".register-btn")) {
      navigateTo("register");
    } 
    else if (event.target.matches("#register-submit")) {
      Register();
    } 
    else if (event.target.matches("#link-login")) {
      navigateTo("login");
    }
    else if (event.target.matches(".login-btn")) {
      Login();
    }
    else if (event.target.matches(".logout-btn")) {
      logout();
    }
  });
}

// Navigation function
export function navigateTo(page) {
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
        <button id="register-submit">Register</button>
        <p>Already have an account? <a id="link-login">Login</a></p>
      </div>
    `;
  }
  else if (page === "/") {
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
    `;
  }else if (page === "404"){
   `    
   
   <div id="loginform">
        <div class="container">
          <h2>Login</h2>
          <input type="text" id="user" placeholder="Username or Email" required>
          <input type="password" id="password" placeholder="Password" required>
          <button class="login-btn">Login</button>
          <button class="register-btn">Register</button>
        </div>
      </div>
       
      
      `
  }else {
     `<h2>404 not found</h2>
           `
           
  }
 
  const stylo = document.getElementById('page-style');
  if (stylo) {
    if (page === "/") {
      stylo.href = `/frontend/css/home.css`;
    } else {
      stylo.href = `/frontend/css/${page}.css`;
    }
  }

 
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = content;
  }

  
  window.history.pushState({ page: page }, "", page);
}
/*
// Make these global so they can be called from HTML
window.createPost = function() {
  console.log("Create post function called");
  // Implement post creation logic
};

window.filterPosts = function(filter) {
  console.log("Filter posts:", filter);
  // Implement post filtering logic
};

window.sendMessage = function() {
  const message = document.getElementById('messageInput').value;
  console.log("Sending message:", message);
  // Implement message sending logic
};
*/

 
const routes = {
    "/": "/",            
    "/login": "login",      
    "/register": "register", 
    404:"404"
  };
  
 
async function router() {
  let path = window.location.pathname;
  console.log("path : " ,path);
  

  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  let page = routes[path] || "404";

  const isLoggedIn = await checkSession();
    console.log("e" ,isLoggedIn);
    
  // Enforce authentication for non-public routes
  if (!publicRoutes.includes(path) && !isLoggedIn) {
    console.log("Not logged in, redirecting to login");
    page = "login";
    window.history.replaceState({ page: page }, "", "/login");
  }
  
  // Handle login redirect when already logged in
  if (isLoggedIn && publicRoutes.includes(path)) {
    console.log("Already logged in, redirecting to home");
    page = "/";
    window.history.replaceState({ page: page }, "", "/");
  }
  
  
 
  navigateTo(page);
}

 function init() {
  addListeners();
  
  
  window.addEventListener("popstate", router);
  
  router();
}
 
init();