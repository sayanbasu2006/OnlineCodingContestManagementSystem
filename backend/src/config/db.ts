const mysql = require('mysql2/promise');
import dotenv from 'dotenv';
dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

const pool = mysql.createPool({
  ...DB_CONFIG,
  database: 'codearena',
  waitForConnections: true,
  connectionLimit: 10,
});

const DB_NAME = 'codearena';

async function initializeDatabase() {
  let connection;
  try {
    // Connect without specifying a database first
    connection = await mysql.createConnection(DB_CONFIG);

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    await connection.query(`USE \`${DB_NAME}\``);

    console.log(`✅ Database "${DB_NAME}" ready.`);

    // ── USER table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
        rating INT DEFAULT 1500,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    
    // Auto-migrate if rating doesn't exist
    try {
      await connection.query('ALTER TABLE users ADD COLUMN rating INT DEFAULT 1500');
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Migration warning:', e.message);
    }
    console.log('  ✓ users');

    // ── CONTEST table ──
    await connection.query(`
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
    `);
    
    // Auto-migrate if duration_minutes doesn't exist
    try {
      await connection.query('ALTER TABLE contests ADD COLUMN duration_minutes INT NOT NULL DEFAULT 120');
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Migration warning:', e.message);
    }
    console.log('  ✓ contests');

    // ── PROBLEM table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS problems (
        problem_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        difficulty ENUM('EASY','MEDIUM','HARD') NOT NULL,
        max_score INT NOT NULL,
        editorial TEXT NULL
      ) ENGINE=InnoDB
    `);

    // Auto-migrate if editorial doesn't exist
    try {
      await connection.query('ALTER TABLE problems ADD COLUMN editorial TEXT NULL');
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Migration warning:', e.message);
    }
    console.log('  ✓ problems');

    // ── CONTEST_PROBLEM junction table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contest_problems (
        contest_id INT NOT NULL,
        problem_id INT NOT NULL,
        PRIMARY KEY (contest_id, problem_id),
        FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('  ✓ contest_problems');

    // ── SUBMISSION table_ ──
    await connection.query(`
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
    `);
    console.log('  ✓ submissions');

    // ── PARTICIPATION table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS participations (
        participation_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        contest_id INT NOT NULL,
        status ENUM('REGISTERED', 'STARTED', 'FINISHED') NOT NULL DEFAULT 'REGISTERED',
        start_time DATETIME NULL,
        join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
        UNIQUE KEY unique_participation (user_id, contest_id)
      ) ENGINE=InnoDB
    `);
    
    // Auto-migrate for existing participations table
    try {
      await connection.query("ALTER TABLE participations ADD COLUMN status ENUM('REGISTERED', 'STARTED', 'FINISHED') NOT NULL DEFAULT 'REGISTERED', ADD COLUMN start_time DATETIME NULL");
    } catch (e: any) {
      if (e.code !== 'ER_DUP_FIELDNAME') console.warn('Migration warning:', e.message);
    }
    console.log('  ✓ participations');

    // ── TEST_CASES table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS test_cases (
        test_case_id INT AUTO_INCREMENT PRIMARY KEY,
        problem_id INT NOT NULL,
        input TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        is_sample BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('  ✓ test_cases');

    // ── PROBLEM_TAGS table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS problem_tags (
        problem_id INT NOT NULL,
        tag VARCHAR(50) NOT NULL,
        PRIMARY KEY (problem_id, tag),
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('  ✓ problem_tags');

    // ── NOTIFICATIONS table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        type ENUM('success','error','info','warning') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('  ✓ notifications');

    // ── USER_BADGES table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        badge_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_badge (user_id, badge_name)
      ) ENGINE=InnoDB
    `);
    console.log('  ✓ user_badges');

    // ── COMMENTS table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        comment_id INT AUTO_INCREMENT PRIMARY KEY,
        problem_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('  ✓ comments');

    // ── LEARNING_TRACKS table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS learning_tracks (
        track_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log('  ✓ learning_tracks');

    // ── TRACK_PROBLEMS table ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS track_problems (
        track_id INT NOT NULL,
        problem_id INT NOT NULL,
        sequence_order INT NOT NULL,
        PRIMARY KEY (track_id, problem_id),
        FOREIGN KEY (track_id) REFERENCES learning_tracks(track_id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('  ✓ track_problems');

    console.log('\n🎉 All tables created successfully!');
  } catch (err) {
    console.error('❌ Database initialization failed:', (err as any).message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { DB_CONFIG, DB_NAME, initializeDatabase, pool };
