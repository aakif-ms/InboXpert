from flask import Flask
from flask_cors import CORS
from src.routes.authRoutes import auth_bp
from src.routes.agentRoute import ai_bp
import os

app = Flask(__name__)

CORS(app)

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(ai_bp, url_prefix="/email")

if __name__ == "__main__":
    # Use HTTP for development, HTTPS for production
    use_https = os.getenv('USE_HTTPS', 'false').lower() == 'true'
    
    if use_https:
        # Check if SSL certificates exist
        ssl_cert_path = 'ssl/cert.pem'
        ssl_key_path = 'ssl/key.pem'
        
        if os.path.exists(ssl_cert_path) and os.path.exists(ssl_key_path):
            ssl_context = (ssl_cert_path, ssl_key_path)
            app.run(debug=True, ssl_context=ssl_context, port=5000, host='0.0.0.0')
        else:
            print("SSL certificates not found. Run ./generate_ssl.sh to create them.")
            print("Starting in HTTP mode...")
            app.run(debug=True, port=5000, host='0.0.0.0')
    else:
        app.run(debug=True, port=5000, host='0.0.0.0')