import { z } from 'zod';
import { Decision, AcademicTerm, AuditLog } from '../models/index.js';

const decisionSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  meetingDate: z.string().optional(),
  attendees: z.array(z.object({ name: z.string(), role: z.string().optional() })).optional(),
  outcome: z.string().optional(),
  actionItems: z
    .array(
      z.object({
        task: z.string(),
        owner: z.string().optional(),
        deadline: z.string().optional(),
      })
    )
    .optional(),
});

export async function listDecisions(req, res, next) {
  try {
    const decisions = await Decision.find({
      clubId: req.params.clubId,
      campusId: req.campusId,
    })
      .populate('recordedById', 'fullName email avatarUrl')
      .populate('academicTermId', 'name')
      .sort({ meetingDate: -1 });

    return res.json({
      success: true,
      data: { decisions },
    });
  } catch (err) {
    next(err);
  }
}

export async function recordDecision(req, res, next) {
  try {
    const data = decisionSchema.parse(req.body);

    const currentTerm = await AcademicTerm.findOne({
      campusId: req.campusId,
      isCurrent: true,
    });

    const decision = await Decision.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      academicTermId: currentTerm ? currentTerm._id : null,
      recordedById: req.user._id,
      title: data.title,
      summary: data.summary,
      meetingDate: data.meetingDate ? new Date(data.meetingDate) : new Date(),
      attendees: data.attendees || [],
      outcome: data.outcome || 'APPROVED',
      actionItems: data.actionItems || [],
    });

    await AuditLog.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      actorId: req.user._id,
      action: 'DECISION_RECORDED',
      targetType: 'Decision',
      targetId: decision._id,
      metadata: { title: decision.title },
    });

    return res.status(201).json({
      success: true,
      data: { decision },
    });
  } catch (err) {
    next(err);
  }
}
