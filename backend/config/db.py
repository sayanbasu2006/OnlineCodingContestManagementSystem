"""
MySQL database configuration and initialization for CodeArena.
Uses mysql.connector connection pooling.
"""

import os
import mysql.connector
from mysql.connector import pooling

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
}

DB_NAME = "codearena"

# Connection pool (created after DB init)
_pool = None


def get_pool():
    """Return the global connection pool, creating it if needed."""
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="codearena_pool",
            pool_size=10,
            pool_reset_session=True,
            host=DB_CONFIG["host"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            database=DB_NAME,
        )
    return _pool


def get_db():
    """Get a connection from the pool."""
    return get_pool().get_connection()


def initialize_database():
    """Create the database and all tables if they don't exist."""
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`")
        cursor.execute(f"USE `{DB_NAME}`")
        print(f"✅ Database \"{DB_NAME}\" ready.")

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        """)
        print("  ✓ users")

        # Contests table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contests (
                contest_id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME NOT NULL,
                duration_minutes INT NOT NULL DEFAULT 120,
                status ENUM('UPCOMING','ONGOING','ENDED') NOT NULL DEFAULT 'UPCOMING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        """)
        print("  ✓ contests")

        # Problems table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS problems (
                problem_id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                difficulty ENUM('EASY','MEDIUM','HARD') NOT NULL,
                max_score INT NOT NULL
            ) ENGINE=InnoDB
        """)
        print("  ✓ problems")

        # Contest-Problems junction table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contest_problems (
                contest_id INT NOT NULL,
                problem_id INT NOT NULL,
                PRIMARY KEY (contest_id, problem_id),
                FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
                FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        """)
        print("  ✓ contest_problems")

        # Submissions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS submissions (
                submission_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                contest_id INT NOT NULL,
                problem_id INT NOT NULL,
                code TEXT,
                language VARCHAR(30) DEFAULT 'cpp',
                score INT DEFAULT 0,
                submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
                FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        """)
        print("  ✓ submissions")

        # Participations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS participations (
                participation_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                contest_id INT NOT NULL,
                status ENUM('REGISTERED','STARTED','FINISHED') NOT NULL DEFAULT 'REGISTERED',
                start_time DATETIME NULL,
                join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
                UNIQUE KEY unique_participation (user_id, contest_id)
            ) ENGINE=InnoDB
        """)
        print("  ✓ participations")

        conn.commit()
        print("\n🎉 All tables created successfully!")

    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    initialize_database()
