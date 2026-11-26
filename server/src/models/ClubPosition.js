import mongoose from 'mongoose';

const clubPositionSchema = new mongoose.Schema(
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
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClubDepartment',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    parentPositionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClubPosition',
      default: null,
      index: true,
    },
    isLeadership: {
      type: Boolean,
      default: false,
    },
    maxHolders: {
      type: Number,
      default: null,
      min: 1,
    },
    permissions: {
      type: [String],
      default: [],
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

clubPositionSchema.index({ clubId: 1, slug: 1 }, { unique: true });
clubPositionSchema.index({ clubId: 1, parentPositionId: 1, sortOrder: 1 });

export const ClubPosition = mongoose.model('ClubPosition', clubPositionSchema);

