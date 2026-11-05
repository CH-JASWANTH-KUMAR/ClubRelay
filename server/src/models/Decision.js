import mongoose from 'mongoose';

const decisionSchema = new mongoose.Schema(
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
    academicTermId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      required: true,
      index: true,
    },
    recordedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    meetingDate: {
      type: Date,
      default: Date.now,
    },
    attendees: [
      {
        name: { type: String, required: true },
        role: { type: String, default: '' },
      },
    ],
    outcome: {
      type: String,
      default: 'APPROVED', // APPROVED, RATIFIED, DEFERRED
    },
    actionItems: [
      {
        task: { type: String, required: true },
        owner: { type: String, default: '' },
        deadline: { type: Date, default: null },
      },
    ],
  },
  {
    timestamps: true,
  }
);

decisionSchema.index({ clubId: 1, meetingDate: -1 });

export const Decision = mongoose.model('Decision', decisionSchema);
