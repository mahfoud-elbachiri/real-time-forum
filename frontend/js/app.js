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


// document.getElementsByClassName().addEventListener("submit", async function (evnt) {
//     evnt.preventDefault()

//     const nickname = document.getElementById("nickname").value
//     const firstName = document.getElementById("firstName").value
//     const lastName = document.getElementById("lastName").value
//     const age = document.getElementById("age").value
//     const gender = document.getElementById("gender").value
//     const email = document.getElementById("email").value
//     const password = document.getElementById("password").value

//     const obj = {
//         nickname : nickname , 
//         firstName : firstName , 
//         lastName : lastName , 
//         age : age , 
//         gender : gender , 
//         email : email , 
//         password : password , 
//     }

//     try {
//         const response =  await fetch ("/register" , {
//             method : "POST",
//             headers : {"Content-type": "application/json"} ,
//             body : JSON.stringify(obj)

//            });

//            if (response.ok) {
//             prompt("registred succes")
//            }else {
//             const err = response.text()
//             console.log("error in register ",err);

//            }
//     } catch (error) {
//         console.error(error)
//     }


// })
document.querySelector(".register-btn").addEventListener("click", function () {
    navigateTo("register")
})


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
      <!-- <div class="register-btn">Register</div> -->
    </div>
    <div id="app"></div>
    <div>
      <script src="/frontend/js/app.js"></script>
        `;
    }
    else if (page === "register") {
        content = `
            <div class="container">
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
        <button onclick="registerUser()">Register</button>
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
