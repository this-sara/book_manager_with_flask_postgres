from flask import Blueprint, jsonify, request
from database import get_db
from util import normalize_strings

users_api = Blueprint('users_api', __name__, url_prefix='/api/users')

@users_api.route('/', methods=['GET'])
def get_users():
    """Fetch all users from the database."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users")
                users = cursor.fetchall()
                return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_api.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Fetch a single user by its ID."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                user = cursor.fetchone()
                if user:
                    return jsonify(user)
                else:
                    return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_api.route('/', methods=['POST'])
def add_user():
    """Add a new user to the database."""
    try:
        data = request.get_json()
        username = normalize_strings(data.get('username'))
        email = normalize_strings(data.get('email'))
        password_hash = data.get('password_hash')

        if not username or not email or not password_hash:
            return jsonify({"error": "Username, email, and password are required"}), 400

        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
                    (username, email, password_hash)
                )
                new_user_id = cursor.fetchone()["id"]
                return jsonify({"message": "User added", "user_id": new_user_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_api.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update an existing user."""
    try:
        data = request.get_json()
        username = normalize_strings(data.get('username')) if data.get('username') else None
        email = normalize_strings(data.get('email')) if data.get('email') else None
        password_hash = data.get('password_hash') if data.get('password_hash') else None

        if not username and not email and not password_hash:
            return jsonify({"error": "At least one field (username, email, or password) is required"}), 400

        with get_db() as conn:
            with conn.cursor() as cursor:
                update_fields = []
                update_values = []

                if username:
                    update_fields.append("username = %s")
                    update_values.append(username)
                if email:
                    update_fields.append("email = %s")
                    update_values.append(email)
                if password_hash:
                    update_fields.append("password_hash = %s")
                    update_values.append(password_hash)

                update_query = "UPDATE users SET " + ", ".join(update_fields) + " WHERE id = %s"
                cursor.execute(update_query, (*update_values, user_id))

                if cursor.rowcount == 0:
                    return jsonify({"error": "User not found"}), 404

                return jsonify({"message": "User updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_api.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user by its ID."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
                if cursor.rowcount == 0:
                    return jsonify({"error": "User not found"}), 404
                return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
