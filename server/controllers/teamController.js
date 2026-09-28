import { Workspace } from '../models/Workspace.js';

const DEFAULT_TEAMS = [
  { name: 'Engineering & Architecture', description: 'Core software engineering and systems team' },
  { name: 'Product & Strategy', description: 'Product roadmap, requirements and strategy sync' },
  { name: 'Design & UX Review', description: 'User experience, prototypes and design tokens' },
  { name: 'Marketing & Launch', description: 'Growth, marketing campaigns and announcements' },
  { name: 'General & Operations', description: 'Company-wide updates and operational topics' }
];

/**
 * GET /api/teams
 * Retrieve all teams/workspaces for the authenticated user, auto-seeding defaults if empty.
 */
export const getTeams = async (req, res) => {
  try {
    let teams = await Workspace.find({
      $or: [
        { ownerId: req.user._id },
        { members: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    // Auto-seed default teams for new users so the database always has real teams
    if (!teams || teams.length === 0) {
      const seeded = await Promise.all(
        DEFAULT_TEAMS.map((t) =>
          Workspace.create({
            name: t.name,
            description: t.description,
            ownerId: req.user._id,
            members: [req.user._id]
          })
        )
      );
      teams = seeded;
    }

    res.json(teams);
  } catch (err) {
    console.error('[TeamController] getTeams error:', err);
    res.status(500).json({ error: 'Failed to retrieve teams' });
  }
};

/**
 * POST /api/teams
 * Create a new team/workspace.
 */
export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Check if team already exists for this owner
    const existing = await Workspace.findOne({
      ownerId: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({ error: 'A team with this name already exists' });
    }

    const team = await Workspace.create({
      name: name.trim(),
      description: description?.trim() || '',
      ownerId: req.user._id,
      members: [req.user._id]
    });

    res.status(201).json(team);
  } catch (err) {
    console.error('[TeamController] createTeam error:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
};

/**
 * DELETE /api/teams/:id
 * Delete a team if the authenticated user is the owner.
 */
export const deleteTeam = async (req, res) => {
  try {
    const team = await Workspace.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found or unauthorized' });
    }

    res.json({ message: 'Team deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('[TeamController] deleteTeam error:', err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
};
