import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const DB_CONFIG = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'codearena',
    };

const pool = new Pool(DB_CONFIG);

async function initializeDatabase() {
  let client;
  try {
    client = await pool.connect();

    console.log(`✅ Connected to PostgreSQL database.`);

    // ── TYPES (ENUMS) ──
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE contest_status AS ENUM ('UPCOMING', 'ONGOING', 'ENDED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE difficulty_level AS ENUM ('EASY', 'MEDIUM', 'HARD');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE participation_status AS ENUM ('REGISTERED', 'STARTED', 'FINISHED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM ('success', 'error', 'info', 'warning');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE track_difficulty AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // ── USER table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'USER',
        rating INT DEFAULT 1500,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS display_name VARCHAR(100) NULL,
      ADD COLUMN IF NOT EXISTS bio TEXT NULL,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL
    `);
    console.log('  ✓ users');

    // ── CONTEST table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS contests (
        contest_id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        duration_minutes INT NOT NULL DEFAULT 120,
        status contest_status NOT NULL DEFAULT 'UPCOMING',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('  ✓ contests');

    // ── PROBLEM table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS problems (
        problem_id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        difficulty difficulty_level NOT NULL,
        max_score INT NOT NULL,
        editorial TEXT NULL
      )
    `);
    console.log('  ✓ problems');

    // ── CONTEST_PROBLEM junction table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS contest_problems (
        contest_id INT NOT NULL,
        problem_id INT NOT NULL,
        sequence_order INT NOT NULL,
        PRIMARY KEY (contest_id, problem_id),
        FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ contest_problems');

    await client.query(`
      ALTER TABLE contest_problems
      ADD COLUMN IF NOT EXISTS sequence_order INT
    `);
    await client.query(`
      WITH ordered AS (
        SELECT
          contest_id,
          problem_id,
          ROW_NUMBER() OVER (PARTITION BY contest_id ORDER BY problem_id) AS next_order
        FROM contest_problems
        WHERE sequence_order IS NULL
      )
      UPDATE contest_problems cp
      SET sequence_order = ordered.next_order
      FROM ordered
      WHERE cp.contest_id = ordered.contest_id
        AND cp.problem_id = ordered.problem_id
    `);
    await client.query(`
      ALTER TABLE contest_problems
      ALTER COLUMN sequence_order SET NOT NULL
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_contest_problems_sequence
      ON contest_problems(contest_id, sequence_order)
    `);

    // ── SUBMISSION table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        submission_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        contest_id INT NOT NULL,
        problem_id INT NOT NULL,
        code TEXT,
        language VARCHAR(30) DEFAULT 'cpp',
        score INT DEFAULT 0,
        submission_time TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ submissions');

    // ── PARTICIPATION table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS participations (
        participation_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        contest_id INT NOT NULL,
        status participation_status NOT NULL DEFAULT 'REGISTERED',
        start_time TIMESTAMPTZ NULL,
        join_time TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
        UNIQUE (user_id, contest_id)
      )
    `);
    console.log('  ✓ participations');

    // ── TEST_CASES table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_cases (
        test_case_id SERIAL PRIMARY KEY,
        problem_id INT NOT NULL,
        input TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        is_sample BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ test_cases');

    // ── PROBLEM_TAGS table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS problem_tags (
        problem_id INT NOT NULL,
        tag VARCHAR(50) NOT NULL,
        PRIMARY KEY (problem_id, tag),
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ problem_tags');

    // ── NOTIFICATIONS table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        type notification_type DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ notifications');

    // ── USER_BADGES table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        badge_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        earned_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE (user_id, badge_name)
      )
    `);
    console.log('  ✓ user_badges');

    // ── COMMENTS table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        comment_id SERIAL PRIMARY KEY,
        problem_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ comments');

    // ── LEARNING_TRACKS table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS learning_tracks (
        track_id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        difficulty track_difficulty NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('  ✓ learning_tracks');

    // ── TRACK_PROBLEMS table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS track_problems (
        track_id INT NOT NULL,
        problem_id INT NOT NULL,
        sequence_order INT NOT NULL,
        PRIMARY KEY (track_id, problem_id),
        FOREIGN KEY (track_id) REFERENCES learning_tracks(track_id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ track_problems');

    // ── TRACK_CONCEPTS table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS track_concepts (
        concept_id SERIAL PRIMARY KEY,
        track_id INT NOT NULL,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        sequence_order INT NOT NULL,
        FOREIGN KEY (track_id) REFERENCES learning_tracks(track_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ track_concepts');

    // ── CONCEPT_PROBLEMS table ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS concept_problems (
        concept_id INT NOT NULL,
        problem_id INT NOT NULL,
        sequence_order INT NOT NULL,
        PRIMARY KEY (concept_id, problem_id),
        FOREIGN KEY (concept_id) REFERENCES track_concepts(concept_id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✓ concept_problems');


    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_submissions_contest_user_problem_time
      ON submissions(contest_id, user_id, problem_id, submission_time DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_participations_user_contest_status
      ON participations(user_id, contest_id, status)
    `);

    console.log('\n🎉 All tables created successfully!');
  } catch (err: any) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase().finally(() => pool.end());
}

module.exports = { DB_CONFIG, initializeDatabase, pool };
