"""
Dashboard routes: platform-wide statistics.
"""

from flask import Blueprint, jsonify

from config.db import get_db

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/stats", methods=["GET"])
def platform_stats():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                (SELECT COUNT(*) FROM contests) AS totalContests,
                (SELECT COUNT(*) FROM problems) AS totalProblems,
                (SELECT COUNT(*) FROM submissions) AS totalSubmissions,
                (SELECT COUNT(*) FROM users) AS totalUsers
        """)
        row = cursor.fetchone() or {
            "totalContests": 0,
            "totalProblems": 0,
            "totalSubmissions": 0,
            "totalUsers": 0,
        }
        # Keep both key styles for compatibility with existing clients.
        row["contests_count"] = row["totalContests"]
        row["submissions_count"] = row["totalSubmissions"]
        row["users_count"] = row["totalUsers"]
        return jsonify(row)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
