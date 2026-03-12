import { LeaderboardEntry } from '../types/types';
const { pool } = require('../config/db');

/**
 * Get leaderboard for a specific contest
 */
export const getContestLeaderboardData = async (contestId: number): Promise<LeaderboardEntry[]> => {
    const [rows]: any = await pool.execute(
        `SELECT u.user_id, u.username, 
                COALESCE(SUM(s.score), 0) AS total_score, 
                COUNT(s.submission_id) AS submissions
         FROM participations p
         JOIN users u ON p.user_id = u.user_id
         LEFT JOIN submissions s ON p.user_id = s.user_id AND p.contest_id = s.contest_id
         WHERE p.contest_id = ?
         GROUP BY u.user_id, u.username
         ORDER BY total_score DESC, submissions ASC`,
        [contestId]
    );

    return rows.map((row: any, index: number) => ({
        rank: index + 1,
        user_id: row.user_id,
        username: row.username,
        total_score: Number(row.total_score),
        submissions: Number(row.submissions)
    }));
};

/**
 * Get global leaderboard across all contests
 */
export const getGlobalLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
    const [rows]: any = await pool.execute(
        `SELECT u.user_id, u.username, 
                COALESCE(SUM(s.score), 0) AS total_score, 
                COUNT(s.submission_id) AS submissions
         FROM users u
         LEFT JOIN submissions s ON u.user_id = s.user_id
         GROUP BY u.user_id, u.username
         HAVING total_score > 0 OR submissions > 0
         ORDER BY total_score DESC, submissions ASC`
    );

    return rows.map((row: any, index: number) => ({
        rank: index + 1,
        user_id: row.user_id,
        username: row.username,
        total_score: Number(row.total_score),
        submissions: Number(row.submissions)
    }));
};

/**
 * Get user's rank in a specific contest
 */
export const getUserContestRank = async (userId: number, contestId: number): Promise<number | null> => {
    const leaderboard = await getContestLeaderboardData(contestId);
    const userEntry = leaderboard.find(entry => entry.user_id === userId);
    return userEntry ? userEntry.rank : null;
};

/**
 * Get user's global rank
 */
export const getUserGlobalRank = async (userId: number): Promise<number | null> => {
    const leaderboard = await getGlobalLeaderboardData();
    const userEntry = leaderboard.find(entry => entry.user_id === userId);
    return userEntry ? userEntry.rank : null;
};
