import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from config import Config

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = None
    try:
        # Use individual parameters
        conn = psycopg2.connect(
            host=Config.DATABASE_HOST,
            port=Config.DATABASE_PORT,
            database=Config.DATABASE_NAME,
            user=Config.DATABASE_USER,
            password=Config.DATABASE_PASSWORD
        )
        conn.cursor_factory = RealDictCursor
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()