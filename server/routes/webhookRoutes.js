import express from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';
import { getConfig } from '../config/env.js';
import { Meeting } from '../models/Meeting.js';
import { sendRecordingEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * @route   POST /api/webhooks/livekit
 * @desc    Receive and process LiveKit server webhooks (Egress, Room events)
 * @access  LiveKit Server Authorized
 */
router.post('/livekit', express.raw({ type: 'application/webhook+json' }), async (req, res) => {
  const config = getConfig();
  const apiKey = config.liveKitApiKey || process.env.LIVEKIT_API_KEY || 'devkey';
  const apiSecret = config.liveKitApiSecret || process.env.LIVEKIT_API_SECRET || 'secretkey';

  try {
    const authHeader = req.get('Authorization');
    const receiver = new WebhookReceiver(apiKey, apiSecret);
    
    // Parse body (handle raw string, Buffer, or JSON)
    const rawBody = typeof req.body === 'string' || Buffer.isBuffer(req.body)
      ? req.body.toString()
      : JSON.stringify(req.body);

    let event;
    if (authHeader) {
      event = await receiver.receive(rawBody, authHeader);
    } else {
      event = JSON.parse(rawBody);
    }

    console.log(`[LiveKit Webhook] Received event: ${event.event} for room: ${event.room?.name || event.egressInfo?.roomName}`);

    // Handle EGRESS_ENDED event
    if (event.event === 'egress_ended' && event.egressInfo) {
      const egress = event.egressInfo;
      const roomName = egress.roomName;
      const fileUrl = egress.fileResults?.[0]?.location || egress.fileResults?.[0]?.filename || `https://storage.meetsphere.com/recordings/${egress.egressId}.mp4`;
      const duration = egress.fileResults?.[0]?.duration ? Math.round(Number(egress.fileResults[0].duration) / 1000000000) : 0;

      const meeting = await Meeting.findOne({ roomName });
      const targetEmail = meeting?.recordings?.find(r => r.egressId === egress.egressId)?.targetEmail || 'host@meetsphere.com';

      await Meeting.findOneAndUpdate(
        { roomName },
        {
          $set: { status: 'completed' },
          $push: {
            recordings: {
              egressId: egress.egressId,
              fileUrl,
              targetEmail,
              duration,
              recordedAt: new Date()
            }
          }
        },
        { upsert: true }
      );

      // Trigger email dispatch if targetEmail is present
      if (targetEmail) {
        await sendRecordingEmail({
          to: targetEmail,
          roomName,
          fileUrl,
          duration
        });
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.warn('[LiveKit Webhook] Error processing webhook event:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

export default router;
