import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
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
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    decision: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'MODIFICATIONS_REQUESTED', 'REJECTED'],
      default: 'PENDING',
      required: true,
      index: true,
    },
    comments: {
      type: String,
      default: '',
    },
    decidedAt: {
      type: Date,
      default: Date.now,
    },
    revisionNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

approvalSchema.index({ campusId: 1, decision: 1, decidedAt: -1 });

export const Approval = mongoose.model('Approval', approvalSchema);
