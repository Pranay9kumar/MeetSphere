import api from './api';

/**
 * Fetch all existing teams/workspaces for the user.
 */
export const getTeams = async () => {
  const response = await api.get('/teams');
  return response.data;
};

/**
 * Create a new team.
 * @param {object} teamData - { name, description }
 */
export const createTeam = async (teamData) => {
  const response = await api.post('/teams', teamData);
  return response.data;
};

/**
 * Delete a team.
 * @param {string} teamId
 */
export const deleteTeam = async (teamId) => {
  const response = await api.delete(`/teams/${encodeURIComponent(teamId)}`);
  return response.data;
};

export default {
  getTeams,
  createTeam,
  deleteTeam
};
