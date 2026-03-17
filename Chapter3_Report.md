# Chapter 3: Database Design & Implementation

This chapter documents the complete database implementation for the **Online Coding Contest Management System (CodeArena)**. It demonstrates practical application of SQL concepts across three progressive tasks — from foundational DML operations and aggregate functions to advanced programmable objects such as functions, triggers, cursors, and exception handling.

**Database Schema:** The `codearena` database consists of five core tables — `users`, `contests`, `problems`, `contest_problems` (junction), `submissions`, and `participations` — interconnected through foreign key relationships.

---

## 3.1 Task 1 (Week 4): Aggregate Functions, Constraints, and Set Operations

### 3.1.1 Data Manipulation Language (DML)

DML commands (`INSERT`, `UPDATE`, `DELETE`) are used to manage data stored inside the database tables.

```sql
-- INSERT: Adding a new user to the platform
INSERT INTO users (username, email, password, role) 
VALUES ('test_student', 'student@example.com', 'hashed_pw', 'USER');

-- INSERT: Adding a new contest
INSERT INTO contests (title, description, start_time, end_time, status)
VALUES ('Sprint Contest', 'Quick 1-hour sprint challenge.',
        '2026-04-10 14:00:00', '2026-04-10 15:00:00', 'UPCOMING');

-- UPDATE: Promoting the user's role to ADMIN
UPDATE users SET role = 'ADMIN' WHERE username = 'test_student';

-- DELETE: Removing the test user after demonstration
DELETE FROM users WHERE username = 'test_student';
```

### 3.1.2 Constraints

Constraints enforce data integrity rules at the database level. The `codearena` schema implements the following constraints:

| Constraint | Table(s) | Purpose |
|---|---|---|
| `PRIMARY KEY` | All tables | Uniquely identifies each row (e.g., `user_id`, `contest_id`) |
| `NOT NULL` | `users`, `contests`, `problems` | Prevents null values in essential columns |
| `UNIQUE` | `users` | Ensures no duplicate `username` or `email` |
| `ENUM` | `users`, `contests`, `problems` | Restricts values to a predefined set (e.g., role: ADMIN/USER) |
| `FOREIGN KEY` | `submissions`, `participations`, `contest_problems` | Enforces referential integrity to parent tables |
| `ON DELETE CASCADE` | `submissions`, `participations`, `contest_problems` | Auto-deletes child rows when parent is deleted |
| `COMPOSITE PRIMARY KEY` | `contest_problems` | Uses `(contest_id, problem_id)` as a joint primary key |
| `COMPOSITE UNIQUE KEY` | `participations` | Prevents duplicate `(user_id, contest_id)` combinations |

**Constraint Violation Examples:**

```sql
-- UNIQUE violation: duplicate email triggers error
INSERT INTO users (username, email, password) 
VALUES ('new_user', 'sayan@codearena.com', 'pw');
-- ERROR: Duplicate entry 'sayan@codearena.com' for key 'users.email'

-- FOREIGN KEY violation: referencing non-existent user
INSERT INTO submissions (user_id, contest_id, problem_id, code) 
VALUES (9999, 1, 1, 'code');
-- ERROR: Cannot add or update a child row: a foreign key constraint fails

-- NOT NULL violation: null username
INSERT INTO users (username, email, password) VALUES (NULL, 'a@b.com', 'pw');
-- ERROR: Column 'username' cannot be null
```

### 3.1.3 Aggregate Functions

Aggregate functions compute a single result from a set of input values. They are essential for statistical analysis and reporting.

```sql
-- COUNT: Total number of registered users
SELECT COUNT(*) AS total_users FROM users;

-- COUNT with condition: Number of ADMIN users
SELECT COUNT(*) AS admin_count FROM users WHERE role = 'ADMIN';

-- SUM: Total score achieved by a specific user
SELECT SUM(score) AS sayan_total_score FROM submissions WHERE user_id = 2;

-- AVG: Platform-wide average submission score
SELECT ROUND(AVG(score), 2) AS platform_avg_score FROM submissions;

-- MAX: Highest single submission score recorded
SELECT MAX(score) AS highest_score FROM submissions;

-- MIN: Lowest non-zero submission score
SELECT MIN(score) AS lowest_score FROM submissions WHERE score > 0;
```

**GROUP BY** groups rows sharing a common value and enables per-group aggregation. **HAVING** filters groups after aggregation (vs. `WHERE` which filters rows before).

```sql
-- GROUP BY: Total score per user across all contests
SELECT u.username, SUM(s.score) AS total_score, COUNT(s.submission_id) AS num_submissions
FROM submissions s
JOIN users u ON s.user_id = u.user_id
GROUP BY u.user_id, u.username
ORDER BY total_score DESC;

-- GROUP BY: Average score per difficulty level
SELECT p.difficulty, ROUND(AVG(s.score), 2) AS avg_score, COUNT(*) AS submissions
FROM submissions s
JOIN problems p ON s.problem_id = p.problem_id
GROUP BY p.difficulty
ORDER BY avg_score DESC;

-- HAVING: Users with total score exceeding 300
SELECT u.username, SUM(s.score) AS total_score
FROM submissions s
JOIN users u ON s.user_id = u.user_id
GROUP BY u.user_id, u.username
HAVING total_score > 300
ORDER BY total_score DESC;

-- HAVING: Contests with more than 2 participants
SELECT c.title, COUNT(p.user_id) AS participants
FROM contests c
JOIN participations p ON c.contest_id = p.contest_id
GROUP BY c.contest_id, c.title
HAVING participants > 2;
```

### 3.1.4 Set Operations

Set operations combine result sets from two or more `SELECT` queries.

> **Note:** MySQL does not natively support `INTERSECT` and `EXCEPT`. These are simulated using `IN` and `NOT IN` subqueries.

```sql
-- UNION: Combined distinct list of contest and problem titles
SELECT title AS item_title, 'Contest' AS type FROM contests
UNION
SELECT title AS item_title, 'Problem' AS type FROM problems;

-- UNION ALL: Same as UNION but retains duplicates
SELECT title AS item_title, 'Contest' AS type FROM contests
UNION ALL
SELECT title AS item_title, 'Problem' AS type FROM problems;

-- INTERSECT equivalent: Users who have BOTH participated AND submitted code
SELECT u.username FROM users u
WHERE u.user_id IN (SELECT user_id FROM participations)
  AND u.user_id IN (SELECT user_id FROM submissions);

-- EXCEPT equivalent: Users who registered but made NO submissions
SELECT u.username FROM users u
JOIN participations p ON u.user_id = p.user_id
WHERE u.user_id NOT IN (SELECT user_id FROM submissions);

-- EXCEPT equivalent: Problems not assigned to any contest
SELECT title AS unassigned_problem FROM problems 
WHERE problem_id NOT IN (SELECT problem_id FROM contest_problems);
```

---

## 3.2 Task 2 (Week 5): Subqueries, Joins, and Views

### 3.2.1 Subqueries

Subqueries (nested queries) allow embedding one query inside another. They are categorized into scalar, correlated, and inline-view subqueries.

```sql
-- Scalar Subquery: Problem with the highest maximum score
SELECT title, difficulty, max_score
FROM problems
WHERE max_score = (SELECT MAX(max_score) FROM problems);

-- Correlated Subquery: Users whose avg score exceeds the platform average
SELECT username FROM users 
WHERE user_id IN (
    SELECT user_id FROM submissions 
    GROUP BY user_id 
    HAVING AVG(score) > (SELECT AVG(score) FROM submissions)
);

-- Inline-view (FROM subquery): Rank users by best score per problem
SELECT username, total_best_score
FROM (
    SELECT u.username, SUM(best.max_score) AS total_best_score
    FROM users u
    JOIN (
        SELECT user_id, problem_id, MAX(score) AS max_score
        FROM submissions GROUP BY user_id, problem_id
    ) AS best ON u.user_id = best.user_id
    GROUP BY u.user_id, u.username
) AS user_rankings
ORDER BY total_best_score DESC;

-- EXISTS Subquery: Contests that have at least one submission
SELECT c.title FROM contests c
WHERE EXISTS (SELECT 1 FROM submissions s WHERE s.contest_id = c.contest_id);

-- Nested Subquery: Users who attempted the hardest (HARD) problem
SELECT u.username FROM users u
WHERE u.user_id IN (
    SELECT s.user_id FROM submissions s
    WHERE s.problem_id IN (
        SELECT problem_id FROM problems WHERE difficulty = 'HARD'
    ) AND s.score > 0
);
```

### 3.2.2 Joins

Joins combine rows from two or more tables based on related columns. The following join types are demonstrated:

```sql
-- INNER JOIN: Detailed submissions with user and problem info
SELECT u.username, p.title AS problem_title, s.score, s.language, s.submission_time
FROM submissions s
INNER JOIN users u ON s.user_id = u.user_id
INNER JOIN problems p ON s.problem_id = p.problem_id;

-- LEFT JOIN: All contests with their problems (NULL if no problems assigned)
SELECT c.title AS contest_title, p.title AS problem_title, p.difficulty
FROM contests c
LEFT JOIN contest_problems cp ON c.contest_id = cp.contest_id
LEFT JOIN problems p ON cp.problem_id = p.problem_id;

-- RIGHT JOIN: All problems and their parent contests
SELECT p.title AS problem_title, c.title AS contest_title
FROM contests c
JOIN contest_problems cp ON c.contest_id = cp.contest_id
RIGHT JOIN problems p ON cp.problem_id = p.problem_id;

-- SELF JOIN (simulated): Compare scores between two users on the same problem
SELECT u1.username AS user_a, u2.username AS user_b,
       p.title AS problem, s1.score AS score_a, s2.score AS score_b
FROM submissions s1
JOIN submissions s2 ON s1.contest_id = s2.contest_id 
    AND s1.problem_id = s2.problem_id AND s1.user_id < s2.user_id
JOIN users u1 ON s1.user_id = u1.user_id
JOIN users u2 ON s2.user_id = u2.user_id
JOIN problems p ON s1.problem_id = p.problem_id;

-- Multi-table JOIN: Full contest participation details
SELECT c.title AS contest, u.username, p.title AS problem, s.score, s.language
FROM participations part
JOIN users u ON part.user_id = u.user_id
JOIN contests c ON part.contest_id = c.contest_id
LEFT JOIN submissions s ON part.user_id = s.user_id AND part.contest_id = s.contest_id
LEFT JOIN problems p ON s.problem_id = p.problem_id
ORDER BY c.title, u.username;
```

### 3.2.3 Views

Views are virtual tables that simplify complex queries and provide an abstraction layer for data access.

```sql
-- View 1: Contest Leaderboard — ranks users per contest
CREATE OR REPLACE VIEW Contest_Leaderboard_View AS
SELECT c.title AS contest_name, u.username, 
       SUM(s.score) AS total_score, COUNT(s.submission_id) AS num_submissions,
       MAX(s.submission_time) AS last_submission_time
FROM submissions s
JOIN users u ON s.user_id = u.user_id
JOIN contests c ON s.contest_id = c.contest_id
GROUP BY c.contest_id, u.user_id
ORDER BY c.contest_id, total_score DESC;

-- View 2: User Performance Summary
CREATE OR REPLACE VIEW User_Performance_View AS
SELECT u.username, u.email,
       COUNT(DISTINCT s.contest_id) AS contests_attempted,
       COUNT(DISTINCT s.problem_id) AS unique_problems_solved,
       SUM(s.score) AS lifetime_score,
       ROUND(AVG(s.score), 2) AS avg_score_per_submission
FROM users u
LEFT JOIN submissions s ON u.user_id = s.user_id
WHERE u.role = 'USER'
GROUP BY u.user_id, u.username, u.email;

-- View 3: Contest Overview with statistics
CREATE OR REPLACE VIEW Contest_Overview_View AS
SELECT c.title, c.status, c.start_time, c.end_time,
       COUNT(DISTINCT cp.problem_id) AS num_problems,
       COUNT(DISTINCT p.user_id) AS num_participants
FROM contests c
LEFT JOIN contest_problems cp ON c.contest_id = cp.contest_id
LEFT JOIN participations p ON c.contest_id = p.contest_id
GROUP BY c.contest_id, c.title, c.status, c.start_time, c.end_time;
```

Querying the views:
```sql
SELECT * FROM Contest_Leaderboard_View;
SELECT * FROM User_Performance_View;
SELECT * FROM Contest_Overview_View;
```

---

## 3.3 Task 3 (Week 6): Functions, Triggers, Cursors, and Exception Handling

### 3.3.1 User-Defined Functions

Functions encapsulate reusable logic and return a single computed value.

```sql
-- Function 1: Calculate a user's total best score (best score per problem, summed)
DELIMITER //
CREATE FUNCTION GetUserTotalScore(p_user_id INT) 
RETURNS INT
DETERMINISTIC READS SQL DATA
BEGIN
    DECLARE total INT DEFAULT 0;
    SELECT COALESCE(SUM(max_score), 0) INTO total
    FROM (
        SELECT MAX(score) AS max_score
        FROM submissions WHERE user_id = p_user_id
        GROUP BY problem_id
    ) AS BestScores;
    RETURN total;
END //
DELIMITER ;

-- Usage: SELECT GetUserTotalScore(2) AS sayan_best_total;
```

```sql
-- Function 2: Determine a contest's real-time status based on current time
DELIMITER //
CREATE FUNCTION GetContestStatus(p_contest_id INT) 
RETURNS VARCHAR(10)
DETERMINISTIC READS SQL DATA
BEGIN
    DECLARE v_start DATETIME;
    DECLARE v_end DATETIME;
    DECLARE v_status VARCHAR(10);
    
    SELECT start_time, end_time INTO v_start, v_end
    FROM contests WHERE contest_id = p_contest_id;
    
    IF NOW() < v_start THEN SET v_status = 'UPCOMING';
    ELSEIF NOW() BETWEEN v_start AND v_end THEN SET v_status = 'ONGOING';
    ELSE SET v_status = 'ENDED';
    END IF;
    
    RETURN v_status;
END //
DELIMITER ;

-- Usage: SELECT GetContestStatus(1) AS contest_1_status;
```

### 3.3.2 Triggers with Exception Handling

Triggers are automatic procedures executed in response to data modification events (`INSERT`, `UPDATE`, `DELETE`). Combined with `SIGNAL SQLSTATE`, they enforce complex business rules with custom exception messages.

```sql
-- Trigger 1: Block submissions after a contest has ended
DELIMITER //
CREATE TRIGGER Prevent_Submission_After_Contest
BEFORE INSERT ON submissions
FOR EACH ROW
BEGIN
    DECLARE contestEndTime DATETIME;
    SELECT end_time INTO contestEndTime FROM contests WHERE contest_id = NEW.contest_id;
    
    -- Exception Handling: raise custom error for late submissions
    IF NEW.submission_time > contestEndTime THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Exception: Cannot submit code after contest end time.';
    END IF;
END //
DELIMITER ;
```

```sql
-- Trigger 2: Auto-cap scores and reject negative scores
DELIMITER //
CREATE TRIGGER Cap_Score_On_Insert
BEFORE INSERT ON submissions
FOR EACH ROW
BEGIN
    DECLARE v_max_score INT;
    SELECT max_score INTO v_max_score FROM problems WHERE problem_id = NEW.problem_id;
    
    -- Exception: reject negative scores
    IF NEW.score < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Exception: Submission score cannot be negative.';
    END IF;
    
    -- Auto-cap score to problem's maximum
    IF NEW.score > v_max_score THEN
        SET NEW.score = v_max_score;
    END IF;
END //
DELIMITER ;
```

### 3.3.3 Cursors and Exception Handling

Cursors allow row-by-row processing of query results inside stored procedures. Exception handlers manage errors gracefully during execution.

```sql
DELIMITER //
CREATE PROCEDURE GeneratePerformanceReport()
BEGIN
    -- Variable declarations
    DECLARE done INT DEFAULT FALSE;
    DECLARE var_contest_id INT;
    DECLARE var_contest_title VARCHAR(100);
    DECLARE var_participant_count INT;
    DECLARE var_avg_score DECIMAL(10,2);
    DECLARE var_total_submissions INT;
    DECLARE var_best_score INT;
    
    -- Cursor: iterate over all contests
    DECLARE contest_cursor CURSOR FOR 
        SELECT contest_id, title FROM contests;
        
    -- Exception Handler 1: CONTINUE handler (end-of-cursor)
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Exception Handler 2: EXIT handler (SQL exceptions)
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT 'An error occurred while generating the report.' AS ErrorMessage;
        ROLLBACK;
    END;

    -- Temporary table for report output
    CREATE TEMPORARY TABLE IF NOT EXISTS Temp_Performance_Report (
        contest_title VARCHAR(100),
        participants INT,
        total_submissions INT,
        average_score DECIMAL(10,2),
        best_score INT
    );
    TRUNCATE TABLE Temp_Performance_Report;

    OPEN contest_cursor;

    -- Row-by-row iteration
    read_loop: LOOP
        FETCH contest_cursor INTO var_contest_id, var_contest_title;
        IF done THEN LEAVE read_loop; END IF;

        -- Aggregate statistics per contest
        SELECT COUNT(user_id) INTO var_participant_count 
        FROM participations WHERE contest_id = var_contest_id;

        SELECT COALESCE(AVG(score), 0) INTO var_avg_score 
        FROM submissions WHERE contest_id = var_contest_id;

        SELECT COUNT(submission_id) INTO var_total_submissions 
        FROM submissions WHERE contest_id = var_contest_id;

        SELECT COALESCE(MAX(score), 0) INTO var_best_score 
        FROM submissions WHERE contest_id = var_contest_id;
        
        INSERT INTO Temp_Performance_Report VALUES 
            (var_contest_title, var_participant_count, var_total_submissions, 
             var_avg_score, var_best_score);
    END LOOP;

    CLOSE contest_cursor;
    
    SELECT * FROM Temp_Performance_Report;
    DROP TEMPORARY TABLE IF EXISTS Temp_Performance_Report;
END //
DELIMITER ;

-- Usage: CALL GeneratePerformanceReport();
```

**Exception Handling Summary:**

| Handler Type | Syntax | Purpose |
|---|---|---|
| `CONTINUE HANDLER FOR NOT FOUND` | `DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;` | Gracefully handles cursor reaching end of result set |
| `EXIT HANDLER FOR SQLEXCEPTION` | `DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ... END;` | Catches and handles unexpected SQL errors |
| `SIGNAL SQLSTATE '45000'` | `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '...';` | Raises custom user-defined exceptions in triggers |

---

## Summary

The implementations in Chapter 3 demonstrate a comprehensive and robust handling of the CodeArena database through progressive SQL concepts:

- **Task 1** establishes data management fundamentals through DML operations, constraint enforcement with detailed violation examples, aggregate functions (`COUNT`, `SUM`, `AVG`, `MAX`, `MIN`) with `GROUP BY` and `HAVING`, and set operations (`UNION`, `INTERSECT`, `EXCEPT`).
- **Task 2** builds complex data retrieval using scalar, correlated, and EXISTS-based subqueries; all major join types (INNER, LEFT, RIGHT, SELF, Multi-table); and three practical views for leaderboard, user performance, and contest overview.
- **Task 3** implements programmable database objects — two user-defined functions, two triggers with custom exception handling via `SIGNAL SQLSTATE`, and a cursor-driven stored procedure with both `CONTINUE` and `EXIT` exception handlers for generating contest performance reports.

Together, these implementations ensure the Online Coding Contest platform database functions safely, accurately, and efficiently.
