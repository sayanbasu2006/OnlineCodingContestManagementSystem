"""
User routes: admin-only user listing.
"""

from flask import Blueprint, jsonify

from config.db import get_db
from middleware.auth import protect, admin_required

user_bp = Blueprint("users", __name__)


@user_bp.route("/", methods=["GET"])
@protect
@admin_required
def list_users():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT user_id, username, email, role, created_at FROM users ORDER BY user_id")
        rows = cursor.fetchall()
        return jsonify(rows)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
