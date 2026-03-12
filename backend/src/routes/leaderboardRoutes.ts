import express from 'express';
import { getGlobalLeaderboard, getContestLeaderboard } from '../controllers/leaderboardController';

const router = express.Router();

router.get('/', getGlobalLeaderboard);
router.get('/:contestId', getContestLeaderboard);

export default router;
