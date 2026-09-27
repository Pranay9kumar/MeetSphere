import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'inactive'
  },
  description: {
    type: String,
    default: ''
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  durationMinutes: {
    type: Number,
    default: 30,
    min: 5,
    max: 1440
  },
  recordings: [{
    egressId: { type: String },
    fileUrl: { type: String, required: true },
    targetEmail: { type: String },
    recordedAt: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 }
  }],
  chatMessageCount: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    joinedAt: Date,
    leftAt: Date
  }]
}, {
  timestamps: true
});

export const Meeting = mongoose.model('Meeting', MeetingSchema);
