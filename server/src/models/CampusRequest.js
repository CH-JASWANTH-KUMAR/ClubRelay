import mongoose from 'mongoose';

const campusRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    universityName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    domain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 120,
    },
    city: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'PROVISIONED'],
      default: 'SUBMITTED',
    },
  },
  {
    timestamps: true,
  }
);

export const CampusRequest = mongoose.model('CampusRequest', campusRequestSchema);

