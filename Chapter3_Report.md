# Chapter 3: Advanced Database Implementation for Online Coding Contest Platform

This chapter details the advanced SQL concepts, queries, and programmable features implemented for the Online Coding Contest platform database schema (`codearena`). It covers Data Manipulation Language (DML), constraints, set operations, subqueries, joins, views, functions, triggers, cursors, and exception handling.

---

## 3.1 Task 1: DML, Constraints, and Sets

### 3.1.1 Data Manipulation Language (DML)
DML comprises the `INSERT`, `UPDATE`, and `DELETE` commands used to manage data within the tables.

```sql
-- INSERT Statement: Adding a new user to the platform
INSERT INTO users (username, email, password, role) 
VALUES ('test_student', 'student@example.com', 'hashed_pw', 'USER');

-- UPDATE Statement: Modifying the user's role to ADMIN
UPDATE users 
SET role = 'ADMIN' 
WHERE username = 'test_student';

-- DELETE Statement: Removing the specific test user
DELETE FROM users 
WHERE username = 'test_student';
```

### 3.1.2 Constraints
Constraints ensure data integrity and reliability. Our database implements `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, and `NOT NULL` constraints. 
For instance, if an attempt is made to insert a duplicate email, the `UNIQUE` constraint on `users.email` prevents the insertion. Furthermore, `ON DELETE CASCADE` ensures that deleting a parent record (e.g., a contest) successfully deletes its child records (e.g., participations).

### 3.1.3 Set Operations
Set operations allow us to combine results from multiple queries.
*Note: MySQL does not natively support `INTERSECT` and `EXCEPT`, so we simulate them using `IN` and `NOT IN` clauses.*

```sql
-- UNION: Retrieves a distinct combined list of Contest titles and Problem titles.
SELECT title AS Item_Title, 'Contest' AS Type FROM contests
UNION
SELECT title AS Item_Title, 'Problem' AS Type FROM problems;

-- INTERSECT Equivalent: Finds users who have both participated in a contest AND made a submission.
SELECT u.username 
FROM users u
WHERE u.user_id IN (SELECT user_id FROM participations)
  AND u.user_id IN (SELECT user_id FROM submissions);

-- EXCEPT Equivalent: Finds users who registered for a contest but did NOT make any submissions.
SELECT u.username
FROM users u
JOIN participations p ON u.user_id = p.user_id
WHERE u.user_id NOT IN (SELECT user_id FROM submissions);
```

---

## 3.2 Task 2: Subqueries, Joins, and Views

### 3.2.1 Subqueries
Subqueries (nested queries) are used to perform operations where the condition depends on the data dynamically queried from the same or other tables.

```sql
-- Subquery 1: Identify the coding problem(s) with the highest maximum possible score.
SELECT title, difficulty, max_score
FROM problems
WHERE max_score = (SELECT MAX(max_score) FROM problems);

-- Subquery 2: Find users whose average submission score exceeds the platform's overall average score.
SELECT username 
FROM users 
WHERE user_id IN (
    SELECT user_id 
    FROM submissions 
    GROUP BY user_id 
    HAVING AVG(score) > (SELECT AVG(score) FROM submissions)
);
```

### 3.2.2 Joins
Joins let us combine rows from two or more tables based on a related column.

```sql
-- INNER JOIN: Provides a detailed view showing the username, problem title, and score secured.
SELECT u.username, p.title AS problem_title, s.score, s.language
FROM submissions s
INNER JOIN users u ON s.user_id = u.user_id
INNER JOIN problems p ON s.problem_id = p.problem_id;

-- LEFT JOIN: Lists all contests, and includes their associated problems if any exist.
SELECT c.title AS contest_title, p.title AS problem_title, p.difficulty
FROM contests c
LEFT JOIN contest_problems cp ON c.contest_id = cp.contest_id
LEFT JOIN problems p ON cp.problem_id = p.problem_id;
```

### 3.2.3 Views
Views are virtual tables based on the result-set of an SQL statement, providing abstraction and security.

```sql
-- Create a comprehensive leaderboard view to easily access contestant rankings per contest.
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
```

---

## 3.3 Task 3: Functions, Triggers, Cursors, and Exception Handling

### 3.3.1 Functions
User-defined functions return a single calculated value based on custom logic.

```sql
-- Function to calculate the cumulative total score of a specific user across all unique problems solved.
DELIMITER //
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
DELIMITER ;
```

### 3.3.2 Triggers and Exception Handling
Triggers are automated procedures executed implicitly in response to specific data modification events. Custom exception handling (`SIGNAL SQLSTATE`) is used to enforce complex business rules.

```sql
-- Trigger to enforce time limits: Users are blocked from submitting code after a contest has officially ended.
DELIMITER //
CREATE TRIGGER Prevent_Submission_After_Contest
BEFORE INSERT ON submissions
FOR EACH ROW
BEGIN
    DECLARE contestEndTime DATETIME;
    
    SELECT end_time INTO contestEndTime
    FROM contests
    WHERE contest_id = NEW.contest_id;
    
    -- Exception Handling mechanism
    IF NEW.submission_time > contestEndTime THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Exception: Cannot submit code after contest end time.';
    END IF;
END //
DELIMITER ;
```

### 3.3.3 Cursors
Cursors are used inside stored procedures to iterate over a query result row by row. This is particularly useful for generating complex aggregated reports that cannot be easily written via a single query.

```sql
-- Stored procedure using a cursor to iterate over all contests and generate a summary report.
DELIMITER //
CREATE PROCEDURE GeneratePerformanceReport()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE var_contest_id INT;
    DECLARE var_contest_title VARCHAR(100);
    DECLARE var_participant_count INT;
    DECLARE var_avg_score DECIMAL(10,2);
    
    -- Cursor declaration
    DECLARE contest_cursor CURSOR FOR 
        SELECT contest_id, title FROM contests;
        
    -- Continue Handler for End-Of-Cursor exception handling
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Exit Handler for general SQL Exceptions
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT 'An error occurred while generating the report.' AS ErrorMessage;
        ROLLBACK;
    END;

    CREATE TEMPORARY TABLE IF NOT EXISTS Temp_Performance_Report (
        contest_title VARCHAR(100),
        participants INT,
        average_score DECIMAL(10,2)
    );
    TRUNCATE TABLE Temp_Performance_Report;

    OPEN contest_cursor;

    -- Iterating using the cursor
    read_loop: LOOP
        FETCH contest_cursor INTO var_contest_id, var_contest_title;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT COUNT(user_id) INTO var_participant_count FROM participations WHERE contest_id = var_contest_id;
        SELECT COALESCE(AVG(score), 0) INTO var_avg_score FROM submissions WHERE contest_id = var_contest_id;
        
        INSERT INTO Temp_Performance_Report (contest_title, participants, average_score)
        VALUES (var_contest_title, var_participant_count, var_avg_score);
    END LOOP;

    CLOSE contest_cursor;
    
    SELECT * FROM Temp_Performance_Report;
    DROP TEMPORARY TABLE IF EXISTS Temp_Performance_Report;
END //
DELIMITER ;
```

## Summary
The implementations in Chapter 3 demonstrate a robust handling of the backend CodeArena database. Complex retrieval of leaderboard logic through joins and subqueries, combined with performance metrics processed via cursors and the rigorous constraint checks enforced by triggers and exception handlers, ensure that the Online Coding Contest platform functions safely, accurately, and efficiently.
