import mongoose from 'mongoose';

const clubMembershipSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['INVITED', 'ACTIVE', 'SUSPENDED', 'LEFT'],
      default: 'ACTIVE',
      required: true,
      index: true,
    },
    membershipType: {
      type: String,
      enum: ['REGULAR', 'ALUMNI', 'ADVISOR'],
      default: 'REGULAR',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    suspensionReason: {
      type: String,
      default: '',
    },
    leftAt: {
      type: Date,
      default: null,
    },
    invitedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    legacyRole: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

clubMembershipSchema.index({ clubId: 1, userId: 1 }, { unique: true });
clubMembershipSchema.index({ userId: 1, status: 1 });

export const ClubMembership = mongoose.model('ClubMembership', clubMembershipSchema);

