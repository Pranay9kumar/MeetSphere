import { Meeting } from '../models/Meeting.js';
import { generateLiveKitToken } from '../config/livekit.js';
import { saveChatMessage, getRecentMessages } from '../services/chatService.js';
import { startRecording, stopRecording, getActiveRecording } from '../services/egressService.js';
import { createCatchUpSummary } from '../services/catchUpSummaryService.js';

/**
 * Generate a unique alphanumeric room name slug from a title.
 */
function generateRoomName(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

function canAccessMeeting(meeting, userId) {
  const normalizedUserId = userId.toString();
  const hostId = meeting.hostId?._id || meeting.hostId;
  const participants = meeting.participants || [];

  return hostId?.toString() === normalizedUserId
    || participants.some((participant) => {
      const participantId = participant.userId?._id || participant.userId;
      return participantId?.toString() === normalizedUserId;
    });
}

/**
 * POST /api/meetings
 * Create a new meeting document.
 */
export const createMeeting = async (req, res) => {
  try {
    const { title, description, scheduledAt, durationMinutes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const roomName = generateRoomName(title);
    const parsedScheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (scheduledAt && Number.isNaN(parsedScheduledAt.getTime())) {
      return res.status(400).json({ error: 'scheduledAt must be a valid date' });
    }
    if (parsedScheduledAt && parsedScheduledAt <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const meeting = await Meeting.create({
      title: title.trim(),
      description: description?.trim() || '',
      hostId: req.user._id,
      roomName,
      scheduledAt: parsedScheduledAt,
      durationMinutes: Number(durationMinutes) || 30
    });

    res.status(201).json(meeting);
  } catch (err) {
    console.error('[MeetingController] createMeeting error:', err);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
};

/**
 * GET /api/meetings
 * Retrieve all meetings with recordings & chat info for the authenticated user.
 */
export const getUserMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ hostId: req.user._id })
      .populate('hostId', 'name email avatar')
      .sort({ createdAt: -1 });

    const enrichedMeetings = await Promise.all(meetings.map(async (meeting) => {
      const chatHistory = await getRecentMessages(meeting.roomName, 100).catch(() => []);
      const aiMinutes = await createCatchUpSummary({
        room: meeting.roomName,
        requestedBy: req.user._id,
        messages: chatHistory
      });
      const rawMeeting = meeting.toObject();
      const latestRecording = rawMeeting.recordings?.[rawMeeting.recordings.length - 1];
      return {
        ...rawMeeting,
        duration: rawMeeting.duration || latestRecording?.duration || 0,
        participants: rawMeeting.participants || [],
        chatHistory,
        aiMinutes
      };
    }));

    res.json(enrichedMeetings);
  } catch (err) {
    console.error('[MeetingController] getUserMeetings error:', err);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

/**
 * GET /api/meetings/:roomId
 * Get full meeting details, recordings, and chat transcript.
 */
export const getMeetingDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const meeting = await Meeting.findOne({
      $or: [{ roomName: roomId }, { _id: roomId.match(/^[0-9a-fA-F]{24}$/) ? roomId : null }]
    }).populate('hostId', 'name email avatar');

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    if (!canAccessMeeting(meeting, req.user._id)) {
      return res.status(403).json({ error: 'You do not have access to this meeting' });
    }

    const messages = await getRecentMessages(roomId, 100).catch(() => []);
    const activeRecording = getActiveRecording(meeting?.roomName || roomId);

    res.json({
      meeting,
      messages,
      activeRecording
    });
  } catch (err) {
    console.error('[MeetingController] getMeetingDetails error:', err);
    res.status(500).json({ error: 'Failed to fetch meeting details' });
  }
};

/**
 * POST /api/meetings/token
 * Generate LiveKit access token for room participation.
 */
export const createMeetingToken = async (req, res) => {
  try {
    const { roomName, userMetadata } = req.body;
    if (!roomName) {
      return res.status(400).json({ error: 'roomName is required' });
    }

    const meeting = await Meeting.findOne({ roomName }).select('roomName hostId status');
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    if (meeting.status === 'completed') {
      return res.status(403).json({ error: 'This meeting has ended' });
    }

    const identity = req.user._id.toString();
    const role = meeting.hostId.toString() === identity ? 'host' : 'attendee';
    const token = await generateLiveKitToken(roomName, identity, {
      role,
      name: req.user.name,
      metadata: { ...(userMetadata || {}), name: req.user.name, role }
    });

    res.json({ token, roomName, identity, role, ttl: process.env.LIVEKIT_TOKEN_TTL || '4h' });
  } catch (err) {
    console.error('[MeetingController] createMeetingToken error:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

/**
 * POST /api/meetings/:roomId/messages
 * Persist an in-meeting chat message to MongoDB.
 */
export const sendMeetingMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const meeting = await Meeting.findOne({ roomName: roomId }).select('hostId participants');
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (!canAccessMeeting(meeting, req.user._id)) {
      return res.status(403).json({ error: 'You do not have access to this meeting' });
    }
    const { content, messageType = 'text', senderName } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const senderId = req.user?._id || req.body.senderId;
    const name = req.user?.name || senderName || 'Participant';

    const savedMessage = await saveChatMessage({
      room: roomId,
      senderId,
      senderName: name,
      content,
      messageType
    });

    res.status(201).json({ success: true, message: savedMessage });
  } catch (err) {
    console.error('[MeetingController] sendMeetingMessage error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to save chat message' });
  }
};

/**
 * GET /api/meetings/:roomId/messages
 * Retrieve past chat messages for a room.
 */
export const getMeetingMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const meeting = await Meeting.findOne({ roomName: roomId }).select('hostId participants');
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (!canAccessMeeting(meeting, req.user._id)) {
      return res.status(403).json({ error: 'You do not have access to this meeting' });
    }
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;

    const messages = await getRecentMessages(roomId, limit);
    res.json({ success: true, messages });
  } catch (err) {
    console.error('[MeetingController] getMeetingMessages error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to fetch chat messages' });
  }
};

/**
 * POST /api/meetings/:roomId/recording/start
 * Initiate LiveKit RoomCompositeEgress and register user's Gmail.
 */
export const startMeetingRecording = async (req, res) => {
  try {
    const { roomId } = req.params;
    const meeting = await Meeting.findOne({ roomName: roomId }).select('hostId');
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the meeting host can start a recording' });
    }
    const { targetEmail, layout } = req.body;
    const email = targetEmail || req.user?.email;

    if (!email) {
      return res.status(400).json({ error: 'A valid destination Gmail address is required' });
    }

    const result = await startRecording({
      roomName: roomId,
      targetEmail: email,
      layout: layout || 'grid'
    });

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[MeetingController] startMeetingRecording error:', err);
    res.status(500).json({ error: err.message || 'Failed to start recording' });
  }
};

/**
 * POST /api/meetings/:roomId/recording/stop
 * Stop recording, trigger MP4 finalization and email notification.
 */
export const stopMeetingRecording = async (req, res) => {
  try {
    const { roomId } = req.params;
    const meeting = await Meeting.findOne({ roomName: roomId }).select('hostId');
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the meeting host can stop a recording' });
    }
    const result = await stopRecording({ roomName: roomId });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[MeetingController] stopMeetingRecording error:', err);
    res.status(500).json({ error: err.message || 'Failed to stop recording' });
  }
};

/**
 * GET /api/meetings/:roomId/recording/status
 * Check current recording status for a room.
 */
export const getMeetingRecordingStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const meeting = await Meeting.findOne({ roomName: roomId }).select('hostId');
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    const status = getActiveRecording(roomId);
    res.json({ isRecording: Boolean(status), recording: status });
  } catch (err) {
    console.error('[MeetingController] getMeetingRecordingStatus error:', err);
    res.status(500).json({ error: 'Failed to retrieve recording status' });
  }
};

export default {
  createMeeting,
  getUserMeetings,
  getMeetingDetails,
  createMeetingToken,
  sendMeetingMessage,
  getMeetingMessages,
  startMeetingRecording,
  stopMeetingRecording,
  getMeetingRecordingStatus
};
