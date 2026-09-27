import mongoose from 'mongoose';
import { ChatMessage } from '../models/ChatMessage.js';
import { Room } from '../models/Room.js';
import { Meeting } from '../models/Meeting.js';
import { User } from '../models/User.js';

function serviceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Resolves a room identifier (name, roomCode, or ObjectId) against Room or Meeting collections.
 * Automatically initializes a meeting record if an ad-hoc room is joined.
 */
async function resolveRoom(roomIdentifier) {
  if (!roomIdentifier || typeof roomIdentifier !== 'string') {
    throw serviceError('A valid room identifier is required');
  }

  const trimmed = roomIdentifier.trim();
  const isValidId = mongoose.isValidObjectId(trimmed);

  // 1. Check Room collection
  let resolvedRoom = await Room.findOne(isValidId ? { _id: trimmed } : { name: trimmed }).select('_id name');
  if (resolvedRoom) {
    return { _id: resolvedRoom._id, name: resolvedRoom.name };
  }

  // 2. Check Meeting collection
  let meeting = await Meeting.findOne(isValidId ? { _id: trimmed } : { roomName: trimmed }).select('_id roomName title');
  if (meeting) {
    return { _id: meeting._id, name: meeting.roomName };
  }

  // 3. If ad-hoc meeting without prior record, find any system/default host and create Meeting record
  const defaultHost = await User.findOne().select('_id');
  const fallbackHostId = defaultHost?._id || new mongoose.Types.ObjectId();

  const newMeeting = await Meeting.create({
    title: `Room: ${trimmed}`,
    roomName: trimmed,
    hostId: fallbackHostId,
    status: 'active'
  });

  return { _id: newMeeting._id, name: newMeeting.roomName };
}

/**
 * Persist a chat message to MongoDB.
 */
export async function saveChatMessage({ room, senderId, senderName, content, messageType = 'text' }) {
  if (typeof content !== 'string' || !content.trim()) {
    throw serviceError('Message content is required');
  }
  if (content.trim().length > 4000) {
    throw serviceError('Message content exceeds 4000 characters');
  }
  if (!['text', 'system'].includes(messageType)) {
    throw serviceError('Invalid message type');
  }

  const resolved = await resolveRoom(room);

  // Validate or construct valid ObjectId for senderId
  let validSenderId;
  if (senderId && mongoose.isValidObjectId(senderId)) {
    validSenderId = new mongoose.Types.ObjectId(senderId);
  } else {
    // If senderId is a username/identity string, look up User by email or username, or generate deterministic/fallback id
    const foundUser = senderId ? await User.findOne({ $or: [{ email: senderId }, { username: senderId }] }).select('_id name') : null;
    validSenderId = foundUser?._id || new mongoose.Types.ObjectId();
  }

  const message = await ChatMessage.create({
    roomId: resolved._id,
    senderId: validSenderId,
    content: content.trim(),
    messageType
  });

  // Increment chatMessageCount on Meeting if exists
  await Meeting.findByIdAndUpdate(resolved._id, { $inc: { chatMessageCount: 1 } }).catch(() => {});

  return {
    id: message._id.toString(),
    roomId: resolved._id.toString(),
    roomName: resolved.name,
    senderId: message.senderId.toString(),
    senderName: senderName || 'Participant',
    content: message.content,
    messageType: message.messageType,
    createdAt: message.createdAt.toISOString()
  };
}

/**
 * Retrieve chronological chat history for a room.
 */
export async function getRecentMessages(room, limit = 50) {
  const resolved = await resolveRoom(room);
  const messages = await ChatMessage.find({ roomId: resolved._id })
    .populate('senderId', 'name username email avatar')
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 50, 1), 200))
    .lean();

  return messages.reverse().map((msg) => ({
    id: msg._id.toString(),
    roomId: resolved._id.toString(),
    roomName: resolved.name,
    senderId: msg.senderId?._id?.toString() || msg.senderId?.toString(),
    senderName: msg.senderId?.name || msg.senderId?.username || 'Participant',
    senderEmail: msg.senderId?.email || '',
    content: msg.content,
    messageType: msg.messageType,
    createdAt: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString()
  }));
}

export default {
  saveChatMessage,
  getRecentMessages
};