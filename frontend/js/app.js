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

    let csspath ="/frontend/css/login.css"
    let content = "";
    
    if (page === "home") {
        content = `<h2>Welcome to the Forum</h2><p>This is the home page.</p>`;
    } 
    else if (page === "login") {
         
        content = `
        <div id="loginform">
         <div class="container">
            <h2>Login</h2>
                <input type="text" id="user" placeholder="Username or Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="login">Login</button>

            <div class="register-btn">Register</div>
         </div>
         <div>
        `;
    } 
    else if (page === "register") {
        csspath = "/frontend/css/register.css"
        content = `
            <form id="registerForm">
        <div class="container">
            <h2>Register to Forum</h2>

            <div class="form-group">
                <label for="nickname">Nickname</label>
                <input type="text" id="nickname" name="nickname" required>
            </div>
            <div class="form-group">
                <label for="age">Age</label>
                <input type="number" id="age" name="age" required>
            </div>
            <div class="form-group">
                <label for="gender">Gender</label>
                <select id="gender" name="gender">
                    <option value="male">Male</option>
                    <option value="female">Female</option>

                </select>
            </div>
            <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" required>
            </div>
            <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Register</button>

            <p>Already have an account? <a href="navigateTo("login")">Login</a></p>
        </div>
    </form>

 
        `;
    }

 
    document.getElementById("page-style").setAttribute("href", csspath);

    // Update the content inside #app
    document.getElementById("app").innerHTML = content;
}

// Load home page by default
navigateTo("home");
