"""
Auth routes: register, login, get/update profile, change password.
"""

from flask import Blueprint, request, jsonify, g
import bcrypt

from config.db import get_db
from middleware.auth import protect, admin_required, generate_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "USER")

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)",
            (username, email, hashed, role),
        )
        conn.commit()
        user_id = cursor.lastrowid
        token = generate_token(user_id, role)
        return jsonify({
            "user_id": user_id,
            "username": username,
            "email": email,
            "role": role,
            "token": token,
        }), 201
    except Exception as e:
        conn.rollback()
        if "Duplicate entry" in str(e):
            return jsonify({"error": "Username or email already exists"}), 409
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return jsonify({"error": "Invalid email or password"}), 401

        token = generate_token(user["user_id"], user["role"])
        return jsonify({
            "user_id": user["user_id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "token": token,
        })
    finally:
        cursor.close()
        conn.close()


@auth_bp.route("/users", methods=["GET"])
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


@auth_bp.route("/me", methods=["GET"])
@protect
def get_me():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT user_id, username, email, role, created_at FROM users WHERE user_id = %s",
            (g.user["user_id"],),
        )
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route("/me", methods=["PUT"])
@protect
def update_me():
    data = request.get_json() or {}
    username = data.get("username")
    email = data.get("email")

    if not username and not email:
        return jsonify({"error": "At least username or email is required"}), 400

    updates = []
    params = []
    if username:
        updates.append("username = %s")
        params.append(username)
    if email:
        updates.append("email = %s")
        params.append(email)
    params.append(g.user["user_id"])

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            f"UPDATE users SET {', '.join(updates)} WHERE user_id = %s",
            tuple(params),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "Profile updated successfully"})
    except Exception as e:
        conn.rollback()
        if "Duplicate entry" in str(e):
            return jsonify({"error": "Username or email already exists"}), 409
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route("/me/password", methods=["PUT"])
@protect
def change_password():
    data = request.get_json() or {}
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    if not current_password or not new_password:
        return jsonify({"error": "currentPassword and newPassword are required"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT password FROM users WHERE user_id = %s", (g.user["user_id"],))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.checkpw(current_password.encode("utf-8"), row["password"].encode("utf-8")):
            return jsonify({"error": "Current password is incorrect"}), 401

        hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        cursor.execute("UPDATE users SET password = %s WHERE user_id = %s", (hashed, g.user["user_id"]))
        conn.commit()
        return jsonify({"message": "Password changed successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
