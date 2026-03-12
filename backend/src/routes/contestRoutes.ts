import express from 'express';
import { 
    getContests, 
    getContestById, 
    createContest, 
    updateContest, 
    deleteContest,
    getContestProblems,
    addProblemToContest,
    removeProblemFromContest
} from '../controllers/contestController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getContests);
router.get('/:id', getContestById);
router.post('/', protect, admin, createContest);
router.put('/:id', protect, admin, updateContest);
router.delete('/:id', protect, admin, deleteContest);

// Contest-Problem management
router.get('/:id/problems', getContestProblems);
router.post('/:id/problems', protect, admin, addProblemToContest);
router.delete('/:id/problems/:problemId', protect, admin, removeProblemFromContest);

export default router;
