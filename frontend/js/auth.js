// Authentication module
import { showpopup } from '/frontend/js/utils.js';
import { navigateTo } from '/frontend/js/router.js';
import { getWebSocket } from '/frontend/js/chat.js';
import { showError, clearErrors, validateEmail } from '/frontend/js/utils.js';

window.currentUser = null;

export async function Register() {
    clearErrors();
    const obj = {
        nickname: document.getElementById("nickname").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        age: Number(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        avatar_url: document.querySelector('input[name="avatar"]:checked')?.value || "",
    };

    const fields = {
        nickname: { value: obj.nickname, message: "Nickname is required." },
        age: { value: obj.age, condition: obj.age <= 7 || isNaN(obj.age), message: "Please enter a valid age." },
        firstName: { value: obj.firstName, message: "First name is required." },
        lastName: { value: obj.lastName, message: "Last name is required." },
        email: { value: obj.email, condition: !validateEmail(obj.email), message: "Please enter a valid email address." },
        password: { value: obj.password, condition: obj.password.length < 6, message: "Password must be at least 6 characters." }
    };

    let hasError = Object.keys(fields).some(field => {
        const { value, condition, message } = fields[field];
        if (!value || condition) {
            document.getElementById(field).value = "";
            showError(field, message);
            return true;
        }
        return false;
    });

    if (hasError) return;

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj),
        });

        const result = await response.json();
        console.log("Response:", result);

        if (!response.ok) {
            throw new Error(result.message);
        }

        showpopup("Registered successfully!", "success");
        navigateTo("login");
    } catch (error) {
        console.error("Error:", error);
        showpopup(error.message, "error");
    }
}

export async function Login() {
    const obj2 = {
        email: document.querySelector("#user").value,
        password: document.querySelector("#password").value
    };

    if (!obj2.email || !obj2.password) {
        showpopup("Please fill in all fields");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj2)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error("login ghalat");
        }

        showpopup("Login successful!", "success");
        navigateTo("/");
    } catch (error) {
        showpopup(error.message, "error");
    }
}

export async function checkSession() {
    try {
        const response = await fetch("/checksession", {
            method: "GET",
            credentials: "include",
        });

        if (response.ok) {
            const data = await response.json();
            window.currentUser = data;
            return true;
        } else {
            window.currentUser = null;
            return false;
        }
    } catch (error) {
        console.error("Session check error:", error);
        return false;
    }
}

export async function logout() {
    try {
        const response = await fetch("/api/logout", {
            method: "POST"
        });

        if (response.ok) {
            showpopup("Logged out successfully", "success");
            const websocket = getWebSocket();
            if (websocket) websocket.close();
        } else {
            const result = await response.json();
            throw new Error(result.message);
        }
    } catch (error) {
        showpopup(error.message, "error");
    } finally {
        navigateTo("login");
    }
}
