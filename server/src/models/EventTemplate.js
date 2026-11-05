import mongoose from 'mongoose';

const eventTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['WORKSHOP', 'HACKATHON', 'GUEST_LECTURE', 'MEETUP', 'COMPETITION', 'MIXER'],
      required: true,
    },
    defaultDescription: {
      type: String,
      default: '',
    },
    defaultTasks: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
        leadDaysBefore: { type: Number, default: 7 }, // offset before event start
      },
    ],
    recommendedBudgetTier: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    isSystemTemplate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const EventTemplate = mongoose.model('EventTemplate', eventTemplateSchema);
