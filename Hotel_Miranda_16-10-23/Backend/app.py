from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db  # Import db đã tạo từ file models.py

app = Flask(__name__)
CORS(app)

# Cấu hình Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hotel_miranda.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Liên kết db với app
db.init_app(app)

if __name__ == '__main__':
    app.run(debug=True)