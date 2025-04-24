// Check login state on load
function checkAuthState() {
    const username = localStorage.getItem('username');
    if (username) updateUI(username);
}

// Update UI based on login state
function updateUI(username = null) {
    const authButtons = document.getElementById('auth-buttons');
    const userStatus = document.getElementById('user-status');
    
    if (username) {
        authButtons.style.display = 'none';
        userStatus.style.display = 'flex';
        document.getElementById('username-display').textContent = username;
    } else {
        authButtons.style.display = 'flex';
        userStatus.style.display = 'none';
    }
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.username);
        updateUI(data.user.username);
        document.querySelector("#login-popup").classList.remove("active");
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message);
    }
}

// Registration handler
async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

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
        console.error('Registration error:', error);
        alert(error.message);
    }
}

// Logout handler
function handleLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    updateUI();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('signup-btn').addEventListener('click', handleSignup);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
});