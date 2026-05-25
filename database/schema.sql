-- Create database (Run manually if needed before applying schema)
-- CREATE DATABASE codearena;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  rating INT DEFAULT 1500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contests Table
CREATE TABLE IF NOT EXISTS contests (
  contest_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 120,
  status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'ENDED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems Table
CREATE TABLE IF NOT EXISTS problems (
  problem_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  max_score INT NOT NULL,
  editorial TEXT
);

-- Problem Tags Table
CREATE TABLE IF NOT EXISTS problem_tags (
  problem_id INT NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (problem_id, tag)
);

-- Contest_Problems Junction Table
CREATE TABLE IF NOT EXISTS contest_problems (
  contest_id INT NOT NULL REFERENCES contests(contest_id) ON DELETE CASCADE,
  problem_id INT NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
  PRIMARY KEY (contest_id, problem_id)
);

-- Test Cases Table
CREATE TABLE IF NOT EXISTS test_cases (
  test_case_id SERIAL PRIMARY KEY,
  problem_id INT NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT FALSE
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  submission_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  contest_id INT NOT NULL REFERENCES contests(contest_id) ON DELETE CASCADE,
  problem_id INT NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
  code TEXT,
  language VARCHAR(30) DEFAULT 'cpp',
  score INT DEFAULT 0,
  submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participations Table
CREATE TABLE IF NOT EXISTS participations (
  participation_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  contest_id INT NOT NULL REFERENCES contests(contest_id) ON DELETE CASCADE,
  join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  start_time TIMESTAMP NULL,
  status VARCHAR(20) DEFAULT 'JOINED' CHECK (status IN ('JOINED', 'STARTED', 'FINISHED')),
  UNIQUE (user_id, contest_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  comment_id SERIAL PRIMARY KEY,
  problem_id INT NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning Tracks Table
CREATE TABLE IF NOT EXISTS learning_tracks (
  track_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) DEFAULT 'BEGINNER' CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track Problems Junction Table
CREATE TABLE IF NOT EXISTS track_problems (
  track_id INT NOT NULL REFERENCES learning_tracks(track_id) ON DELETE CASCADE,
  problem_id INT NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
  sequence_order INT NOT NULL,
  PRIMARY KEY (track_id, problem_id)
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
  badge_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  badge_name VARCHAR(100) NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, badge_name)
);
