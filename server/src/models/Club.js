import mongoose from 'mongoose';

import { LEGACY_ROLE_PERMISSIONS } from '../constants/permissions.js';

const clubSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus',
      default: null,
      index: true,
    },
    facultyCoordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    workspaceOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      default: '',
      trim: true,
    },
    code: {
      type: String, // e.g. "IEEE", "GDG", "ACM"
      required: true,
      trim: true,
      uppercase: true,
    },
    slug: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ['TECHNICAL', 'CULTURAL', 'ACADEMIC', 'ENTREPRENEURSHIP', 'SOCIAL', 'SPORTS', 'CUSTOM'],
      default: 'TECHNICAL',
      required: true,
    },
    customCategory: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    mission: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    visibility: {
      type: String,
      enum: ['PUBLIC_CAMPUS', 'INVITE_ONLY', 'PRIVATE'],
      default: 'PUBLIC_CAMPUS',
    },
    joinPolicy: {
      type: String,
      enum: ['OPEN', 'REQUEST_APPROVAL', 'INVITE_ONLY'],
      default: 'REQUEST_APPROVAL',
    },
    joinCode: {
      type: String,
      default: '',
      trim: true,
      uppercase: true,
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
      enum: ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PROBATION', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    setupStep: {
      type: Number,
      default: 8,
    },
    templateKey: {
      type: String,
      default: 'custom',
    },
    structureMode: {
      type: String,
      enum: ['LEGACY', 'CUSTOM'],
      default: 'LEGACY',
    },
    activeTermId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      default: null,
    },
    defaultMemberPermissions: {
      type: [String],
      default: () => [...LEGACY_ROLE_PERMISSIONS.GENERAL_MEMBER],
    },
    governance: {
      requireFacultyAdvisor: { type: Boolean, default: false },
      requireApprovalForEvents: { type: Boolean, default: true },
      allowPublicJoinRequests: { type: Boolean, default: true },
      allowSelfSignupWithCode: { type: Boolean, default: true },
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

clubSchema.pre('save', function (next) {
  if (!this.slug && (this.code || this.name)) {
    const base = (this.code || this.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    this.slug = base;
  }
  next();
});

clubSchema.index({ campusId: 1, code: 1 }, { unique: true });
clubSchema.index({ campusId: 1, category: 1 });
clubSchema.index({ joinCode: 1 }, { sparse: true });

export const Club = mongoose.model('Club', clubSchema);
