from config import Config
from database import get_db
from flask import Flask, jsonify
from routes.books_api import books_api
from routes.categories_api import categories_api
from routes.languages_api import languages_api
from routes.collections_api import collections_api
from routes.users_api import users_api



app = Flask(__name__)
app.register_blueprint(books_api)
app.register_blueprint(categories_api)
app.register_blueprint(languages_api)
app.register_blueprint(collections_api)
app.register_blueprint(users_api)



@app.route('/', methods=['GET'])
def home():
    return 'Welcome to the Book Manager API!'
    
if __name__ == '__main__':
    app.run(debug=True)
