import mongoose from 'mongoose';

const academicTermSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      required: true,
      index: true,
    },
    name: {
      type: String, // e.g. "2025-2026", "Fall 2025"
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

academicTermSchema.index({ campusId: 1, name: 1 }, { unique: true });

export const AcademicTerm = mongoose.model('AcademicTerm', academicTermSchema);
