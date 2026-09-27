import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getConfig, getJwtSecret } from '../config/env.js';

/**
 * Generate a JWT token for a given user.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: getConfig().jwtExpiresIn });
}

/**
 * POST /api/auth/register
 * Register a new user with name, email, and password.
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user (password hashed via pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      token
    });
  } catch (err) {
    console.error('[AuthController] registerUser error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * POST /api/auth/login
 * Login with email and password, returns JWT token.
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user by email and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password using instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      token
    });
  } catch (err) {
    console.error('[AuthController] loginUser error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    cloudStorageEmail: user.cloudStorageEmail || '',
    calendarEmail: user.calendarEmail || '',
    timezone: user.timezone || 'UTC',
    emailNotifications: user.emailNotifications !== false
  };
}

export const updateUserSettings = async (req, res) => {
  try {
    const { name, cloudStorageEmail, calendarEmail, timezone, emailNotifications } = req.body;
    if (cloudStorageEmail && !/^\S+@\S+\.\S+$/.test(cloudStorageEmail)) {
      return res.status(400).json({ error: 'Cloud storage email must be valid' });
    }
    if (calendarEmail && !/^\S+@\S+\.\S+$/.test(calendarEmail)) {
      return res.status(400).json({ error: 'Calendar email must be valid' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name?.trim() ? { name: name.trim() } : {}),
        cloudStorageEmail: cloudStorageEmail?.trim().toLowerCase() || '',
        calendarEmail: calendarEmail?.trim().toLowerCase() || '',
        timezone: timezone?.trim() || 'UTC',
        ...(typeof emailNotifications === 'boolean' ? { emailNotifications } : {})
      },
      { new: true, runValidators: true }
    );

    res.json(publicUser(user));
  } catch (err) {
    console.error('[AuthController] updateUserSettings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
};

