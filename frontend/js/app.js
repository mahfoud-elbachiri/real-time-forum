// document.getElementsByClassName("login").addEventListener("click", login)

// function login(){
//     const user = document.getElementById("user")
//     const password = document.getElementById("passeword")
//     fetch("/login", {
//         method : "post",
//         headers : {
//              "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ user, password })
//     })
// }

 
async function Register() {
    document.getElementById("form").addEventListener("submit", async function (evnt) {
        evnt.preventDefault();

        const obj = {
            nickname: document.getElementById("nickname").value.trim(),
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            age: Number(document.getElementById("age").value), // Ensure number type
            gender: document.getElementById("gender").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value.trim(),
        };

        console.log("Sending Data:", obj); // Debugging step

        try {
            const response = await fetch("http://localhost:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(obj),
            });

            const result = await response.json(); // Ensure response is JSON
            console.log("Response:", result);

            if (!response.ok) {
                throw new Error(result.message || "Registration failed");
            }

            alert("Registered successfully!");
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred: " + error.message);
        }
    });
}

document.querySelector(".register-btn").addEventListener("click", function () {
    navigateTo("register")
})

async function Login() {

    document.querySelector(".login-btn").addEventListener("click", async function(event) {
        event.preventDefault()
    
        const obj = {
            user : document.querySelector("user"),
            password : document.querySelector("password")
        }
    
        try {
            const response = await fetch ("/login" , {
                method : "POST",
                body :  JSON.stringify(obj)
            })
        }catch (eror){
            console.log(eror);  
        }
       
    })
}



// Function to load different views dynamically
function navigateTo(page) {

    let content = ""

    if (page === "login") {

        content = `

  <div id="loginform">
    <div class="container">
      <h2>Login</h2>
      <input type="text" id="user" placeholder="Username or Email" required>
      <input type="password" id="password" placeholder="Password" required>
      <button type="login">Login</button>
      <button class="register-btn">register</button>
      <!-- <div class="login-btn">Register</div> -->
    </div>
    <div id="app"></div>
    <div>
      <script src="/frontend/js/app.js"></script>
        `;
    }
    else if (page === "register") {
        content = `
            <div class="container">
            <form id="form">
        <h2>Register to Forum</h2>
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
        <button type="submit" onclick="Register()" >Register</button>
        </form>
        <p>Already have an account? <a onclick="navigateTo('login')">Login</a></p>
    </div>
        `;
    }

    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = content;
    }

    const stylo = document.getElementById('page-style');
    if (stylo) {
        stylo.href = `/frontend/css/${page}.css`
    }

    setTimeout(() => {
        const registerButton = document.querySelector(".register-btn")
        if (registerButton) {
            registerButton.addEventListener("click", () => navigateTo("register"))
        }
    }, 0)
    // Update the content inside #app
}
