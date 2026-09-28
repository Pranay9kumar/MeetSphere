import { Router } from 'express';
import { getTeams, createTeam, deleteTeam } from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getTeams);
router.post('/', protect, createTeam);
router.delete('/:id', protect, deleteTeam);

export default router;
