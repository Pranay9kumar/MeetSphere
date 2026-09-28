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

/**
 * Soft-delete a meeting by ID (host only).
 */
export const deleteMeeting = async (meetingId) => {
  const response = await api.delete(`/meetings/${encodeURIComponent(meetingId)}`);
  return response.data;
};

/**
 * Kick/remove a participant from a meeting (host only).
 * @param {string} roomId
 * @param {string} participantIdentity
 */
export const removeMeetingParticipant = async (roomId, participantIdentity) => {
  const response = await api.post(`/meetings/${encodeURIComponent(roomId)}/remove-participant`, {
    participantIdentity
  });
  return response.data;
};

// ── Document API ──────────────────────────────────────────────────────────────

/**
 * Fetch documents owned by the authenticated user.
 */
export const getUserDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

/**
 * Upload a document file (multipart/form-data).
 * @param {File} file - The file object from an <input type="file"> element.
 * @param {string} [meetingId] - Optional associated meeting ID.
 */
export const uploadDocument = async (file, meetingId) => {
  const formData = new FormData();
  formData.append('file', file);
  if (meetingId) formData.append('meetingId', meetingId);
  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/**
 * Delete a document by ID.
 */
export const deleteDocument = async (docId) => {
  const response = await api.delete(`/documents/${encodeURIComponent(docId)}`);
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
  getRoomRecordingStatus,
  deleteMeeting,
  getUserDocuments,
  uploadDocument,
  deleteDocument
};
