from flask import Flask, request, jsonify
import mysql.connector
import bcrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration (same as your Node.js setup)
db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '123tv321',
    'database': 'timcoin'
}

# Helper function for database queries
def db_query(query, params=None):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params or ())
    result = cursor.fetchall()
    conn.commit()
    cursor.close()
    conn.close()
    return result

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        # Validate input
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400

        # Check user exists
        user = db_query('SELECT id, username, password FROM users WHERE username = %s', (username,))
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        user = user[0]

        # Verify password
        if not bcrypt.checkpw(password.encode(), user['password'].encode()):
            return jsonify({'error': 'Invalid credentials'}), 401

        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username']
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # Validate input
        if not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400

        # Check if user exists
        existing_user = db_query(
            'SELECT id FROM users WHERE username = %s OR email = %s',
            (username, email)
        )
        if existing_user:
            return jsonify({'error': 'Username or email already exists'}), 409

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

        # Create user
        db_query(
            'INSERT INTO users (username, email, password) VALUES (%s, %s, %s)',
            (username, email, hashed_password)
        )
        user_id = db_query('SELECT LAST_INSERT_ID() as id')[0]['id']

        # Initialize mining lock
        db_query(
            'INSERT INTO mining_lock (user_id, is_mining) VALUES (%s, 0)',
            (user_id,)
        )

        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'userId': user_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)