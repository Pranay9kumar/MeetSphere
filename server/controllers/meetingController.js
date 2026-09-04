import { Meeting } from '../models/Meeting.js';
import { generateLiveKitToken } from '../config/livekit.js';

/**
 * Generate a unique alphanumeric room name slug from a title.
 * Converts to lowercase, replaces spaces with hyphens, removes non-alphanumeric chars,
 * and appends a short random suffix for uniqueness.
 */
function generateRoomName(title) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

/**
 * POST /api/meetings
 * Create a new meeting document.
 * Auto-generates a unique roomName slug from the title.
 * Uses the authenticated user's ID as the host.
 */
export const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const roomName = generateRoomName(title);

    const meeting = await Meeting.create({
      title: title.trim(),
      hostId: req.user._id,
      roomName
    });

    res.status(201).json(meeting);
  } catch (err) {
    console.error('[MeetingController] createMeeting error:', err);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
};

/**
 * GET /api/meetings
 * Retrieve all meetings for the authenticated user (where hostId matches).
 */
export const getUserMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ hostId: req.user._id })
      .populate('hostId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(meetings);
  } catch (err) {
    console.error('[MeetingController] getUserMeetings error:', err);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

export const createMeetingToken = async (req, res) => {
  try {
    const { roomName, userMetadata } = req.body;
    if (!roomName) {
      return res.status(400).json({ error: 'roomName is required' });
    }

    const meeting = await Meeting.findOne({ roomName }).select('roomName hostId');
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const identity = req.user._id.toString();
    const role = meeting.hostId.toString() === identity ? 'host' : 'attendee';
    const token = generateLiveKitToken(roomName, identity, {
      role,
      metadata: { ...(userMetadata || {}), role }
    });

    res.json({ token, roomName, identity, role, ttl: process.env.LIVEKIT_TOKEN_TTL || '4h' });
  } catch (err) {
    console.error('[MeetingController] createMeetingToken error:', err);
    res.status(500).json({ error: 'Failed to generate token' });
  }
};

