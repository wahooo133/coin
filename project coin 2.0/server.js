const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Create a connection to the MariaDB database
const connection = mysql.createConnection({
    host: 'localhost',      // Replace with your database host
    user: 'root',           // Replace with your database username
    password: '123tv321',   // Replace with your database password
    database: 'timcoin'     // Replace with your database name
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// API for user registration
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    // Log the received data
    console.log('Received registration data:', { username, email, password });

    // Validate input
    if (!username || !email || !password) {
        console.error('Validation failed: All fields are required');
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert into database
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(query, [username, email, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            return res.status(500).json({ error: 'Failed to register user' });
        }
        console.log('User registered successfully:', results);
        res.status(201).json({ message: 'User registered successfully' });
    });
});

// API for user login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            res.status(500).json({ error: 'Failed to log in' });
            return;
        }

        if (results.length === 0) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid password' });
            return;
        }

        res.json({ message: `Welcome back, ${user.username}! You have successfully logged in.`, user: { id: user.id, username: user.username } });
    });
});

// API to fetch all users (for the friend list)
app.get('/api/users', (req, res) => {
    const query = 'SELECT id, username FROM users';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ error: 'Failed to fetch users' });
            return;
        }
        res.json(results);
    });
});

// API to fetch friends of a user
app.get('/api/friends/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT u.username 
        FROM friends f
        JOIN users u ON f.friend_id = u.id
        WHERE f.user_id = ?
    `;
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching friends:', err);
            res.status(500).json({ error: 'Failed to fetch friends' });
            return;
        }
        res.json(results);
    });
});

// API to add a friend
app.post('/api/friends', (req, res) => {
    const { userId, friendUsername } = req.body;

    // Find the friend's user ID
    const query = 'SELECT id FROM users WHERE username = ?';
    connection.query(query, [friendUsername], (err, results) => {
        if (err) {
            console.error('Error finding friend:', err);
            return res.status(500).json({ error: 'Failed to find friend' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Friend not found' });
        }

        const friendId = results[0].id;

        // Insert into friends table
        const insertQuery = 'INSERT INTO friends (user_id, friend_id) VALUES (?, ?)';
        connection.query(insertQuery, [userId, friendId], (err, results) => {
            if (err) {
                console.error('Error adding friend:', err);
                return res.status(500).json({ error: 'Failed to add friend' });
            }
            res.status(201).json({ message: 'Friend added successfully' });
        });
    });
});

// C# FUNCTIONALITY
app.get("/api/startMining", async (req, res) => {
    try {
        const response = await fetch("http://localhost:5000/startMining");

        // Log response for debugging
        const responseText = await response.text();
        console.log("C# API Response:", responseText);

        // Try parsing JSON only if it's valid JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error("Invalid JSON from C# API:", parseError);
            return res.status(500).json({ error: "C# API returned invalid JSON" });
        }

        res.json(data);
    } catch (error) {
        console.error("Error fetching mining result:", error);
        res.status(500).json({ error: "Failed to communicate with mining service" });
    }
});

app.get("/api/registerUser", async (req, res) => {
    console.log("is this even getting called?");
    try {
        const response = await fetch("http://localhost:5000/registerUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, password })
        });

        const responseText = await response.text();
        console.log("C# response status:", response.status);
        console.log("C# response ok?:", response.ok);
        console.log("C# response body:", responseText);

        res.status(200).send(responseText);

    } catch (error) {
        console.error("Error contacting C# API:", error);
        res.status(500).json({ error: "Failed to connect to C# backend" });
    }
});


// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});