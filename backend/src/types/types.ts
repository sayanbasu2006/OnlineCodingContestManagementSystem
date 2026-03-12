// User types
export interface User {
    user_id: number;
    username: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'USER';
    created_at: Date;
}

export interface UserPayload {
    user_id: number;
    role: 'ADMIN' | 'USER';
}

// Contest types
export interface Contest {
    contest_id: number;
    title: string;
    description: string;
    start_time: Date;
    end_time: Date;
    status: 'UPCOMING' | 'ONGOING' | 'ENDED';
    created_at: Date;
}

export interface CreateContestDTO {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    status?: 'UPCOMING' | 'ONGOING' | 'ENDED';
}

// Problem types
export interface Problem {
    problem_id: number;
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    max_score: number;
}

export interface CreateProblemDTO {
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    max_score: number;
}

// Submission types
export interface Submission {
    submission_id: number;
    user_id: number;
    contest_id: number;
    problem_id: number;
    code: string;
    language: string;
    score: number;
    submission_time: Date;
}

export interface CreateSubmissionDTO {
    contest_id: number;
    problem_id: number;
    code: string;
    language?: string;
    score?: number;
}

// Participation types
export interface Participation {
    participation_id: number;
    user_id: number;
    contest_id: number;
    join_time: Date;
}

// Leaderboard types
export interface LeaderboardEntry {
    rank: number;
    user_id: number;
    username: string;
    total_score: number;
    submissions: number;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Contest-Problem junction
export interface ContestProblem {
    contest_id: number;
    problem_id: number;
}
