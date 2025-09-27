from flask import Blueprint, jsonify, request
from database import get_db
from util import normalize_strings
from services.open_library_service import OpenLibraryService

categories_api = Blueprint('categories_api', __name__, url_prefix='/api/categories')

@categories_api.route('/', methods=['GET'])
def get_categories():
    """Fetch all categories from the database."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM categories")
                categories = cursor.fetchall()
                return jsonify(categories)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@categories_api.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    """Fetch a single category by its ID."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM categories WHERE id = %s", (category_id,))
                category = cursor.fetchone()
                if category:
                    return jsonify(category)
                else:
                    return jsonify({"error": "Category not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @categories_api.route('/name/<string:category_name>', methods=['GET'])
# def get_category_by_name(category_name):
#     """Fetch a single category by its name."""
#     try:
#         with get_db() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("SELECT * FROM categories WHERE LOWER(name) = LOWER(%s)", (category_name,))
#                 category = cursor.fetchone()
#                 if category:
#                     return jsonify(category)
#                 else:
#                     return jsonify({"error": "Category not found"}), 404
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

@categories_api.route('/', methods=['POST'])
def add_category():
    """Add a new category to the database."""
    try:
        data = request.get_json()
        name = normalize_strings(data.get('name'))

        if not name:
            return jsonify({"error": "Category name is required"}), 400

        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING id", (name,))
                new_category_id = cursor.fetchone()["id"]
                return jsonify({"message": "Category added", "category_id": new_category_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@categories_api.route('/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    """Update an existing category."""
    try:
        data = request.get_json()
        name = normalize_strings(data.get('name'))

        if not name:
            return jsonify({"error": "Category name is required"}), 400

        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE categories SET name = %s WHERE id = %s", (name, category_id))
                if cursor.rowcount == 0:
                    return jsonify({"error": "Category not found"}), 404
                return jsonify({"message": "Category updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@categories_api.route('/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """Delete a category by its ID."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM categories WHERE id = %s", (category_id,))
                if cursor.rowcount == 0:
                    return jsonify({"error": "Category not found"}), 404
                return jsonify({"message": "Category deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@categories_api.route('/<int:category_id>/books', methods=['GET'])
def get_books_by_category(category_id):
    """Fetch all books for a specific category."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT b.* 
                    FROM books b
                    JOIN book_categories bc ON b.id = bc.book_id
                    WHERE bc.category_id = %s
                """, (category_id,))
                books = cursor.fetchall()
                if books:
                    return jsonify(books)
                else:
                    return jsonify({"error": "No books found for this category"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500