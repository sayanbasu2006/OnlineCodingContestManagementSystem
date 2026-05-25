-- Create database (Run manually if needed before applying schema)
-- CREATE DATABASE codearena;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
  rating INT DEFAULT 1500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contests Table
CREATE TABLE IF NOT EXISTS contests (
  contest_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 120,
  status ENUM('UPCOMING','ONGOING','ENDED') NOT NULL DEFAULT 'UPCOMING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems Table
CREATE TABLE IF NOT EXISTS problems (
  problem_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  difficulty ENUM('EASY','MEDIUM','HARD') NOT NULL,
  max_score INT NOT NULL,
  editorial TEXT NULL
) ENGINE=InnoDB;

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
  participation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  contest_id INT NOT NULL,
  status ENUM('REGISTERED','STARTED','FINISHED') NOT NULL DEFAULT 'REGISTERED',
  start_time DATETIME NULL,
  join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
  UNIQUE KEY unique_participation (user_id, contest_id)
) ENGINE=InnoDB;

-- Test Cases Table
CREATE TABLE IF NOT EXISTS test_cases (
  test_case_id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT NOT NULL,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Problem Tags Table
CREATE TABLE IF NOT EXISTS problem_tags (
  problem_id INT NOT NULL,
  tag VARCHAR(50) NOT NULL,
  PRIMARY KEY (problem_id, tag),
  FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type ENUM('success','error','info','warning') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
  badge_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_badge (user_id, badge_name)
) ENGINE=InnoDB;

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Learning Tracks Table
CREATE TABLE IF NOT EXISTS learning_tracks (
  track_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  difficulty ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Track Problems Table
CREATE TABLE IF NOT EXISTS track_problems (
  track_id INT NOT NULL,
  problem_id INT NOT NULL,
  sequence_order INT NOT NULL,
  PRIMARY KEY (track_id, problem_id),
  FOREIGN KEY (track_id) REFERENCES learning_tracks(track_id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE
) ENGINE=InnoDB;
