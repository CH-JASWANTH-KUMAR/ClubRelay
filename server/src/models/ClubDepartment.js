import mongoose from 'mongoose';

const clubDepartmentSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      default: '',
      maxlength: 400,
    },
    color: {
      type: String,
      default: '#315BDB',
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

clubDepartmentSchema.index({ clubId: 1, name: 1 }, { unique: true });

export const ClubDepartment = mongoose.model('ClubDepartment', clubDepartmentSchema);

