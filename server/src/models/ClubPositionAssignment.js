import mongoose from 'mongoose';

const clubPositionAssignmentSchema = new mongoose.Schema(
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
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClubMembership',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClubPosition',
      required: true,
      index: true,
    },
    academicTermId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      default: null,
      index: true,
    },
    termLabel: {
      type: String,
      default: '',
      trim: true,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ENDED', 'REVOKED'],
      default: 'ACTIVE',
      required: true,
      index: true,
    },
    assignedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    endedReason: {
      type: String,
      default: '',
    },
    handoverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Handover',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

clubPositionAssignmentSchema.index({ clubId: 1, userId: 1, status: 1 });
clubPositionAssignmentSchema.index({ clubId: 1, positionId: 1, status: 1 });
clubPositionAssignmentSchema.index({ clubId: 1, academicTermId: 1, status: 1 });

export const ClubPositionAssignment = mongoose.model(
  'ClubPositionAssignment',
  clubPositionAssignmentSchema
);

