from flask import request, jsonify
from functools import wraps
from typing import Callable, Any

def jwt_required(f: Callable) -> Callable:
    @wraps(f)
    def decorated(*args: Any, **kwargs: Any) -> Any:
        token = None        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format. Use: Bearer <token>'}), 401
        
        if not token:
            return jsonify({'error': 'Access token is missing. Please provide Authorization header with Bearer token.'}), 401
        
        try:
            from ..services.authUser import verify_jwt_token, get_user_by_id
            
            result = verify_jwt_token(token)
            if not result['valid']:
                return jsonify({'error': result['error']}), 401
            
            current_user = get_user_by_id(result['payload']['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found or has been deleted'}), 401
                
        except Exception as e:
            print(f"JWT verification error: {e}")
            return jsonify({'error': 'Token verification failed'}), 401        
        return f(current_user, *args, **kwargs)
    return decorated