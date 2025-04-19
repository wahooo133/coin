const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection pool WITH PORT 3306 ADDED
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,   // ← ONLY THIS LINE WAS ADDED
  user: 'root',
  password: '123tv321',
  database: 'timcoin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// ===== AUTHENTICATION =====
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check existing user
    const [existing] = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?', 
      [username, email]
    );

    if (existing) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result] = await query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Initialize mining lock
    await query(
      'INSERT INTO mining_lock (user_id, is_mining) VALUES (?, 0)',
      [result.insertId]
    );

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const [user] = await query(
      'SELECT id, username, password FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== MINING CONTROL =====
app.get('/api/mining-status/:userId', async (req, res) => {
  try {
    const [status] = await query(
      'SELECT is_mining FROM mining_lock WHERE user_id = ?',
      [req.params.userId]
    );
    res.json({ isMining: status ? Boolean(status.is_mining) : false });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/mining-toggle', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { userId, action } = req.body;

    if (!['start', 'stop'].includes(action)) {
      throw new Error('Invalid action');
    }

    if (action === 'start') {
      const [existing] = await connection.query(
        'SELECT user_id FROM mining_lock WHERE is_mining = 1 FOR UPDATE'
      );
      
      if (existing && existing.user_id !== userId) {
        throw new Error('Mining already in progress by another user');
      }

      await connection.query(
        `INSERT INTO mining_lock (user_id, is_mining) 
         VALUES (?, 1) 
         ON DUPLICATE KEY UPDATE is_mining = 1`,
        [userId]
      );
    } else {
      await connection.query(
        'UPDATE mining_lock SET is_mining = 0 WHERE user_id = ?',
        [userId]
      );
    }

    await connection.commit();
    res.json({ success: true });

  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

app.post('/api/record-mining', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    await query(
      'INSERT INTO mining_transactions (user_id, amount) VALUES (?, ?)',
      [userId, parseFloat(amount)]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record mining' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});