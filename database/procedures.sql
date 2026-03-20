USE codearena;

DELIMITER //

-- Procedure to get the leaderboard for a specific contest
DROP PROCEDURE IF EXISTS GetContestLeaderboard;
CREATE PROCEDURE GetContestLeaderboard(IN p_contest_id INT)
BEGIN
    SELECT 
        u.user_id, 
        u.username, 
        SUM(s.score) AS total_score, 
        COUNT(s.submission_id) AS submissions
    FROM submissions s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.contest_id = p_contest_id
    GROUP BY u.user_id, u.username
    ORDER BY total_score DESC;
END //

-- Procedure to get the global leaderboard across all contests
DROP PROCEDURE IF EXISTS GetGlobalLeaderboard;
CREATE PROCEDURE GetGlobalLeaderboard()
BEGIN
    SELECT 
        u.user_id, 
        u.username, 
        SUM(s.score) AS total_score, 
        COUNT(s.submission_id) AS submissions
    FROM submissions s
    JOIN users u ON s.user_id = u.user_id
    GROUP BY u.user_id, u.username
    ORDER BY total_score DESC;
END //

-- Procedure to safely add a new submission, capping the score at the problem's max_score
DROP PROCEDURE IF EXISTS AddSubmission;
CREATE PROCEDURE AddSubmission(
    IN p_user_id INT,
    IN p_contest_id INT,
    IN p_problem_id INT,
    IN p_code TEXT,
    IN p_language VARCHAR(30),
    IN p_score INT,
    OUT p_submission_id INT
)
BEGIN
    DECLARE v_max_score INT;
    DECLARE v_final_score INT;

    -- Get max score for the problem
    SELECT max_score INTO v_max_score 
    FROM problems 
    WHERE problem_id = p_problem_id;

    -- Cap score
    IF p_score > v_max_score THEN
        SET v_final_score = v_max_score;
    ELSE
        SET v_final_score = p_score;
    END IF;

    -- Insert submission
    INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score)
    VALUES (p_user_id, p_contest_id, p_problem_id, p_code, p_language, v_final_score);

    SET p_submission_id = LAST_INSERT_ID();
END //

DELIMITER ;
