-- ==========================================================
-- DATABASE ASSIGNMENT IMPLEMENTATION
-- Database: codearena
-- ==========================================================

USE codearena;

-- ==========================================================
-- TASK 1: DML, Constraints, and Sets
-- ==========================================================

-- 1.1 DML (Data Manipulation Language)

-- INSERT
INSERT INTO users (username, email, password, role) 
VALUES ('test_student', 'student@example.com', 'hashed_pw', 'USER');

INSERT INTO contests (title, description, start_time, end_time, status)
VALUES ('Weekly Contest 1', 'First weekly coding contest.', '2026-04-01 10:00:00', '2026-04-01 12:00:00', 'UPCOMING');

-- UPDATE
UPDATE users 
SET role = 'ADMIN' 
WHERE username = 'test_student';

-- DELETE
-- Deleting the test user (temporarily inserted for DML demonstration)
DELETE FROM users 
WHERE username = 'test_student';


-- 1.2 CONSTRAINTS (Demonstration of existing constraints)
-- The schema already implements constraints like NOT NULL, UNIQUE, PRIMARY KEY, and FOREIGN KEY.
-- Examples of constraint violations:

-- This would fail due to UNIQUE constraint on username/email:
-- INSERT INTO users (username, email, password) VALUES ('existing_user', 'existing_user@example.com', 'pw');

-- This would fail due to FOREIGN KEY constraint if user_id 9999 doesn't exist:
-- INSERT INTO submissions (user_id, contest_id, problem_id, code) VALUES (9999, 1, 1, 'code');


-- 1.3 SETS (UNION, INTERSECT, EXCEPT equivalent)

-- UNION: Get all unique titles from contests and problems
SELECT title AS Item_Title, 'Contest' AS Type FROM contests
UNION
SELECT title AS Item_Title, 'Problem' AS Type FROM problems;

-- INTERSECT equivalent: Get users who have both participated in contests and made submissions
SELECT u.username 
FROM users u
WHERE u.user_id IN (SELECT user_id FROM participations)
  AND u.user_id IN (SELECT user_id FROM submissions);

-- EXCEPT (MINUS) equivalent: Get users who registered for a contest but made no submissions
SELECT u.username
FROM users u
JOIN participations p ON u.user_id = p.user_id
WHERE u.user_id NOT IN (SELECT user_id FROM submissions);


-- ==========================================================
-- TASK 2: Subqueries, Joins, and Views
-- ==========================================================

-- 2.1 SUBQUERIES
-- Find the problem with the highest maximum score
SELECT title, difficulty, max_score
FROM problems
WHERE max_score = (SELECT MAX(max_score) FROM problems);

-- Find users whose average submission score is higher than the overall average score
SELECT username 
FROM users 
WHERE user_id IN (
    SELECT user_id 
    FROM submissions 
    GROUP BY user_id 
    HAVING AVG(score) > (SELECT AVG(score) FROM submissions)
);

-- 2.2 JOINS
-- INNER JOIN: Get user details along with their submission scores for a specific problem
SELECT u.username, p.title AS problem_title, s.score, s.language
FROM submissions s
INNER JOIN users u ON s.user_id = u.user_id
INNER JOIN problems p ON s.problem_id = p.problem_id;

-- LEFT JOIN: Get all contests and list problems associated with them (if any)
SELECT c.title AS contest_title, p.title AS problem_title, p.difficulty
FROM contests c
LEFT JOIN contest_problems cp ON c.contest_id = cp.contest_id
LEFT JOIN problems p ON cp.problem_id = p.problem_id;

-- RIGHT JOIN: Get all problems and the contests they belong to
SELECT p.title AS problem_title, c.title AS contest_title
FROM contests c
JOIN contest_problems cp ON c.contest_id = cp.contest_id
RIGHT JOIN problems p ON cp.problem_id = p.problem_id;

-- 2.3 VIEWS
-- Create a view for a comprehensive leaderboard
CREATE OR REPLACE VIEW Contest_Leaderboard_View AS
SELECT 
    c.title AS contest_name, 
    u.username, 
    SUM(s.score) AS total_score, 
    MAX(s.submission_time) AS last_submission_time
FROM submissions s
JOIN users u ON s.user_id = u.user_id
JOIN contests c ON s.contest_id = c.contest_id
GROUP BY c.contest_id, u.user_id
ORDER BY c.contest_id, total_score DESC;

-- Query the view
SELECT * FROM Contest_Leaderboard_View;


-- ==========================================================
-- TASK 3: Functions, Triggers, Cursors, and Exception Handling
-- ==========================================================

-- Drop existing functions/procedures if they exist
DROP FUNCTION IF EXISTS GetUserTotalScore;
DROP PROCEDURE IF EXISTS GeneratePerformanceReport;
DROP TRIGGER IF EXISTS Prevent_Submission_After_Contest;

DELIMITER //

-- 3.1 FUNCTIONS
-- Calculate the total score of a user across all their best submissions
CREATE FUNCTION GetUserTotalScore(p_user_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT DEFAULT 0;
    
    SELECT COALESCE(SUM(max_score), 0) INTO total
    FROM (
        SELECT MAX(score) AS max_score
        FROM submissions
        WHERE user_id = p_user_id
        GROUP BY problem_id
    ) AS BestScores;
    
    RETURN total;
END //

-- 3.2 TRIGGERS
-- Trigger to prevent submissions after a contest has ended
CREATE TRIGGER Prevent_Submission_After_Contest
BEFORE INSERT ON submissions
FOR EACH ROW
BEGIN
    DECLARE contestEndTime DATETIME;
    
    SELECT end_time INTO contestEndTime
    FROM contests
    WHERE contest_id = NEW.contest_id;
    
    IF NEW.submission_time > contestEndTime THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Exception: Cannot submit code after contest end time.';
    END IF;
END //

-- 3.3 CURSORS AND EXCEPTION HANDLING
-- Stored Procedure to generate a summary report for all contests using a Cursor
CREATE PROCEDURE GeneratePerformanceReport()
BEGIN
    -- Declarations must be at the top
    DECLARE done INT DEFAULT FALSE;
    DECLARE var_contest_id INT;
    DECLARE var_contest_title VARCHAR(100);
    DECLARE var_participant_count INT;
    DECLARE var_avg_score DECIMAL(10,2);
    
    -- Cursor declaration
    DECLARE contest_cursor CURSOR FOR 
        SELECT contest_id, title FROM contests;
        
    -- Exception Handling (Continue handler for not found)
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Exception Handling (Exit handler for general SQL exceptions)
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT 'An error occurred while generating the report.' AS ErrorMessage;
        ROLLBACK;
    END;

    -- Create a temporary table to store the report
    CREATE TEMPORARY TABLE IF NOT EXISTS Temp_Performance_Report (
        contest_title VARCHAR(100),
        participants INT,
        average_score DECIMAL(10,2)
    );
    
    TRUNCATE TABLE Temp_Performance_Report;

    OPEN contest_cursor;

    read_loop: LOOP
        FETCH contest_cursor INTO var_contest_id, var_contest_title;
        
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Get participant count
        SELECT COUNT(user_id) INTO var_participant_count 
        FROM participations 
        WHERE contest_id = var_contest_id;

        -- Get average score
        SELECT COALESCE(AVG(score), 0) INTO var_avg_score 
        FROM submissions 
        WHERE contest_id = var_contest_id;
        
        -- Insert into temp table
        INSERT INTO Temp_Performance_Report (contest_title, participants, average_score)
        VALUES (var_contest_title, var_participant_count, var_avg_score);
        
    END LOOP;

    CLOSE contest_cursor;
    
    -- Output the generated report
    SELECT * FROM Temp_Performance_Report;
    
    -- Clean up
    DROP TEMPORARY TABLE IF EXISTS Temp_Performance_Report;

END //

DELIMITER ;

-- ==========================================================
-- Testing the implementations (Examples)
-- ==========================================================
-- SELECT GetUserTotalScore(1);
-- CALL GeneratePerformanceReport();
