import mongoose from 'mongoose';

const handoverSchema = new mongoose.Schema(
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
    fromTermId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      required: true,
    },
    toTermId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicTerm',
      required: true,
    },
    outgoingLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    incomingLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roleHandover: {
      type: String,
      enum: ['PRESIDENT', 'SECRETARY', 'CORE_LEAD'],
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'IN_REVIEW', 'ACKNOWLEDGED', 'COMPLETED'],
      default: 'DRAFT',
      required: true,
      index: true,
    },
    // The 8 structured handover sections
    sections: {
      roleResponsibilities: {
        content: { type: String, default: '' },
        completed: { type: Boolean, default: false },
      },
      outstandingTasks: {
        content: { type: String, default: '' },
        taskList: [{ task: String, status: String, deadline: String }],
        completed: { type: Boolean, default: false },
      },
      pendingCommitments: {
        content: { type: String, default: '' },
        commitments: [{ title: String, party: String, notes: String }],
        completed: { type: Boolean, default: false },
      },
      futureEventSchedules: {
        content: { type: String, default: '' },
        schedules: [{ eventTitle: String, tentativeDate: String, venue: String }],
        completed: { type: Boolean, default: false },
      },
      importantDocuments: {
        content: { type: String, default: '' },
        links: [{ label: String, url: String, description: String }],
        completed: { type: Boolean, default: false },
      },
      contactsAndPartners: {
        content: { type: String, default: '' },
        contactIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
        completed: { type: Boolean, default: false },
      },
      reusablePlaybooks: {
        content: { type: String, default: '' },
        playbookIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeItem' }],
        completed: { type: Boolean, default: false },
      },
      recommendationsAndAdvice: {
        content: { type: String, default: '' },
        completed: { type: Boolean, default: false },
      },
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to recalculate completion percentage
handoverSchema.methods.calculateCompletion = function () {
  const sectionKeys = [
    'roleResponsibilities',
    'outstandingTasks',
    'pendingCommitments',
    'futureEventSchedules',
    'importantDocuments',
    'contactsAndPartners',
    'reusablePlaybooks',
    'recommendationsAndAdvice',
  ];
  let completedCount = 0;
  sectionKeys.forEach((key) => {
    if (this.sections && this.sections[key] && this.sections[key].completed) {
      completedCount++;
    }
  });
  this.completionPercentage = Math.round((completedCount / sectionKeys.length) * 100);
  return this.completionPercentage;
};

handoverSchema.index({ clubId: 1, status: 1 });

export const Handover = mongoose.model('Handover', handoverSchema);
