from flask import Blueprint, jsonify, request
from database import get_db
from util import normalize_strings
books_api = Blueprint('books_api', __name__, url_prefix='/api/books')

@books_api.route('/', methods=['GET'])
def get_books():
    """Fetch all books from the database."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM books")
                books = cursor.fetchall()
                return jsonify(books)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
            
@books_api.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
                book = cursor.fetchone()
                if book:
                    return jsonify(book)
                else:
                    return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@books_api.route('/title/<string:book_title>', methods=['GET'])
def get_book_by_title(book_title):
    """Fetch a book by its title."""
    try:
        if not book_title:
            return jsonify({"error": "Invalid book title"}), 400
        
        book_title = normalize_strings(book_title)
        
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM books WHERE LOWER(title) = %s", (book_title,))
                book = cursor.fetchone()
                if book:
                    return jsonify(book)
                else:
                    return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@books_api.route('/', methods=['POST'])
def add_book():
    """Add a new book to the database."""
    try:
        data = request.get_json()

        title = normalize_strings(data.get('title'))
        author = normalize_strings(data.get('author'))
        language = normalize_strings(data.get('language'))
        open_library_id = normalize_strings(data.get('open_library_id'))
        publication_year = data.get('publication_year')

        if not title :
            return jsonify({"error": "Title is required"}), 400
        
        with get_db() as conn:
            with conn.cursor() as cursor:
                # Check if book exists
                cursor.execute("SELECT * FROM books WHERE LOWER(title) = %s", (title,))
                existing_book = cursor.fetchone()
                if existing_book:
                    return jsonify({"error": "Book with this title already exists"}), 409
                # get language_id
                cursor.execute("SELECT id FROM languages WHERE LOWER(name) = %s", (language,))
                language_result = cursor.fetchone()
                if language_result:
                    language_id = language_result["id"]
                else:
                    cursor.execute("INSERT INTO languages (name) VALUES (%s) RETURNING id", (language,))
                    language_id = cursor.fetchone()["id"]

                cursor.execute(
                    "INSERT INTO books (title, publication_year, language_id, open_library_id) VALUES (%s, %s, %s, %s) RETURNING id",
                    (title, publication_year, language_id, open_library_id)
                )
                new_book_id = cursor.fetchone()["id"]
                
                if author:
                    cursor.execute("SELECT id FROM authors WHERE LOWER(name) = %s", (author,))
                    author_result = cursor.fetchone()
                    if author_result:
                        author_id = author_result["id"]
                    else:
                        cursor.execute("INSERT INTO authors (name) VALUES (%s) RETURNING id", (author,))
                        author_id = cursor.fetchone()["id"]

                    cursor.execute("INSERT INTO book_authors (book_id, author_id) VALUES (%s, %s)", (new_book_id, author_id))

                return jsonify({"message": "Book added", "book_id": new_book_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@books_api.route('/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    """Delete a book by its ID."""
    try:
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM books WHERE id = %s", (book_id,))
                if cursor.rowcount == 0:
                    return jsonify({"error": "Book not found"}), 404
                return jsonify({"message": "Book deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@books_api.route('/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    """Update a book's details."""
    try:
        data = request.get_json()
        title = normalize_strings(data.get('title')) if data.get('title') else None
        author = normalize_strings(data.get('author')) if data.get('author') else None
        language = normalize_strings(data.get('language')) if data.get('language') else None
        open_library_id = normalize_strings(data.get('open_library_id'))
        publication_year = data.get('publication_year')
        
        with get_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
                existing_book = cursor.fetchone()
                if not existing_book:
                    return jsonify({"error": "Book not found"}), 404
                
                update_fields = []
                update_values = []
                if title:
                    update_fields.append("title = %s")
                    update_values.append(title)
                if publication_year is not None:
                    update_fields.append("publication_year = %s")
                    update_values.append(publication_year)
                if language:
                    cursor.execute("SELECT id FROM languages WHERE LOWER(name) = %s", (language,))
                    language_result = cursor.fetchone()
                    if language_result:
                        language_id = language_result["id"]
                    else:
                        cursor.execute("INSERT INTO languages (name) VALUES (%s) RETURNING id", (language,))
                        language_id = cursor.fetchone()["id"]
                    update_fields.append("language_id = %s")
                    update_values.append(language_id)
                if open_library_id is not None:
                    update_fields.append("open_library_id = %s")
                    update_values.append(open_library_id)
                if update_fields:
                    query = "UPDATE books SET " + ", ".join(update_fields) + " WHERE id = %s"
                    cursor.execute(query, (*update_values, book_id))
                    
                    
                if author:
                    cursor.execute("SELECT id FROM authors WHERE LOWER(name) = %s", (author,))
                    author_result = cursor.fetchone()
                    if author_result:
                        author_id = author_result["id"]
                    else:
                        cursor.execute("INSERT INTO authors (name) VALUES (%s) RETURNING id", (author,))
                        author_id = cursor.fetchone()["id"]
                        
                    cursor.execute("DELETE FROM book_authors WHERE book_id = %s", (book_id,))
                    cursor.execute("INSERT INTO book_authors (book_id, author_id) VALUES (%s, %s)", (book_id, author_id))
                    
                    return jsonify({"message": "Book updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
            