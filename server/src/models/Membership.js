import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema(
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    academicTermId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      required: true,
      index: true,
    },
    clubRole: {
      type: String,
      enum: ['PRESIDENT', 'SECRETARY', 'CORE_TEAM', 'GENERAL_MEMBER'],
      default: 'GENERAL_MEMBER',
      required: true,
    },
    title: {
      type: String, // e.g. "Lead Organizer", "PR Coordinator", "Technical Head"
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAST', 'INVITED', 'REVOKED'],
      default: 'ACTIVE',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One active membership per user per club per academic term
membershipSchema.index({ campusId: 1, clubId: 1, userId: 1, academicTermId: 1 }, { unique: true });
membershipSchema.index({ clubId: 1, clubRole: 1, status: 1 });

export const Membership = mongoose.model('Membership', membershipSchema);
