"""
Leaderboard routes: global and contest-specific rankings.
"""

from flask import Blueprint, jsonify

from config.db import get_db

leaderboard_bp = Blueprint("leaderboard", __name__)


@leaderboard_bp.route("/", methods=["GET"])
def global_leaderboard():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.user_id, u.username,
                   SUM(s.score) AS total_score,
                   COUNT(s.submission_id) AS submissions
            FROM submissions s
            JOIN users u ON s.user_id = u.user_id
            GROUP BY u.user_id, u.username
            ORDER BY total_score DESC
        """)
        rows = cursor.fetchall()
        leaderboard = [{"rank": i + 1, **row} for i, row in enumerate(rows)]
        return jsonify({"leaderboard": leaderboard})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@leaderboard_bp.route("/<int:contest_id>", methods=["GET"])
def contest_leaderboard(contest_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT u.user_id, u.username,
                   SUM(s.score) AS total_score,
                   COUNT(s.submission_id) AS submissions
            FROM submissions s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.contest_id = %s
            GROUP BY u.user_id, u.username
            ORDER BY total_score DESC
            """,
            (contest_id,),
        )
        rows = cursor.fetchall()
        leaderboard = [{"rank": i + 1, **row} for i, row in enumerate(rows)]
        return jsonify({"leaderboard": leaderboard})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
