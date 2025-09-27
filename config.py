import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    DATABASE_HOST = os.getenv('HOST')
    DATABASE_PORT = int(os.getenv('PORT'))
    DATABASE_NAME = os.getenv('DB')
    DATABASE_USER = os.getenv('USER')
    DATABASE_PASSWORD = os.getenv('PASSWORD')
    
    # App settings
    SECRET_KEY = os.getenv('SECRET_KEY')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    PORT = int(os.getenv('PORT', 5000))
    
    # API settings
    OPEN_LIBRARY_API_BASE = os.getenv('OPEN_LIBRARY_API_BASE', 'https://openlibrary.org')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False