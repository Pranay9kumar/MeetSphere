import api from './api';

/**
 * Create a new meeting.
 * @param {object} meetingData - { title, description }
 * @returns {Promise<object>} The created meeting document
 */
export const createMeeting = async (meetingData) => {
  const response = await api.post('/meetings', meetingData);
  return response.data;
};

/**
 * Fetch all meetings for the authenticated user.
 * @returns {Promise<array>} Array of meeting documents
 */
export const getUserMeetings = async () => {
  const response = await api.get('/meetings');
  return response.data;
};

/**
 * Fetch full meeting details including recordings and chat transcript.
 * @param {string} roomId
 * @returns {Promise<object>}
 */
export const getMeetingDetails = async (roomId) => {
  const response = await api.get(`/meetings/${encodeURIComponent(roomId)}`);
  return response.data;
};

/**
 * Generate LiveKit token for joining a room.
 */
export const getMeetingToken = async (roomName, userMetadata = {}) => {
  const response = await api.post('/meetings/token', { roomName, userMetadata });
  return response.data;
};

/**
 * Persist an in-meeting chat message to MongoDB.
 */
export const sendRoomChatMessage = async (roomId, content, senderName) => {
  const response = await api.post(`/meetings/${encodeURIComponent(roomId)}/messages`, {
    content,
    senderName
  });
  return response.data;
};

/**
 * Fetch past chat messages for a room.
 */
export const getRoomChatMessages = async (roomId, limit = 50) => {
  const response = await api.get(`/meetings/${encodeURIComponent(roomId)}/messages?limit=${limit}`);
  return response.data;
};

/**
 * Start LiveKit RoomCompositeEgress recording.
 */
export const startRoomRecording = async (roomId, targetEmail, layout = 'grid') => {
  const response = await api.post(`/meetings/${encodeURIComponent(roomId)}/recording/start`, {
    targetEmail,
    layout
  });
  return response.data;
};

/**
 * Stop active meeting recording.
 */
export const stopRoomRecording = async (roomId) => {
  const response = await api.post(`/meetings/${encodeURIComponent(roomId)}/recording/stop`);
  return response.data;
};

/**
 * Get active recording status for a room.
 */
export const getRoomRecordingStatus = async (roomId) => {
  const response = await api.get(`/meetings/${encodeURIComponent(roomId)}/recording/status`);
  return response.data;
};

export default {
  createMeeting,
  getUserMeetings,
  getMeetingDetails,
  getMeetingToken,
  sendRoomChatMessage,
  getRoomChatMessages,
  startRoomRecording,
  stopRoomRecording,
  getRoomRecordingStatus
};
