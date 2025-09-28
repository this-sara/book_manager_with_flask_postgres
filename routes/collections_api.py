from flask import Blueprint, jsonify, request
from database import get_db
from util import normalize_strings

collections_api = Blueprint('collections_api', __name__, url_prefix='/api/collections')

@collections_api.route('/', methods=['GET'])
def get_collections():
    """Fetch all collections from the database."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM collections")
                collections = cursor.fetchall()
                return jsonify(collections)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collections_api.route('/<int:collection_id>', methods=['GET'])
def get_collection(collection_id):
    """Fetch a single collection by its ID."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM collections WHERE id = %s", (collection_id,))
                collection = cursor.fetchone()
                if collection:
                    return jsonify(collection)
                else:
                    return jsonify({"error": "Collection not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collections_api.route('/', methods=['POST'])
def add_collection():
    """Add a new collection to the database."""
    try:
        data = request.get_json()
        name = normalize_strings(data.get('name'))
        description = data.get('description')
        user_id = data.get('user_id')

        if not name or not user_id:
            return jsonify({"error": "Name and user_id are required"}), 400

        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO collections (name, description, user_id) VALUES (%s, %s, %s) RETURNING id",
                    (name, description, user_id)
                )
                new_collection_id = cursor.fetchone()["id"]
                return jsonify({"message": "Collection added", "collection_id": new_collection_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collections_api.route('/<int:collection_id>', methods=['PUT'])
def update_collection(collection_id):
    """Update an existing collection."""
    try:
        data = request.get_json()
        name = normalize_strings(data.get('name')) if data.get('name') else None
        description = data.get('description') if data.get('description') else None

        if not name and not description:
            return jsonify({"error": "At least one field (name or description) is required"}), 400

        with get_db() as conn:
            with conn.cursor() as cursor:
                update_fields = []
                update_values = []

                if name:
                    update_fields.append("name = %s")
                    update_values.append(name)
                if description:
                    update_fields.append("description = %s")
                    update_values.append(description)

                update_query = "UPDATE collections SET " + ", ".join(update_fields) + " WHERE id = %s"
                cursor.execute(update_query, (*update_values, collection_id))

                if cursor.rowcount == 0:
                    return jsonify({"error": "Collection not found"}), 404

                return jsonify({"message": "Collection updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collections_api.route('/<int:collection_id>', methods=['DELETE'])
def delete_collection(collection_id):
    """Delete a collection by its ID."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM collections WHERE id = %s", (collection_id,))
                if cursor.rowcount == 0:
                    return jsonify({"error": "Collection not found"}), 404
                return jsonify({"message": "Collection deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@collections_api.route('/<int:collection_id>/books', methods=['GET'])
def get_books_in_collection(collection_id):
    """Fetch all books in a specific collection."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT b.id, b.title,
                           ARRAY_AGG(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL) as authors
                    FROM books b
                    JOIN collection_books cb ON b.id = cb.book_id
                    LEFT JOIN book_authors ba ON b.id = ba.book_id
                    LEFT JOIN authors a ON ba.author_id = a.id
                    WHERE cb.collection_id = %s
                    GROUP BY b.id, b.title
                    ORDER BY b.title
                """, (collection_id,))
                books = cursor.fetchall()
                return jsonify(books)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collections_api.route('/<int:collection_id>/books/add', methods=['POST'])
def add_books_to_collection(collection_id):
    """Add books to a collection."""
    try:
        data = request.get_json()
        book_ids = data.get('book_ids', [])
        
        if not book_ids:
            return jsonify({"error": "No book IDs provided"}), 400
        
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check if collection exists
                cursor.execute("SELECT id FROM collections WHERE id = %s", (collection_id,))
                if not cursor.fetchone():
                    return jsonify({"error": "Collection not found"}), 404
                
                # Add books to collection (ignore duplicates)
                for book_id in book_ids:
                    cursor.execute("""
                        INSERT INTO collection_books (collection_id, book_id)
                        VALUES (%s, %s)
                        ON CONFLICT (collection_id, book_id) DO NOTHING
                    """, (collection_id, book_id))
                
                return jsonify({"success": True, "message": f"Added {len(book_ids)} books to collection"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collections_api.route('/<int:collection_id>/books/<int:book_id>/remove', methods=['DELETE'])
def remove_book_from_collection(collection_id, book_id):
    """Remove a book from a collection."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM collection_books 
                    WHERE collection_id = %s AND book_id = %s
                """, (collection_id, book_id))
                
                if cursor.rowcount == 0:
                    return jsonify({"error": "Book not found in collection"}), 404
                
                return jsonify({"success": True, "message": "Book removed from collection"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500