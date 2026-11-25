import mongoose from 'mongoose';

const clubJoinRequestSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      default: null,
      index: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: '',
      maxlength: 500,
    },
    preferredPositionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClubPosition',
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
      required: true,
      index: true,
    },
    reviewedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

clubJoinRequestSchema.index({ clubId: 1, userId: 1, status: 1 });

export const ClubJoinRequest = mongoose.model('ClubJoinRequest', clubJoinRequestSchema);

