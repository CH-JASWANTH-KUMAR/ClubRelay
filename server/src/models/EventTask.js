import mongoose from 'mongoose';

const eventTaskSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      required: true,
      index: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'],
      default: 'TODO',
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    prerequisiteTaskIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventTask',
      },
    ],
  },
  {
    timestamps: true,
  }
);

eventTaskSchema.index({ eventId: 1, status: 1 });
eventTaskSchema.index({ clubId: 1, assigneeId: 1, status: 1 });

export const EventTask = mongoose.model('EventTask', eventTaskSchema);
