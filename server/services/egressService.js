import { EgressClient, EncodedFileOutput, EncodedFileType, S3Upload, GCPUpload } from 'livekit-server-sdk';
import { getConfig } from '../config/env.js';
import { Meeting } from '../models/Meeting.js';
import { sendRecordingEmail } from './emailService.js';

let egressClient = null;

function getEgressClient() {
  if (egressClient) return egressClient;
  const config = getConfig();
  const host = config.liveKitApiUrl || process.env.LIVEKIT_API_URL || 'http://localhost:7880';
  const apiKey = config.liveKitApiKey || process.env.LIVEKIT_API_KEY || 'devkey';
  const apiSecret = config.liveKitApiSecret || process.env.LIVEKIT_API_SECRET || 'secretkey';

  egressClient = new EgressClient(host, apiKey, apiSecret);
  return egressClient;
}

// In-memory active recordings tracker: roomId -> { egressId, targetEmail, startedAt }
const activeRecordings = new Map();

/**
 * Start LiveKit RoomCompositeEgress for a meeting.
 *
 * @param {Object} options
 * @param {string} options.roomName - LiveKit room identifier
 * @param {string} options.targetEmail - Destination Gmail address
 * @param {string} [options.layout] - 'grid' or 'speaker'
 */
export async function startRecording({ roomName, targetEmail, layout = 'grid' }) {
  if (!roomName) throw new Error('Room name is required');
  if (!targetEmail) throw new Error('Target email address is required');

  const client = getEgressClient();
  if (!client) throw new Error('LiveKit Egress is not configured');
  const filePrefix = `meetsphere-${roomName}-${Date.now()}`;
  const filepath = `recordings/${roomName}/${filePrefix}.mp4`;

  let output = null;

  // 1. AWS S3 Upload configuration if credentials present
  if (process.env.S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    output = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath,
      output: {
        case: 's3',
        value: new S3Upload({
          bucket: process.env.S3_BUCKET,
          region: process.env.AWS_REGION || 'us-east-1',
          accessKey: process.env.AWS_ACCESS_KEY_ID,
          secret: process.env.AWS_SECRET_ACCESS_KEY,
          endpoint: process.env.S3_ENDPOINT || undefined,
          forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
        })
      }
    });
  } 
  // 2. Google Cloud Storage configuration if credentials present
  else if (process.env.GCS_BUCKET && process.env.GCS_CREDENTIALS) {
    output = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath,
      output: {
        case: 'gcp',
        value: new GCPUpload({
          bucket: process.env.GCS_BUCKET,
          credentials: process.env.GCS_CREDENTIALS
        })
      }
    });
  }
  else throw new Error('Recording storage is not configured; set S3 or GCS output settings');

  try {
    const egressInfo = await client.startRoomCompositeEgress(roomName, output, {
      layout,
      audioOnly: false,
      videoOnly: false
    });

    const egressId = egressInfo.egressId;
    const startedAt = new Date();

    activeRecordings.set(roomName, {
      egressId,
      targetEmail,
      startedAt,
      filepath
    });

    console.log(`[egressService] Recording started for room "${roomName}" (EgressID: ${egressId}, Destination: ${targetEmail})`);

    return {
      status: 'recording',
      egressId,
      roomName,
      targetEmail,
      startedAt: startedAt.toISOString()
    };
  } catch (err) {
    console.error(`[egressService] Error starting LiveKit Egress:`, err.message);
    throw new Error(`Recording could not be started: ${err.message}`);
  }
}

/**
 * Stop active recording for a room.
 */
export async function stopRecording({ roomName }) {
  const active = activeRecordings.get(roomName);
  if (!active) {
    throw new Error(`No active recording found for room "${roomName}"`);
  }

  const { egressId, targetEmail, startedAt, filepath } = active;
  const client = getEgressClient();

  await client.stopEgress(egressId);

  activeRecordings.delete(roomName);

  const duration = Math.max(1, Math.round((Date.now() - startedAt.getTime()) / 1000));
  const publicBaseUrl = process.env.STORAGE_PUBLIC_URL;
  if (!publicBaseUrl) throw new Error('STORAGE_PUBLIC_URL is not configured');
  const fileUrl = `${publicBaseUrl}/${filepath}`;

  // Persist recording metadata to MongoDB Meeting model
  await Meeting.findOneAndUpdate(
    { roomName },
    {
      $push: {
        recordings: {
          egressId,
          fileUrl,
          targetEmail,
          recordedAt: new Date(),
          duration
        }
      },
      $set: { status: 'completed' }
    },
    { upsert: true, new: true }
  ).catch((err) => console.error('[egressService] Failed to save recording metadata:', err.message));

  // Send email to the provided Gmail address
  await sendRecordingEmail({
    to: targetEmail,
    roomName,
    fileUrl,
    duration,
    recordedAt: new Date().toISOString()
  }).catch((err) => console.error('[egressService] Failed to send email:', err.message));

  return {
    status: 'stopped',
    egressId,
    roomName,
    targetEmail,
    duration,
    fileUrl
  };
}

/**
 * Check if a room currently has an active recording.
 */
export function getActiveRecording(roomName) {
  const active = activeRecordings.get(roomName);
  if (!active) return null;
  return {
    status: 'recording',
    egressId: active.egressId,
    targetEmail: active.targetEmail,
    startedAt: active.startedAt.toISOString(),
    elapsedSeconds: Math.round((Date.now() - active.startedAt.getTime()) / 1000)
  };
}

export default {
  startRecording,
  stopRecording,
  getActiveRecording
};
