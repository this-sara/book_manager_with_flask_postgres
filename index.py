from flask import Flask, render_template, url_for, redirect
from routes import books_api, categories_api, authors_api, users_api, collections_api, languages_api


app = Flask(__name__)
app.register_blueprint(books_api)
app.register_blueprint(categories_api)
app.register_blueprint(languages_api)
app.register_blueprint(collections_api)
app.register_blueprint(users_api)


app.register_blueprint(authors_api)

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
