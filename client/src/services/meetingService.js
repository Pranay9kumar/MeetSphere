import api from './api';

/**
 * Create a new meeting.
 * @param {object} meetingData - { title }
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

export const getMeetingToken = async (roomName, userMetadata = {}) => {
  const response = await api.post('/meetings/token', { roomName, userMetadata });
  return response.data;
};

