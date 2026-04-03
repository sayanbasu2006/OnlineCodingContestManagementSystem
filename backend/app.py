"""
CodeArena — Flask backend entry point.
Registers all blueprints, enables CORS, initializes DB, and starts the server.
"""

import os

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS

from config.db import initialize_database
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.contest_routes import contest_bp
from routes.problem_routes import problem_bp
from routes.submission_routes import submission_bp
from routes.leaderboard_routes import leaderboard_bp
from routes.dashboard_routes import dashboard_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    # Health check
    @app.route("/")
    def health():
        return jsonify({
            "status": "ok",
            "message": "CodeArena backend is running",
            "apiBase": "/api",
        })

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(contest_bp, url_prefix="/api/contests")
    app.register_blueprint(problem_bp, url_prefix="/api/problems")
    app.register_blueprint(submission_bp, url_prefix="/api/submissions")
    app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    return app


if __name__ == "__main__":
    # Initialize database tables on startup
    initialize_database()

    app = create_app()
    port = int(os.getenv("PORT", 5001))

    print(f"\n🚀 CodeArena MVP API running at http://localhost:{port}")
    print("   Configured with Python/Flask modular routing.")

    app.run(host="0.0.0.0", port=port, debug=True)
