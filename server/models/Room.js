import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    index: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  participants: {
    type: [ParticipantSchema],
    default: []
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  scheduledStart: {
    type: Date,
    required: true
  },
  scheduledEnd: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

RoomSchema.index({ workspaceId: 1, scheduledStart: 1 });

RoomSchema.methods.getActiveParticipants = function () {
  return this.participants.filter((participant) => participant.isActive && !participant.leftAt);
};

RoomSchema.methods.isParticipantActive = function (userId) {
  return this.getActiveParticipants().some(
    (participant) => participant.userId.toString() === userId.toString()
  );
};

RoomSchema.methods.isHost = function (userId) {
  return this.hostId.toString() === userId.toString();
};

RoomSchema.methods.getHost = function () {
  return this.hostId;
};

RoomSchema.methods.getScheduledStart = function () {
  return this.scheduledStart;
};

RoomSchema.methods.getScheduledEnd = function () {
  return this.scheduledEnd;
};

RoomSchema.methods.hasStarted = function (at = new Date()) {
  return at >= this.scheduledStart;
};

RoomSchema.methods.hasEnded = function (at = new Date()) {
  return at >= this.scheduledEnd;
};

RoomSchema.pre('validate', function (next) {
  if (this.scheduledStart && this.scheduledEnd && this.scheduledEnd < this.scheduledStart) {
    this.invalidate('scheduledEnd', 'scheduledEnd must be after scheduledStart');
  }
  next();
});

export const Room = mongoose.model('Room', RoomSchema);