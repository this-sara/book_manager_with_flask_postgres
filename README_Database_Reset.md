# Database Reset and Population Script

## Overview
This standalone script will completely reset your database and populate it with real data from Open Library API.

## What it does
1. **Clears all existing data** from all tables while preserving the table structure
2. **Resets all primary key sequences** to start from 1
3. **Fetches 100 real books** from Open Library with complete data including:
   - Book titles, authors, publication years
   - Cover images (when available)
   - Categories/subjects
   - Languages
   - Open Library IDs
4. **Creates 4 fake users** for testing:
   - `alice_reader` (admin) - password: `password123`
   - `bob_bookworm` (user) - password: `password123` 
   - `carol_critic` (user) - password: `password123`
   - `david_scholar` (user) - password: `password123`
5. **Creates collections** for each user with multiple books
6. **Establishes all relationships** between books, authors, categories, languages, users, and collections

## Requirements
- All environment variables must be set (DATABASE_HOST, DATABASE_PORT, etc.)
- Internet connection (to fetch data from Open Library)
- PostgreSQL database with the correct schema already created

## Usage

### Basic usage:
```bash
# Using uv (recommended)
uv run python reset_and_populate_db.py

# Or using regular Python (if in your PATH)
python reset_and_populate_db.py
```

### What to expect:
- The script will take 5-15 minutes to complete (depending on internet speed)
- You'll see progress messages for each step
- The script fetches books from multiple subjects to ensure variety
- Some books may not have cover images (this is normal)
- All data will have proper relationships and foreign keys

### After completion:
- Your database will have exactly 100 books with real data
- 4 users ready for testing login functionality
- Multiple collections per user
- All tables properly populated with relationships
- You can immediately start using your application

## Sample Output
```
🚀 Starting Database Reset and Population Script
============================================================
🗑️  Clearing all data from database...
✅ Executed: DELETE FROM collection_books;
✅ Executed: DELETE FROM book_categories;
...
🔄 Resetting primary key sequences...
✅ Reset: ALTER SEQUENCE authors_id_seq RESTART WITH 1;
...
👤 Creating fake users...
✅ Created user: alice_reader (ID: 1)
...
📚 Populating books and related data...
  📖 Processing book 1/100: The Great Gatsby...
...
📁 Creating user collections...
  ✅ Created 'Favorites' for user 1 with 7 books
...
🎉 Database Reset and Population Complete!
✅ Users created: 4
✅ Books imported: 100
```

## Troubleshooting

### Permission errors
If you see permission errors for `session_replication_role`, this is harmless and the script will continue working.

### Network timeouts
If you get network timeouts, the script will retry other books. Some variation in the final book count is normal.

### Database connection errors
Make sure your `.env` file has the correct database credentials:
```
HOST=your_host
PORT=5432
DB=your_database_name
USER=your_username
PASSWORD=your_password
```

### Slow performance
The script includes rate limiting to be respectful to Open Library's API. This is intentional and ensures reliable data fetching.

## Safety Notes
- ⚠️  **This script will DELETE ALL existing data** in your database
- The table structure and schema will remain intact
- Always backup your data before running if you have important information
- This is intended for development and testing environments

## Data Sources
All book data comes from [Open Library](https://openlibrary.org), a project of the Internet Archive. The script respects their API rate limits and terms of service.