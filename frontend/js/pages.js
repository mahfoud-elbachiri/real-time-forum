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