"""
Submission & participation routes.
"""

import math
import random
from datetime import datetime

from flask import Blueprint, request, jsonify, g

from config.db import get_db
from middleware.auth import protect

submission_bp = Blueprint("submissions", __name__)


# ── List submissions (with optional filters) ──
@submission_bp.route("/", methods=["GET"])
def list_submissions():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT s.*, u.username, c.title AS contest_title, p.title AS problem_title
            FROM submissions s
            JOIN users u ON s.user_id = u.user_id
            JOIN contests c ON s.contest_id = c.contest_id
            JOIN problems p ON s.problem_id = p.problem_id
        """
        conditions = []
        params = []

        user_id = request.args.get("user_id")
        contest_id = request.args.get("contest_id")
        problem_id = request.args.get("problem_id")

        if user_id:
            conditions.append("s.user_id = %s")
            params.append(user_id)
        if contest_id:
            conditions.append("s.contest_id = %s")
            params.append(contest_id)
        if problem_id:
            conditions.append("s.problem_id = %s")
            params.append(problem_id)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY s.submission_time DESC"

        cursor.execute(query, tuple(params))
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Submit a solution ──
@submission_bp.route("/", methods=["POST"])
@protect
def submit_solution():
    user_id = g.user["user_id"]
    data = request.get_json() or {}
    contest_id = data.get("contest_id")
    problem_id = data.get("problem_id")
    code = data.get("code", "")
    language = data.get("language", "cpp")
    inferred_contest = False

    if not problem_id:
        return jsonify({"error": "problem_id is required"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        # Frontend submit page does not send contest_id. In that case,
        # infer one from contest_problems so practice submissions can proceed.
        if not contest_id:
            inferred_contest = True
            cursor.execute(
                """
                SELECT c.contest_id, c.status, c.start_time, c.end_time
                FROM contests c
                JOIN contest_problems cp ON cp.contest_id = c.contest_id
                WHERE cp.problem_id = %s
                ORDER BY c.contest_id DESC
                LIMIT 1
                """,
                (problem_id,),
            )
            contest = cursor.fetchone()
            if not contest:
                return jsonify({
                    "error": "No contest mapping found for this problem."
                }), 400
            contest_id = contest["contest_id"]
        else:
            cursor.execute(
                "SELECT contest_id, status, start_time, end_time FROM contests WHERE contest_id = %s",
                (contest_id,),
            )
            contest = cursor.fetchone()
            if not contest:
                return jsonify({"error": "Contest not found"}), 404

        if not inferred_contest:
            now = datetime.now()
            if now < contest["start_time"]:
                return jsonify({"error": "Contest has not started yet"}), 403
            if now > contest["end_time"] or contest["status"] == "ENDED":
                return jsonify({"error": "Contest has ended, submissions are no longer accepted"}), 403

        # Verify problem belongs to contest
        cursor.execute(
            "SELECT * FROM contest_problems WHERE contest_id = %s AND problem_id = %s",
            (contest_id, problem_id),
        )
        if not cursor.fetchone():
            return jsonify({"error": "Problem does not belong to this contest"}), 400

        # Verify user is participating (auto-join when contest_id is inferred)
        cursor.execute(
            "SELECT * FROM participations WHERE user_id = %s AND contest_id = %s",
            (user_id, contest_id),
        )
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO participations (user_id, contest_id) VALUES (%s, %s)",
                (user_id, contest_id),
            )

        # Simulate scoring
        cursor.execute("SELECT max_score FROM problems WHERE problem_id = %s", (problem_id,))
        problem_data = cursor.fetchone()
        max_score = problem_data["max_score"] if problem_data else 100
        code_length = len(code.strip())
        simulated_score = min(
            math.floor(max_score * min(code_length / 80, 1) * (0.6 + random.random() * 0.4)),
            max_score,
        )
        if simulated_score < 10:
            simulated_score = math.floor(max_score * 0.3)

        cursor.execute(
            "INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES (%s, %s, %s, %s, %s, %s)",
            (user_id, contest_id, problem_id, code, language, simulated_score),
        )
        conn.commit()
        return jsonify({
            "submission_id": cursor.lastrowid,
            "score": simulated_score,
            "message": "Solution submitted successfully",
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── List participations ──
@submission_bp.route("/participations", methods=["GET"])
def list_participations():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT pa.*, u.username, c.title AS contest_title
            FROM participations pa
            JOIN users u ON pa.user_id = u.user_id
            JOIN contests c ON pa.contest_id = c.contest_id
        """
        conditions = []
        params = []

        user_id = request.args.get("user_id")
        contest_id = request.args.get("contest_id")

        if user_id:
            conditions.append("pa.user_id = %s")
            params.append(user_id)
        if contest_id:
            conditions.append("pa.contest_id = %s")
            params.append(contest_id)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY pa.join_time DESC"

        cursor.execute(query, tuple(params))
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── Join a contest ──
@submission_bp.route("/participations", methods=["POST"])
@protect
def join_contest():
    user_id = g.user["user_id"]
    data = request.get_json() or {}
    contest_id = data.get("contest_id")

    if not contest_id:
        return jsonify({"error": "user_id and contest_id are required"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT status, end_time FROM contests WHERE contest_id = %s",
            (contest_id,),
        )
        contest = cursor.fetchone()
        if not contest:
            return jsonify({"error": "Contest not found"}), 404

        if datetime.now() > contest["end_time"] or contest["status"] == "ENDED":
            return jsonify({"error": "Cannot join a contest that has ended"}), 403

        cursor.execute(
            "INSERT INTO participations (user_id, contest_id) VALUES (%s, %s)",
            (user_id, contest_id),
        )
        conn.commit()
        return jsonify({
            "participation_id": cursor.lastrowid,
            "message": "Successfully joined contest",
        }), 201
    except Exception as e:
        conn.rollback()
        if "Duplicate entry" in str(e):
            return jsonify({"error": "User already joined this contest"}), 409
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
