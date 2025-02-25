import { Register } from './app.js';
// Function to load different views dynamically
export function navigateTo(page) {

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
    <h2>Register to Forum</h2>
    
    <div class="form-group">
        <label for="nickname">Nickname</label>
        <input type="text" id="nickname" required>
        <p class="error-message" id="nickname-error"></p>
    </div>

    <div class="form-group">
        <label for="age">Age</label>
        <input type="number" id="age" required>
        <p class="error-message" id="age-error"></p>
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
        <p class="error-message" id="firstName-error"></p>
    </div>

    <div class="form-group">
        <label for="lastName">Last Name</label>
        <input type="text" id="lastName" required>
        <p class="error-message" id="lastName-error"></p>
    </div>

    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" required>
        <p class="error-message" id="email-error"></p>
    </div>

    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" required>
        <p class="error-message" id="password-error"></p>
    </div>

    <button class="register-btn2">Register</button>

    <p>Already have an account? <a onclick="navigateTo('login')">Login</a></p>

    <div id="toast" class="toast"></div>
</div>
        `;
    }

    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = content;
    }
    document.querySelector(".register-btn2").addEventListener("click", Register)

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

//export { navigateTo };

