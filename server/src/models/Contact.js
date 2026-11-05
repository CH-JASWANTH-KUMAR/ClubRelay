import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
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
    contactType: {
      type: String,
      enum: ['SPONSOR', 'VENDOR', 'SPEAKER', 'MENTOR'],
      required: true,
      index: true,
    },
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    primaryContactName: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
    },
    servicesOffered: {
      type: String,
      default: '',
    },
    pricingNotes: {
      type: String,
      default: '',
    },
    leadTimeDays: {
      type: Number,
      default: 7,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

contactSchema.index({ clubId: 1, contactType: 1 });

export const Contact = mongoose.model('Contact', contactSchema);
