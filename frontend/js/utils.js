
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

export function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'min', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}
