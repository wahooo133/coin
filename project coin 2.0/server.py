from flask import Flask, request, jsonify
import mysql.connector
import bcrypt
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '123tv321',
    'database': 'timcoin',
    'auth_plugin': 'mysql_native_password'
}

def db_query(query, params=None):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, params or ())
    result = cursor.fetchall()
    conn.commit()
    cursor.close()
    conn.close()
    return result

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        if not all([username, email, password]):
            return jsonify({'error': 'All fields required'}), 400

        existing = db_query(
            'SELECT id FROM users WHERE username = %s OR email = %s',
            (username, email)
        )
        if existing:
            return jsonify({'error': 'User exists'}), 409

        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db_query(
            'INSERT INTO users (username, email, password) VALUES (%s, %s, %s)',
            (username, email, hashed)
        )
        return jsonify({'success': True}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        if not all([username, password]):
            return jsonify({'error': 'Credentials required'}), 400

        user = db_query(
            'SELECT id, username, password FROM users WHERE username = %s',
            (username,)
        )
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        user = user[0]
        if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
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

@app.route('/api/start-mining', methods=['POST'])
def start_mining():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        blocks = data.get('blocks', 1)
        
        # Your mining logic here
        return jsonify({
            'success': True,
            'message': f'Mining {blocks} blocks'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stop-mining', methods=['POST'])
def stop_mining():
    try:
        # Your stop mining logic here
        return jsonify({
            'success': True,
            'message': 'Mining stopped'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)