document.getElementsByClassName("login").addEventListener("click", login)

function login(){
    const user = document.getElementById("user")
    const password = document.getElementById("passeword")
    fetch("/login", {
        method : "post",
        headers : {
             "Content-Type": "application/json"
        },
        body: JSON.stringify({ user, password })
    })
}





// Function to load different views dynamically
function navigateTo(page) {
    let content = "";
    
    if (page === "home") {
        content = `<h2>Welcome to the Forum</h2><p>This is the home page.</p>`;
    } 
    else if (page === "login") {
        content = `
            <h2>Login</h2>
            <form id="loginForm">
                <label for="email">Email</label>
                <input type="email" id="email" required>
                
                <label for="password">Password</label>
                <input type="password" id="password" required>

                <button type="submit">Login</button>
            </form>
        `;
    } 
    else if (page === "register") {
        content = `
            <h2>Register</h2>
            <form id="registerForm">
                <label for="nickname">Nickname</label>
                <input type="text" id="nickname" required>
                
                <label for="email">Email</label>
                <input type="email" id="email" required>
                
                <label for="password">Password</label>
                <input type="password" id="password" required>

                <button type="submit">Register</button>
            </form>
        `;
    }

    // Update the content inside #app
    document.getElementById("app").innerHTML = content;
}

// Load home page by default
navigateTo("home");
