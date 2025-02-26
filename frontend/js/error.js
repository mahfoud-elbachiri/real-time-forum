
export function showError(field, message) {
    let errorElement = document.getElementById(`${field}-error`);
    if (!errorElement) {
        errorElement = document.createElement("p");
        errorElement.id = `${field}-error`;
        errorElement.className = "error-message";
        document.getElementById(field).parentNode.appendChild(errorElement);
    }
    errorElement.innerText = message;
}

export function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el => el.innerText = "");
}

export function showpopup(message, type = "error") {
    const popup = document.getElementById("popup");
    popup.innerText = message;
    popup.className = "popup " + type;
    popup.style.display = "block";
    setTimeout(() => { popup.style.display = "none"; }, 3000);
}
export function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}