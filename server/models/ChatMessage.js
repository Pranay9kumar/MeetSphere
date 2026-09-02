import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 4000
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  }
}, {
  timestamps: true
});

ChatMessageSchema.index({ roomId: 1, createdAt: 1 });
ChatMessageSchema.index({ senderId: 1, createdAt: -1 });

export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);