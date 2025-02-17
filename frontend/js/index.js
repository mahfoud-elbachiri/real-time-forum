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