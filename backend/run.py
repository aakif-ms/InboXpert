from flask import Flask
from flask_cors import CORS
from src.routes.authRoutes import auth_bp

app = Flask(__name__)

CORS(app)

app.register_blueprint(auth_bp, url_prefix="/auth")

if __name__ == "__main__":
    app.run(debug=True, ssl_context='adhoc', port=5000)