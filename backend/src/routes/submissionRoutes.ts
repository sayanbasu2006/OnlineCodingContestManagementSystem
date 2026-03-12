import express from 'express';
import { getSubmissions, submitSolution, joinContest, getParticipations } from '../controllers/submissionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getSubmissions);
router.post('/', protect, submitSolution);

router.get('/participations', getParticipations);
router.post('/participations', protect, joinContest);

export default router;
