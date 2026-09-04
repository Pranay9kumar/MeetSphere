import { Router } from 'express';
import { createMeeting, createMeetingToken, getUserMeetings } from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/meetings — Create a new meeting (authenticated)
router.post('/', protect, createMeeting);

// GET /api/meetings — Get all meetings for the authenticated user
router.get('/', protect, getUserMeetings);

// POST /api/meetings/token — Generate a role-aware LiveKit token
router.post('/token', protect, createMeetingToken);

export default router;

