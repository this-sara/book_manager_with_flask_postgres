from flask import Flask
from routes import books_api, categories_api, authors_api

app = Flask(__name__)
app.register_blueprint(books_api)
app.register_blueprint(categories_api)
app.register_blueprint(authors_api)

@app.route('/', methods=['GET'])
def home():
    return 'Welcome to the Book Manager API!'
    
if __name__ == '__main__':
    app.run(debug=True)
