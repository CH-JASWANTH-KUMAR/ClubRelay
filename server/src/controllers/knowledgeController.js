import { z } from 'zod';
import { KnowledgeItem, AcademicTerm, AuditLog } from '../models/index.js';

const createKnowledgeSchema = z.object({
  title: z.string().min(3),
  category: z.enum([
    'SOP',
    'EVENT_PLAYBOOK',
    'PROCESS',
    'LESSONS_LEARNED',
    'BUDGET_GUIDE',
    'VENUE_INTEL',
    'SPONSOR_PITCH',
  ]),
  content: z.string().min(10),
  tags: z.array(z.string()).optional(),
});

const updateKnowledgeSchema = z.object({
  title: z.string().optional(),
  category: z.string().optional(),
  content: z.string().min(10),
  tags: z.array(z.string()).optional(),
  changeSummary: z.string().min(3),
});

export async function listKnowledge(req, res, next) {
  try {
    const filter = {
      clubId: req.params.clubId,
      campusId: req.campusId,
      isArchived: false,
    };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }];
    }

    const items = await KnowledgeItem.find(filter)
      .populate('authorId', 'fullName email avatarUrl')
      .populate('academicTermId', 'name')
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      data: { items },
    });
  } catch (err) {
    next(err);
  }
}

export async function createKnowledge(req, res, next) {
  try {
    const data = createKnowledgeSchema.parse(req.body);

    const currentTerm = await AcademicTerm.findOne({
      campusId: req.campusId,
      isCurrent: true,
    });

    const item = await KnowledgeItem.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      academicTermId: currentTerm ? currentTerm._id : null,
      authorId: req.user._id,
      title: data.title,
      category: data.category,
      content: data.content,
      tags: data.tags || [],
      version: 1,
      revisionHistory: [
        {
          version: 1,
          editedById: req.user._id,
          changeSummary: 'Initial document creation',
          previousContent: '',
        },
      ],
    });

    await AuditLog.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      actorId: req.user._id,
      action: 'KNOWLEDGE_CREATED',
      targetType: 'KnowledgeItem',
      targetId: item._id,
      metadata: { title: item.title, category: item.category },
    });

    return res.status(201).json({
      success: true,
      data: { item },
    });
  } catch (err) {
    next(err);
  }
}

export async function getKnowledge(req, res, next) {
  try {
    const item = await KnowledgeItem.findOne({
      _id: req.params.id,
      campusId: req.campusId,
      clubId: req.params.clubId,
    })
      .populate('authorId', 'fullName email avatarUrl department')
      .populate('academicTermId', 'name')
      .populate('revisionHistory.editedById', 'fullName email');

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Knowledge item not found.' },
      });
    }

    return res.json({
      success: true,
      data: { item },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateKnowledge(req, res, next) {
  try {
    const data = updateKnowledgeSchema.parse(req.body);

    const item = await KnowledgeItem.findOne({
      _id: req.params.id,
      campusId: req.campusId,
      clubId: req.params.clubId,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Knowledge item not found.' },
      });
    }

    // Push current content to revision history
    item.revisionHistory.push({
      version: item.version,
      editedById: req.user._id,
      editedAt: new Date(),
      changeSummary: data.changeSummary,
      previousContent: item.content,
    });

    item.version += 1;
    item.content = data.content;
    if (data.title) item.title = data.title;
    if (data.category) item.category = data.category;
    if (data.tags) item.tags = data.tags;

    await item.save();

    await AuditLog.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      actorId: req.user._id,
      action: 'KNOWLEDGE_UPDATED',
      targetType: 'KnowledgeItem',
      targetId: item._id,
      metadata: { version: item.version, changeSummary: data.changeSummary },
    });

    return res.json({
      success: true,
      data: { item },
      message: `Updated to version ${item.version}.`,
    });
  } catch (err) {
    next(err);
  }
}
