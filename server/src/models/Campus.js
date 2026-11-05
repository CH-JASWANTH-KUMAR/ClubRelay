import mongoose from 'mongoose';

const campusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      default: '',
    },
    settings: {
      allowSelfRegistration: { type: Boolean, default: true },
      requireFacultyApprovalForEvents: { type: Boolean, default: true },
      defaultAcademicYear: { type: String, default: '2025-2026' },
    },
  },
  {
    timestamps: true,
  }
);

export const Campus = mongoose.model('Campus', campusSchema);
