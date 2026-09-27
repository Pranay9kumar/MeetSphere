import express from 'express';
import { getIceServers } from '../services/turnService.js';

const router = express.Router();

/**
 * @route   GET /api/v1/ice-servers
 * @desc    Get dynamic time-limited STUN/TURN ICE server credentials for WebRTC pre-join initialization
 * @access  Public / Authenticated
 */
router.get('/ice-servers', (req, res, next) => {
  try {
    const userId = req.user?.id || req.query.userId || 'meetsphere_user';
    const ttlSeconds = req.query.ttl ? parseInt(req.query.ttl, 10) : undefined;

    const iceServerConfig = getIceServers({ userId, ttlSeconds });

    return res.json({
      success: true,
      data: iceServerConfig
    });
  } catch (error) {
    next(error);
  }
});

export default router;
