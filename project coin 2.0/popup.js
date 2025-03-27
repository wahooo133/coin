document.querySelector("#show-login").addEventListener("click", function () {
    document.querySelector("#login-popup").classList.add("active");
});

document.querySelector("#show-signup").addEventListener("click", function () {
    document.querySelector("#signup-popup").classList.add("active");
});

document.querySelectorAll(".popup .close-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        this.closest(".popup").classList.remove("active");
    });
});


// Show login/signup popups
document.querySelector("#show-login").addEventListener("click", function () {
    document.querySelector("#login-popup").classList.add("active");
});

document.querySelector("#show-signup").addEventListener("click", function () {
    document.querySelector("#signup-popup").classList.add("active");
});

// Close popups
document.querySelectorAll(".popup .close-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        this.closest(".popup").classList.remove("active");
    });
});

// Check login status on page load
document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
        updateUI(loggedInUser);
    }
});

// Login functionality
document.querySelector('#login-popup button').addEventListener('click', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // In a real application, verify credentials with server
    // For demo, just store the email as username
    sessionStorage.setItem('loggedInUser', email);
    updateUI(email);
    document.querySelector('#login-popup').classList.remove('active');
});

// Signup functionality
document.querySelector('#signup-popup button').addEventListener('click', function(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    // In a real application, send data to server
    // For demo, store the name as username
    sessionStorage.setItem('loggedInUser', name);
    updateUI(name);
    document.querySelector('#signup-popup').classList.remove('active');
});

// Logout functionality
document.querySelector('#logout-btn').addEventListener('click', function() {
    sessionStorage.removeItem('loggedInUser');
    updateUI(null);
});

function updateUI(username) {
    const loginBtn = document.querySelector('#show-login');
    const signupBtn = document.querySelector('#show-signup');
    const loggedInText = document.querySelector('#logged-in-text');
    const usernameDisplay = document.querySelector('#username-display');
    const logoutBtn = document.querySelector('#logout-btn');

    if (username) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        loggedInText.style.display = 'inline';
        logoutBtn.style.display = 'inline-block';
        usernameDisplay.textContent = username;
    } else {
        loginBtn.style.display = 'inline-block';
        signupBtn.style.display = 'inline-block';
        loggedInText.style.display = 'none';
        logoutBtn.style.display = 'none';
        usernameDisplay.textContent = '';
    }
}
