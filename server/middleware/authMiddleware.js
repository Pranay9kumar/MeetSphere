import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { getJwtSecret } from '../config/env.js';

export function extractAccessToken(request) {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
  return searchParams.get('token');
}

export function verifyAccessToken(token) {
  if (!token) {
    throw new Error('Missing access token');
  }

  return jwt.verify(token, getJwtSecret());
}

/**
 * Authentication middleware.
 * Verifies the JWT token from the Authorization header (Bearer token),
 * attaches the authenticated user to req.user, and passes control to next().
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized — no token provided' });
    }

    const decoded = verifyAccessToken(token);

    // Attach user to request (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Not authorized — user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[AuthMiddleware] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Not authorized — invalid token' });
  }
};

