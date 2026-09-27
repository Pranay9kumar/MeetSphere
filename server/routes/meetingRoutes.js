import { Router } from 'express';
import {
  createMeeting,
  createMeetingToken,
  getUserMeetings,
  getMeetingDetails,
  sendMeetingMessage,
  getMeetingMessages,
  startMeetingRecording,
  stopMeetingRecording,
  getMeetingRecordingStatus
} from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Meeting Lifecycle Routes
router.post('/', protect, createMeeting);
router.get('/', protect, getUserMeetings);
router.get('/:roomId', protect, getMeetingDetails);
router.post('/token', protect, createMeetingToken);

// Meeting Chat Persistence Routes
router.post('/:roomId/messages', protect, sendMeetingMessage);
router.get('/:roomId/messages', protect, getMeetingMessages);

// Meeting Recording (Egress) Lifecycle Routes
router.post('/:roomId/recording/start', protect, startMeetingRecording);
router.post('/:roomId/recording/stop', protect, stopMeetingRecording);
router.get('/:roomId/recording/status', protect, getMeetingRecordingStatus);

export default router;
