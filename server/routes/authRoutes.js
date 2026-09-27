import { Router } from 'express';
import { registerUser, loginUser, updateUserSettings } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/register — Create a new user account
router.post('/register', registerUser);

// POST /api/auth/login — Authenticate user and return JWT
router.post('/login', loginUser);
router.get('/me', protect, (req, res) => res.json({
	_id: req.user._id,
	name: req.user.name,
	email: req.user.email,
	avatar: req.user.avatar,
	role: req.user.role,
	 status: req.user.status,
	 cloudStorageEmail: req.user.cloudStorageEmail || '',
	 calendarEmail: req.user.calendarEmail || '',
	 timezone: req.user.timezone || 'UTC',
	 emailNotifications: req.user.emailNotifications !== false
}));
	router.patch('/settings', protect, updateUserSettings);

export default router;

