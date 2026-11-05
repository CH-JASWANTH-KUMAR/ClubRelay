import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
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
    leadOrganizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    eventType: {
      type: String,
      enum: ['WORKSHOP', 'HACKATHON', 'GUEST_LECTURE', 'MEETUP', 'COMPETITION', 'MIXER', 'OTHER'],
      default: 'WORKSHOP',
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PROPOSED', 'APPROVED', 'PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'],
      default: 'DRAFT',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    venueName: {
      type: String,
      default: '',
    },
    venueCapacity: {
      type: Number,
      default: 0,
    },
    estimatedBudget: {
      type: Number,
      default: 0,
    },
    actualBudget: {
      type: Number,
      default: 0,
    },
    expectedAttendance: {
      type: Number,
      default: 0,
    },
    actualAttendance: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String, trim: true }],
    retrospective: {
      summary: { type: String, default: '' },
      whatWentWell: { type: String, default: '' },
      whatCouldImprove: { type: String, default: '' },
      keyMetrics: { type: String, default: '' },
      sponsorSatisfaction: { type: String, default: '' },
      completedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ campusId: 1, clubId: 1, status: 1, startDate: -1 });

export const Event = mongoose.model('Event', eventSchema);
