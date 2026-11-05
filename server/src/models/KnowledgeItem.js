import mongoose from 'mongoose';

const knowledgeItemSchema = new mongoose.Schema(
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
    academicTermId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['SOP', 'EVENT_PLAYBOOK', 'PROCESS', 'LESSONS_LEARNED', 'BUDGET_GUIDE', 'VENUE_INTEL', 'SPONSOR_PITCH'],
      default: 'SOP',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [{ type: String, trim: true }],
    version: {
      type: Number,
      default: 1,
    },
    revisionHistory: [
      {
        version: { type: Number, required: true },
        editedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now },
        changeSummary: { type: String, default: '' },
        previousContent: { type: String, default: '' },
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeItemSchema.index({ clubId: 1, category: 1, isArchived: 1 });
knowledgeItemSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const KnowledgeItem = mongoose.model('KnowledgeItem', knowledgeItemSchema);
