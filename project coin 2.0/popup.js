document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const showLoginBtn = document.querySelector("#show-login");
    const showSignupBtn = document.querySelector("#show-signup");
    const loginBtn = document.querySelector("#login-btn");
    const signupBtn = document.querySelector("#signup-btn");
    const logoutBtn = document.querySelector("#logout-btn");

    // Event Listeners
    if (showLoginBtn) showLoginBtn.addEventListener("click", showLoginPopup);
    if (showSignupBtn) showSignupBtn.addEventListener("click", showSignupPopup);
    if (loginBtn) loginBtn.addEventListener("click", handleLogin);
    if (signupBtn) signupBtn.addEventListener("click", handleSignup);
    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

    // Close buttons
    document.querySelectorAll(".popup .close-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            this.closest(".popup").classList.remove("active");
        });
    });

    checkAuthStatus();
});

// UI Functions
function showLoginPopup() {
    document.querySelector("#login-popup").classList.add("active");
}

function showSignupPopup() {
    document.querySelector("#signup-popup").classList.add("active");
}

function updateUI(username) {
    const authButtons = document.querySelector("#auth-buttons");
    const userStatus = document.querySelector("#user-status");
    const usernameDisplay = document.querySelector("#username-display");

    if (username) {
        authButtons.style.display = 'none';
        userStatus.style.display = 'flex';
        usernameDisplay.textContent = username;
        localStorage.setItem('username', username);
    } else {
        authButtons.style.display = 'flex';
        userStatus.style.display = 'none';
        usernameDisplay.textContent = '';
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
    }
}

// Auth Functions
async function checkAuthStatus() {
    try {
        const username = localStorage.getItem('username');
        if (username) {
            updateUI(username);
            return;
        }
        updateUI(null);
    } catch (error) {
        console.error('Auth check error:', error);
        updateUI(null);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('userId', data.user.id);
        updateUI(data.user.username);
        document.querySelector("#login-popup").classList.remove("active");
    } catch (error) {
        alert(error.message || 'Login failed');
        console.error('Login error:', error);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        alert('Registration successful! Please login.');
        document.querySelector("#signup-popup").classList.remove("active");
    } catch (error) {
        alert(error.message || 'Registration failed');
        console.error('Registration error:', error);
    }
}

function handleLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    updateUI(null);
}