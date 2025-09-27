import requests
import json
from typing import Optional, Dict, Any

class OpenLibraryService:
    BASE_URL = "https://openlibrary.org"
    
    @staticmethod
    def search_book_by_title(title: str) -> Optional[Dict[Any, Any]]:
        """Search for a book by title using Open Library API."""
        try:
            url = f"{OpenLibraryService.BASE_URL}/search.json"
            params = {
                'title': title,
                'limit': 1
            }
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data.get('docs') and len(data['docs']) > 0:
                return OpenLibraryService._format_book_data(data['docs'][0])
            return None
            
        except requests.RequestException as e:
            print(f"Error fetching from Open Library: {e}")
            return None
    
    @staticmethod
    def get_book_by_id(open_library_id: str) -> Optional[Dict[Any, Any]]:
        """Get book details by Open Library ID."""
        try:
            url = f"{OpenLibraryService.BASE_URL}/books/{open_library_id}.json"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            return OpenLibraryService._format_book_data(response.json())
            
        except requests.RequestException as e:
            print(f"Error fetching from Open Library: {e}")
            return None
    
    @staticmethod
    def _format_book_data(raw_data: Dict[Any, Any]) -> Dict[str, Any]:
        """Format Open Library data to match our database schema."""
        # Extract cover ID from different possible fields
        cover_id = None
        if raw_data.get('cover_i'):  # Most common field in search results
            cover_id = raw_data.get('cover_i')
        elif raw_data.get('covers') and len(raw_data.get('covers', [])) > 0:
            cover_id = raw_data['covers'][0]
        elif raw_data.get('cover_edition_key'):
            cover_id = raw_data.get('cover_edition_key')
        
        return {
            'title': raw_data.get('title', ''),
            'author': raw_data.get('author_name', [''])[0] if raw_data.get('author_name') else '',
            'publication_year': raw_data.get('first_publish_year'),
            'cover_id': cover_id,
            'language': raw_data.get('language', [''])[0] if raw_data.get('language') else 'english',
            'open_library_id': raw_data.get('key', '').replace('/works/', '') if raw_data.get('key') else None
        }
    
    @staticmethod
    def get_cover_url(cover_id: int, size: str = 'M') -> Optional[str]:
        """Generate cover image URL from cover ID."""
        if not cover_id:
            return None
        # Size options: S (small), M (medium), L (large)
        return f"https://covers.openlibrary.org/b/id/{cover_id}-{size}.jpg"