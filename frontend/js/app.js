import { showError, clearErrors, showpopup, validateEmail } from '/frontend/js/error.js'
import { navigateTo } from '/frontend/js/pages.js'
import { getWebSocket } from '/frontend/js/wbs.js';
export async function Register() {
    clearErrors()
    const obj = {
        nickname: document.getElementById("nickname").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        age: Number(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
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
        navigateTo("login")
    } catch (error) {
        console.error("Error:", error);
        showpopup(error.message, "error");
    }
}


export async function Login() {
    const obj2 = {
        email: document.querySelector("#user").value,
        password: document.querySelector("#password").value
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj2)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message);
        }

        showpopup("Login successful!", "success");
        navigateTo("/");

    } catch (error) {
        console.log("Error:", error);
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
            return true;
        } else {
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
            websocket.close()
            websocket = null
        } else {
            const result = await response.json();
            throw new Error(result.message);
        }
    } catch (error) {
        console.error("Logout error:", error);
        showpopup(error.message, "error");
    } finally {
        // always navigate to login page after logout 
        navigateTo("login");
    }
}


export async function fetchPosts() {
    let respons
    const divpost = document.querySelector(".post-feed")
    try {

        respons = await fetch("/api/fetchposts", {
            headers: { "Content-Type": "application/json" },

        })
        var data = await respons.json();

    } catch (error) {
        showpopup(error.message)
    }
    // data.forEach(element => {

    //     const divv = document.createElement('div')
    //     divv.innerHTML = ` <h2>${element.title}</h2>
    //                    <p>${element.content}</p>
                       
    //                    `

    //     divv.className = "poo"
    //     divpost.appendChild(divv)

    // })

}

//============================================================================
