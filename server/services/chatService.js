import mongoose from 'mongoose';
import { ChatMessage } from '../models/ChatMessage.js';
import { Room } from '../models/Room.js';

function serviceError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function resolveRoom(room) {
  if (!room || typeof room !== 'string') {
    throw serviceError('A room is required');
  }

  const query = mongoose.isValidObjectId(room)
    ? { _id: room }
    : { name: room };
  const resolvedRoom = await Room.findOne(query).select('_id name');
  if (!resolvedRoom) throw serviceError('Room not found', 404);
  return resolvedRoom;
}

export async function saveChatMessage({ room, senderId, content, messageType = 'text' }) {
  if (!mongoose.isValidObjectId(senderId)) {
    throw serviceError('Invalid sender identity');
  }
  if (typeof content !== 'string' || !content.trim()) {
    throw serviceError('Message content is required');
  }
  if (content.trim().length > 4000) {
    throw serviceError('Message content exceeds 4000 characters');
  }
  if (!['text', 'system'].includes(messageType)) {
    throw serviceError('Invalid message type');
  }

  const resolvedRoom = await resolveRoom(room);
  const message = await ChatMessage.create({
    roomId: resolvedRoom._id,
    senderId,
    content: content.trim(),
    messageType
  });

  return {
    id: message._id.toString(),
    room: resolvedRoom.name,
    senderId: message.senderId.toString(),
    content: message.content,
    messageType: message.messageType,
    createdAt: message.createdAt.toISOString()
  };
}

export async function getRecentMessages(room, limit = 20) {
  const resolvedRoom = await resolveRoom(room);
  const messages = await ChatMessage.find({ roomId: resolvedRoom._id })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 20, 1), 100))
    .lean();

  return messages.reverse().map((message) => ({
    id: message._id.toString(),
    room: resolvedRoom.name,
    senderId: message.senderId.toString(),
    content: message.content,
    messageType: message.messageType,
    createdAt: message.createdAt.toISOString()
  }));
}