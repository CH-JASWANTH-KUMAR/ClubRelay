import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      default: null,
      index: true,
    },
    accountType: {
      type: String,
      enum: ['CAMPUS', 'PERSONAL'],
      default: 'CAMPUS',
    },
    pendingCampusDomain: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    lastActiveClubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    campusRole: {
      type: String,
      enum: ['CAMPUS_ADMIN', 'FACULTY_COORDINATOR', 'STUDENT'],
      default: 'STUDENT',
      required: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for uniqueness of email per campus
userSchema.index({ campusId: 1, email: 1 }, { unique: true });

// Password comparison helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash passwords
userSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 12);
};

export const User = mongoose.model('User', userSchema);
