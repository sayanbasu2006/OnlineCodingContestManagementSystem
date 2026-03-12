import express from 'express';
import { getProblems, getProblemById, addProblem, updateProblem, deleteProblem } from '../controllers/problemController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/', protect, admin, addProblem);
router.put('/:id', protect, admin, updateProblem);
router.delete('/:id', protect, admin, deleteProblem);

export default router;
