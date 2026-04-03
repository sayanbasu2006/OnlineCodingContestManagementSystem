"""
Contest routes: CRUD + problem assignments + exam start/finish + active participation.
"""

from datetime import datetime

from flask import Blueprint, request, jsonify, g

from config.db import get_db
from middleware.auth import protect, admin_required

contest_bp = Blueprint("contests", __name__)


# ── List all contests ──
@contest_bp.route("/", methods=["GET"])
def list_contests():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM contests ORDER BY start_time DESC")
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Get contest by ID ──
@contest_bp.route("/<int:contest_id>", methods=["GET"])
def get_contest(contest_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM contests WHERE contest_id = %s", (contest_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Contest not found"}), 404
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Create contest (admin) ──
@contest_bp.route("/", methods=["POST"])
@protect
@admin_required
def create_contest():
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    duration_minutes = data.get("duration_minutes", 120)
    status = data.get("status", "UPCOMING")

    if not title or not description or not start_time or not end_time:
        return jsonify({"error": "title, description, start_time, and end_time are required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO contests (title, description, start_time, end_time, duration_minutes, status) VALUES (%s, %s, %s, %s, %s, %s)",
            (title, description, start_time, end_time, duration_minutes, status),
        )
        conn.commit()
        return jsonify({
            "contest_id": cursor.lastrowid,
            "title": title,
            "status": status,
            "duration_minutes": duration_minutes,
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Update contest (admin) ──
@contest_bp.route("/<int:contest_id>", methods=["PUT"])
@protect
@admin_required
def update_contest(contest_id):
    data = request.get_json() or {}
    title = data.get("title")
    description = data.get("description")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    duration_minutes = data.get("duration_minutes", 120)
    status = data.get("status")

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE contests SET title=%s, description=%s, start_time=%s, end_time=%s, duration_minutes=%s, status=%s WHERE contest_id=%s",
            (title, description, start_time, end_time, duration_minutes, status, contest_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Contest not found"}), 404
        return jsonify({"message": "Contest updated successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Delete contest (admin) ──
@contest_bp.route("/<int:contest_id>", methods=["DELETE"])
@protect
@admin_required
def delete_contest(contest_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM contests WHERE contest_id = %s", (contest_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Contest not found"}), 404
        return jsonify({"message": "Contest deleted successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Get problems in a contest ──
@contest_bp.route("/<int:contest_id>/problems", methods=["GET"])
def get_contest_problems(contest_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT p.* FROM problems p
               JOIN contest_problems cp ON p.problem_id = cp.problem_id
               WHERE cp.contest_id = %s ORDER BY p.problem_id""",
            (contest_id,),
        )
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Add problem to contest (admin) ──
@contest_bp.route("/<int:contest_id>/problems", methods=["POST"])
@protect
@admin_required
def add_problem_to_contest(contest_id):
    data = request.get_json() or {}
    problem_id = data.get("problem_id")
    if not problem_id:
        return jsonify({"error": "problem_id is required"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT contest_id FROM contests WHERE contest_id = %s", (contest_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Contest not found"}), 404

        cursor.execute("SELECT problem_id FROM problems WHERE problem_id = %s", (problem_id,))
        if not cursor.fetchone():
            return jsonify({"error": "Problem not found"}), 404

        cursor.execute(
            "INSERT INTO contest_problems (contest_id, problem_id) VALUES (%s, %s)",
            (contest_id, problem_id),
        )
        conn.commit()
        return jsonify({"message": "Problem added to contest successfully"}), 201
    except Exception as e:
        conn.rollback()
        if "Duplicate entry" in str(e):
            return jsonify({"error": "Problem already assigned to this contest"}), 409
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Remove problem from contest (admin) ──
@contest_bp.route("/<int:contest_id>/problems/<int:problem_id>", methods=["DELETE"])
@protect
@admin_required
def remove_problem_from_contest(contest_id, problem_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM contest_problems WHERE contest_id = %s AND problem_id = %s",
            (contest_id, problem_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Problem not found in this contest"}), 404
        return jsonify({"message": "Problem removed from contest successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Get active contest participation for logged-in user ──
@contest_bp.route("/me/active-participation", methods=["GET"])
@protect
def active_participation():
    user_id = g.user["user_id"]
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT p.*, c.duration_minutes
               FROM participations p
               JOIN contests c ON p.contest_id = c.contest_id
               WHERE p.user_id = %s AND p.status = 'STARTED'""",
            (user_id,),
        )
        rows = cursor.fetchall()
        if not rows:
            return jsonify({"active_contest_id": None})

        active = rows[0]
        start = active["start_time"]
        if start:
            elapsed = (datetime.now() - start).total_seconds()
            duration_sec = active["duration_minutes"] * 60
            if elapsed > duration_sec:
                cursor.execute(
                    "UPDATE participations SET status = 'FINISHED' WHERE participation_id = %s",
                    (active["participation_id"],),
                )
                conn.commit()
                return jsonify({"active_contest_id": None})

        return jsonify({
            "active_contest_id": active["contest_id"],
            "start_time": str(active["start_time"]) if active["start_time"] else None,
            "duration_minutes": active["duration_minutes"],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Start an exam ──
@contest_bp.route("/<int:contest_id>/start", methods=["POST"])
@protect
def start_exam(contest_id):
    user_id = g.user["user_id"]
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM participations WHERE user_id = %s AND contest_id = %s",
            (user_id, contest_id),
        )
        part = cursor.fetchone()
        if not part:
            return jsonify({"error": "You have not joined this contest"}), 404
        if part["status"] == "FINISHED":
            return jsonify({"error": "You have already finished this exam"}), 400
        if part["status"] == "STARTED":
            return jsonify({"message": "Already started"})

        cursor.execute("SELECT status FROM contests WHERE contest_id = %s", (contest_id,))
        contest = cursor.fetchone()
        if not contest or contest["status"] != "ONGOING":
            return jsonify({"error": "Contest is not active"}), 400

        cursor.execute(
            "UPDATE participations SET status = 'STARTED', start_time = NOW() WHERE user_id = %s AND contest_id = %s",
            (user_id, contest_id),
        )
        conn.commit()
        return jsonify({"message": "Exam started successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Finish an exam ──
@contest_bp.route("/<int:contest_id>/finish", methods=["POST"])
@protect
def finish_exam(contest_id):
    user_id = g.user["user_id"]
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE participations SET status = 'FINISHED' WHERE user_id = %s AND contest_id = %s",
            (user_id, contest_id),
        )
        conn.commit()
        return jsonify({"message": "Exam finished successfully"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
