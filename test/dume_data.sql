-- Insert dummy data into languages table
INSERT INTO languages (name) VALUES
('English'),
('Spanish'),
('French'),
('German'),
('Japanese');

-- Insert dummy data into users table
INSERT INTO users (username, email, password_hash) VALUES
('john_doe', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPlgzqiHyf6Pq7m'),
('jane_smith', 'jane@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPlgzqiHyf6Pq7m'),
('alice_brown', 'alice@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPlgzqiHyf6Pq7m'),
('bob_wilson', 'bob@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPlgzqiHyf6Pq7m'),
('carol_davis', 'carol@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPlgzqiHyf6Pq7m');

-- Insert dummy data into authors table
INSERT INTO authors (name) VALUES
('F. Scott Fitzgerald'),
('Harper Lee'),
('George Orwell'),
('Jane Austen'),
('Mark Twain'),
('Virginia Woolf'),
('Ernest Hemingway'),
('Toni Morrison'),
('Gabriel García Márquez'),
('Haruki Murakami');

-- Insert dummy data into categories table
INSERT INTO categories (name) VALUES
('Fiction'),
('Classic Literature'),
('Dystopian'),
('Romance'),
('Adventure'),
('Literary Fiction'),
('Historical Fiction'),
('Science Fiction'),
('Mystery'),
('Biography');

-- Insert dummy data into books table
INSERT INTO books (title, publication_year, open_library_id, language_id) VALUES
('The Great Gatsby', 1925, 'OL1168083M', 1),
('To Kill a Mockingbird', 1960, 'OL7353617M', 1),
('1984', 1949, 'OL1168086M', 1),
('Pride and Prejudice', 1813, 'OL7353618M', 1),
('The Adventures of Tom Sawyer', 1876, 'OL1168087M', 1),
('Mrs. Dalloway', 1925, 'OL1168088M', 1),
('The Sun Also Rises', 1926, 'OL1168089M', 1),
('Beloved', 1987, 'OL1168090M', 1),
('One Hundred Years of Solitude', 1967, 'OL1168091M', 2),
('Norwegian Wood', 1987, 'OL1168092M', 5);

-- Insert dummy data into book_authors junction table
INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1),  -- The Great Gatsby - F. Scott Fitzgerald
(2, 2),  -- To Kill a Mockingbird - Harper Lee
(3, 3),  -- 1984 - George Orwell
(4, 4),  -- Pride and Prejudice - Jane Austen
(5, 5),  -- The Adventures of Tom Sawyer - Mark Twain
(6, 6),  -- Mrs. Dalloway - Virginia Woolf
(7, 7),  -- The Sun Also Rises - Ernest Hemingway
(8, 8),  -- Beloved - Toni Morrison
(9, 9),  -- One Hundred Years of Solitude - Gabriel García Márquez
(10, 10); -- Norwegian Wood - Haruki Murakami

-- Insert dummy data into book_categories junction table
INSERT INTO book_categories (book_id, category_id) VALUES
(1, 1),  -- The Great Gatsby - Fiction
(1, 2),  -- The Great Gatsby - Classic Literature
(2, 1),  -- To Kill a Mockingbird - Fiction
(2, 2),  -- To Kill a Mockingbird - Classic Literature
(3, 3),  -- 1984 - Dystopian
(3, 8),  -- 1984 - Science Fiction
(4, 1),  -- Pride and Prejudice - Fiction
(4, 4),  -- Pride and Prejudice - Romance
(5, 5),  -- The Adventures of Tom Sawyer - Adventure
(5, 2),  -- The Adventures of Tom Sawyer - Classic Literature
(6, 6),  -- Mrs. Dalloway - Literary Fiction
(7, 6),  -- The Sun Also Rises - Literary Fiction
(8, 6),  -- Beloved - Literary Fiction
(9, 6),  -- One Hundred Years of Solitude - Literary Fiction
(10, 1); -- Norwegian Wood - Fiction

-- Insert dummy data into collections table
INSERT INTO collections (name, description, user_id) VALUES
('My Favorites', 'Collection of my all-time favorite books', 1),
('Classic Novels', 'Great classic literature collection', 1),
('Summer Reading', 'Books to read during summer vacation', 2),
('Book Club Picks', 'Books selected by our monthly book club', 3),
('Modern Fiction', 'Contemporary fiction novels', 2),
('Must Read Classics', 'Essential classic literature', 4),
('Literary Fiction Collection', 'High-quality literary works', 5);

-- Insert dummy data into collection_books junction table
INSERT INTO collection_books (collection_id, book_id) VALUES
(1, 1),  -- My Favorites - The Great Gatsby
(1, 3),  -- My Favorites - 1984
(1, 8),  -- My Favorites - Beloved
(2, 1),  -- Classic Novels - The Great Gatsby
(2, 2),  -- Classic Novels - To Kill a Mockingbird
(2, 4),  -- Classic Novels - Pride and Prejudice
(2, 5),  -- Classic Novels - The Adventures of Tom Sawyer
(3, 7),  -- Summer Reading - The Sun Also Rises
(3, 10), -- Summer Reading - Norwegian Wood
(4, 2),  -- Book Club Picks - To Kill a Mockingbird
(4, 6),  -- Book Club Picks - Mrs. Dalloway
(5, 8),  -- Modern Fiction - Beloved
(5, 9),  -- Modern Fiction - One Hundred Years of Solitude
(5, 10), -- Modern Fiction - Norwegian Wood
(6, 1),  -- Must Read Classics - The Great Gatsby
(6, 2),  -- Must Read Classics - To Kill a Mockingbird
(6, 3),  -- Must Read Classics - 1984
(7, 6),  -- Literary Fiction Collection - Mrs. Dalloway
(7, 7),  -- Literary Fiction Collection - The Sun Also Rises
(7, 8);  -- Literary Fiction Collection - Beloved 