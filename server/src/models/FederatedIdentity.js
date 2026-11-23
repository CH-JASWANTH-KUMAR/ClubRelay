import mongoose from 'mongoose';

const federatedIdentitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['GOOGLE', 'GITHUB'],
      required: true,
    },
    providerUserId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    linkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique indexes:
// 1. A provider + providerUserId uniquely identifies one account link globally
federatedIdentitySchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

// 2. A user can link at most one account per provider (one Google, one GitHub)
federatedIdentitySchema.index({ userId: 1, provider: 1 }, { unique: true });

export const FederatedIdentity = mongoose.model('FederatedIdentity', federatedIdentitySchema);

