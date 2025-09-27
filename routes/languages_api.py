from flask import Blueprint, jsonify, request
from database import get_db
from util import normalize_strings

languages_api = Blueprint('languages_api', __name__, url_prefix='/api/languages')

@languages_api.route('/', methods=['GET'])
def get_languages():
    """Fetch all languages from the database."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM languages")
                languages = cursor.fetchall()
                return jsonify(languages)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@languages_api.route('/<int:language_id>', methods=['GET'])
def get_language(language_id):
    """Fetch a single language by its ID."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM languages WHERE id = %s", (language_id,))
                language = cursor.fetchone()
                if language:
                    return jsonify(language)
                else:
                    return jsonify({"error": "Language not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@languages_api.route('/', methods=['POST'])
def add_language():
    """Add a new language to the database."""
    try:
        data = request.get_json()
        name = normalize_strings(data.get('name'))

        if not name:
            return jsonify({"error": "Language name is required"}), 400

        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("INSERT INTO languages (name) VALUES (%s) RETURNING id", (name,))
                new_language_id = cursor.fetchone()["id"]
                return jsonify({"message": "Language added", "language_id": new_language_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@languages_api.route('/<int:language_id>', methods=['PUT'])
def update_language(language_id):
    """Update an existing language."""
    try:
        data = request.get_json()
        name = normalize_strings(data.get('name'))

        if not name:
            return jsonify({"error": "Language name is required"}), 400

        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE languages SET name = %s WHERE id = %s", (name, language_id))
                if cursor.rowcount == 0:
                    return jsonify({"error": "Language not found"}), 404
                return jsonify({"message": "Language updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@languages_api.route('/<int:language_id>', methods=['DELETE'])
def delete_language(language_id):
    """Delete a language by its ID."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM languages WHERE id = %s", (language_id,))
                if cursor.rowcount == 0:
                    return jsonify({"error": "Language not found"}), 404
                return jsonify({"message": "Language deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
