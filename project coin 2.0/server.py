from flask import Flask, request, jsonify
import mysql.connector
import bcrypt
from flask_cors import CORS
from datetime import datetime

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
        email = data.get('email')
        password = data.get('password')

        # Validate input
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400

        # Check user exists
        user = db_query('SELECT id, username, password FROM users WHERE email = %s', (email,))
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
        # db_query(
        #     'INSERT INTO mining_lock (is_mining) VALUES (%s, 0)'
        # )

        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'userId': user_id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mining-toggle', methods=['POST'])
def mining_toggle():
    try:
        data = request.json
        user_id = data.get('userId')
        action = data.get('action')

        if action == 'start':
            # Kolla om någon redan minar
            current = db_query('SELECT is_mining FROM mining_lock LIMIT 1')[0]
            if current['is_mining']:
                return jsonify({'error': 'Another user is already mining'}), 403
            
            # Starta mining
            db_query(
                'UPDATE mining_lock SET is_mining = 1, start_time = %s',
                (datetime.now(),)
            )
            return jsonify({'success': True, 'message': 'Mining started'})

        elif action == 'stop':
            db_query('UPDATE mining_lock SET is_mining = 0, start_time = NULL')
            return jsonify({'success': True, 'message': 'Mining stopped'})

        else:
            return jsonify({'error': 'Invalid action'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)