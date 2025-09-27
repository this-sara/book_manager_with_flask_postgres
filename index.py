from config import Config
from database import get_db
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return "Welcome to the Books Manager"
    
    
    
if __name__ == '__main__':
    app.run(debug=True)
