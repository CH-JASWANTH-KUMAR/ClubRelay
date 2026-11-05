import { z } from 'zod';
import { Club, Membership, User, Event, Handover, AcademicTerm } from '../models/index.js';

const createClubSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10).toUpperCase(),
  category: z.enum(['TECHNICAL', 'CULTURAL', 'ACADEMIC', 'ENTREPRENEURSHIP', 'SOCIAL', 'SPORTS']),
  description: z.string().optional(),
  facultyCoordinatorId: z.string().optional(),
  logoUrl: z.string().optional(),
});

const addMemberSchema = z.object({
  email: z.string().email(),
  clubRole: z.enum(['PRESIDENT', 'SECRETARY', 'CORE_TEAM', 'GENERAL_MEMBER']),
  title: z.string().optional(),
});

export async function listClubs(req, res, next) {
  try {
    const filter = { campusId: req.campusId };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const clubs = await Club.find(filter)
      .populate('facultyCoordinatorId', 'fullName email department avatarUrl')
      .sort({ name: 1 });

    return res.json({
      success: true,
      data: { clubs },
    });
  } catch (err) {
    next(err);
  }
}

export async function createClub(req, res, next) {
  try {
    const data = createClubSchema.parse(req.body);

    const club = await Club.create({
      campusId: req.campusId,
      name: data.name,
      code: data.code,
      category: data.category,
      description: data.description || '',
      facultyCoordinatorId: data.facultyCoordinatorId || null,
      logoUrl: data.logoUrl || '',
    });

    return res.status(201).json({
      success: true,
      data: { club },
    });
  } catch (err) {
    next(err);
  }
}

export async function getClub(req, res, next) {
  try {
    const club = await Club.findOne({
      _id: req.params.clubId,
      campusId: req.campusId,
    }).populate('facultyCoordinatorId', 'fullName email department avatarUrl');

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { code: 'CLUB_NOT_FOUND', message: 'Organization not found in this campus workspace.' },
      });
    }

    // Fetch leadership team
    const leadership = await Membership.find({
      clubId: club._id,
      campusId: req.campusId,
      status: 'ACTIVE',
      clubRole: { $in: ['PRESIDENT', 'SECRETARY', 'CORE_TEAM'] },
    }).populate('userId', 'fullName email avatarUrl department');

    const [memberCount, eventCount, latestHandover] = await Promise.all([
      Membership.countDocuments({ clubId: club._id, status: 'ACTIVE' }),
      Event.countDocuments({ clubId: club._id }),
      Handover.findOne({ clubId: club._id })
        .populate('outgoingLeaderId', 'fullName email')
        .populate('incomingLeaderId', 'fullName email')
        .sort({ createdAt: -1 }),
    ]);

    return res.json({
      success: true,
      data: {
        club,
        leadership,
        metrics: {
          memberCount,
          eventCount,
          handoverProgress: latestHandover ? latestHandover.completionPercentage : null,
          latestHandoverStatus: latestHandover ? latestHandover.status : null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMembers(req, res, next) {
  try {
    const members = await Membership.find({
      clubId: req.params.clubId,
      campusId: req.campusId,
      status: 'ACTIVE',
    })
      .populate('userId', 'fullName email avatarUrl department phone')
      .populate('academicTermId', 'name isCurrent')
      .sort({ clubRole: 1, createdAt: 1 });

    return res.json({
      success: true,
      data: { members },
    });
  } catch (err) {
    next(err);
  }
}

export async function addMember(req, res, next) {
  try {
    const data = addMemberSchema.parse(req.body);

    const targetUser = await User.findOne({
      campusId: req.campusId,
      email: data.email.toLowerCase(),
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No registered student found with this email on this campus.',
        },
      });
    }

    // Get current term
    const currentTerm = await AcademicTerm.findOne({
      campusId: req.campusId,
      isCurrent: true,
    });

    const membership = await Membership.findOneAndUpdate(
      {
        campusId: req.campusId,
        clubId: req.params.clubId,
        userId: targetUser._id,
        academicTermId: currentTerm ? currentTerm._id : null,
      },
      {
        clubRole: data.clubRole,
        title: data.title || '',
        status: 'ACTIVE',
      },
      { upsert: true, new: true }
    ).populate('userId', 'fullName email avatarUrl department');

    return res.status(201).json({
      success: true,
      data: { membership },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMemberRole(req, res, next) {
  try {
    const { clubRole, title } = req.body;

    const membership = await Membership.findOneAndUpdate(
      {
        _id: req.params.memberId,
        clubId: req.params.clubId,
        campusId: req.campusId,
      },
      {
        ...(clubRole && { clubRole }),
        ...(title !== undefined && { title }),
      },
      { new: true }
    ).populate('userId', 'fullName email avatarUrl');

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: { code: 'MEMBERSHIP_NOT_FOUND', message: 'Membership not found.' },
      });
    }

    return res.json({
      success: true,
      data: { membership },
    });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req, res, next) {
  try {
    const membership = await Membership.findOneAndUpdate(
      {
        _id: req.params.memberId,
        clubId: req.params.clubId,
        campusId: req.campusId,
      },
      { status: 'REVOKED' },
      { new: true }
    );

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: { code: 'MEMBERSHIP_NOT_FOUND', message: 'Membership not found.' },
      });
    }

    return res.json({
      success: true,
      message: 'Member removed successfully.',
    });
  } catch (err) {
    next(err);
  }
}
