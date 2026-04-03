"""
JWT authentication middleware for CodeArena.
Provides protect and admin_required decorators.
"""

import os
from functools import wraps

import jwt
from flask import request, jsonify, g

from config.db import get_db

JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey_for_codearena")


def generate_token(user_id, role):
    """Generate a JWT token for the given user."""
    import datetime
    payload = {
        "userId": user_id,
        "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def protect(f):
    """Decorator: verify JWT Bearer token and attach user to g.user."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Not authorized, no token provided"}), 401

        try:
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Not authorized, token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Not authorized, token failed"}), 401

        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT user_id, username, role FROM users WHERE user_id = %s",
                (decoded["userId"],),
            )
            user = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

        if not user:
            return jsonify({"error": "Not authorized, user not found"}), 401

        g.user = user
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator: must be used AFTER @protect. Checks for ADMIN role."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, "user") or g.user.get("role") != "ADMIN":
            return jsonify({"error": "Not authorized as an admin"}), 403
        return f(*args, **kwargs)

    return decorated
