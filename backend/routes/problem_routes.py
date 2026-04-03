"""
Problem routes: CRUD for coding problems.
"""

from flask import Blueprint, request, jsonify

from config.db import get_db
from middleware.auth import protect, admin_required

problem_bp = Blueprint("problems", __name__)

VALID_DIFFICULTIES = ("EASY", "MEDIUM", "HARD")


@problem_bp.route("/", methods=["GET"])
def list_problems():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM problems ORDER BY problem_id")
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@problem_bp.route("/<int:problem_id>", methods=["GET"])
def get_problem(problem_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM problems WHERE problem_id = %s", (problem_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Problem not found"}), 404
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@problem_bp.route("/", methods=["POST"])
@protect
@admin_required
def create_problem():
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    difficulty = data.get("difficulty")
    max_score = data.get("max_score")

    if not title or not description or not difficulty or not max_score:
        return jsonify({"error": "title, description, difficulty, and max_score are required"}), 400
    if difficulty not in VALID_DIFFICULTIES:
        return jsonify({"error": "difficulty must be EASY, MEDIUM, or HARD"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO problems (title, description, difficulty, max_score) VALUES (%s, %s, %s, %s)",
            (title, description, difficulty, max_score),
        )
        conn.commit()
        return jsonify({
            "problem_id": cursor.lastrowid,
            "title": title,
            "difficulty": difficulty,
            "max_score": max_score,
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@problem_bp.route("/<int:problem_id>", methods=["PUT"])
@protect
@admin_required
def update_problem(problem_id):
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    difficulty = data.get("difficulty")
    max_score = data.get("max_score")

    if not title or not description or not difficulty or not max_score:
        return jsonify({"error": "title, description, difficulty, and max_score are required"}), 400
    if difficulty not in VALID_DIFFICULTIES:
        return jsonify({"error": "difficulty must be EASY, MEDIUM, or HARD"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE problems SET title=%s, description=%s, difficulty=%s, max_score=%s WHERE problem_id=%s",
            (title, description, difficulty, max_score, problem_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Problem not found"}), 404
        return jsonify({"message": "Problem updated successfully", "problem_id": problem_id})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@problem_bp.route("/<int:problem_id>", methods=["DELETE"])
@protect
@admin_required
def delete_problem(problem_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM problems WHERE problem_id = %s", (problem_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Problem not found"}), 404
        return jsonify({"message": "Problem deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
