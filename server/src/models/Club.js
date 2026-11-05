import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      required: true,
      index: true,
    },
    facultyCoordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String, // e.g. "IEEE", "GDG", "ACM"
      required: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      enum: ['TECHNICAL', 'CULTURAL', 'ACADEMIC', 'ENTREPRENEURSHIP', 'SOCIAL', 'SPORTS'],
      default: 'TECHNICAL',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PROBATION', 'INACTIVE'],
      default: 'ACTIVE',
    },
    establishedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

clubSchema.index({ campusId: 1, code: 1 }, { unique: true });
clubSchema.index({ campusId: 1, category: 1 });

export const Club = mongoose.model('Club', clubSchema);
