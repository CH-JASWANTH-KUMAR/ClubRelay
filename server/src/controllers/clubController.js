import mongoose from 'mongoose';
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
  academicTermId: z.string().optional(),
});

export async function listClubs(req, res, next) {
  try {
    const filter = { campusId: req.campusId };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const clubs = await Club.find(filter)
      .populate('facultyCoordinatorId', 'fullName department avatarUrl')
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
    }).populate('facultyCoordinatorId', 'fullName department avatarUrl email');

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { code: 'CLUB_NOT_FOUND', message: 'Organization not found in this campus workspace.' },
      });
    }

    // Role check: Campus Admin, explicitly assigned Faculty Coordinator, or active Club Member
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';
    const isAssignedFaculty =
      req.user.campusRole === 'FACULTY_COORDINATOR' &&
      club.facultyCoordinatorId &&
      (club.facultyCoordinatorId._id || club.facultyCoordinatorId).toString() === req.user._id.toString();

    let isMember = false;
    if (!isCampusAdmin && !isAssignedFaculty) {
      const membership = await Membership.findOne({
        campusId: req.campusId,
        clubId: club._id,
        userId: req.user._id,
        status: 'ACTIVE',
      });
      isMember = !!membership;
    }

    const isAuthorized = isCampusAdmin || isAssignedFaculty || isMember;

    // Fetch leadership team
    const leadershipQuery = Membership.find({
      clubId: club._id,
      campusId: req.campusId,
      status: 'ACTIVE',
      clubRole: { $in: ['PRESIDENT', 'SECRETARY', 'CORE_TEAM'] },
    });

    if (isAuthorized) {
      leadershipQuery.populate('userId', 'fullName email avatarUrl department');
    } else {
      // Do not expose member emails, phone numbers, or private contact details to unrelated campus users
      leadershipQuery.populate('userId', 'fullName avatarUrl department');
    }

    const [leadership, memberCount, eventCount, latestHandover] = await Promise.all([
      leadershipQuery,
      Membership.countDocuments({ clubId: club._id, status: 'ACTIVE' }),
      Event.countDocuments({ clubId: club._id }),
      isAuthorized
        ? Handover.findOne({ clubId: club._id })
            .populate('outgoingLeaderId', 'fullName email')
            .populate('incomingLeaderId', 'fullName email')
            .sort({ createdAt: -1 })
        : null,
    ]);

    // Sanitize club object if not authorized: strip sensitive contact details
    const sanitizedClub = club.toObject();
    if (!isAuthorized && sanitizedClub.facultyCoordinatorId) {
      delete sanitizedClub.facultyCoordinatorId.email;
      delete sanitizedClub.facultyCoordinatorId.phone;
    }

    const metrics = {
      memberCount,
      eventCount,
      // Private handover information is strictly reserved for authorized members, assigned faculty, and campus admins
      handoverProgress: isAuthorized && latestHandover ? latestHandover.completionPercentage : null,
      latestHandoverStatus: isAuthorized && latestHandover ? latestHandover.status : null,
    };

    return res.json({
      success: true,
      data: {
        club: sanitizedClub,
        leadership,
        metrics,
        isAuthorized,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMembers(req, res, next) {
  try {
    const isExecutiveOrAdmin =
      req.user.campusRole === 'CAMPUS_ADMIN' ||
      ['PRESIDENT', 'SECRETARY'].includes(req.userClubRole);

    const selectFields = isExecutiveOrAdmin
      ? 'fullName email avatarUrl department phone'
      : 'fullName email avatarUrl department'; // Protect student phone numbers from general members

    const filter = {
      clubId: req.params.clubId,
      campusId: req.campusId,
      status: 'ACTIVE',
    };

    if (req.query.academicTermId) {
      filter.academicTermId = req.query.academicTermId;
    }

    const members = await Membership.find(filter)
      .populate('userId', selectFields)
      .populate('academicTermId', 'name isCurrent startDate endDate')
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

    let targetTerm;
    if (data.academicTermId) {
      if (!mongoose.Types.ObjectId.isValid(data.academicTermId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ACADEMIC_TERM',
            message: 'Academic term ID must be a valid identifier.',
          },
        });
      }

      targetTerm = await AcademicTerm.findOne({
        _id: data.academicTermId,
        campusId: req.campusId,
      });

      if (!targetTerm) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ACADEMIC_TERM_NOT_FOUND',
            message: 'The selected academic term does not exist on this campus.',
          },
        });
      }
    } else {
      targetTerm = await AcademicTerm.findOne({
        campusId: req.campusId,
        isCurrent: true,
      });

      if (!targetTerm) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_CURRENT_TERM',
            message: 'No active academic term configured for this campus.',
          },
        });
      }
    }

    // Check existing membership for this specific term
    const existingMembership = await Membership.findOne({
      campusId: req.campusId,
      clubId: req.params.clubId,
      userId: targetUser._id,
      academicTermId: targetTerm._id,
    });

    if (existingMembership) {
      if (existingMembership.status === 'ACTIVE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MEMBERSHIP_ALREADY_EXISTS',
            message: 'This user already holds an active membership for the selected academic term.',
          },
        });
      }

      // Reactivate previously inactive/revoked membership for this specific term
      existingMembership.status = 'ACTIVE';
      existingMembership.clubRole = data.clubRole;
      existingMembership.title = data.title || '';
      await existingMembership.save();

      const populated = await Membership.findById(existingMembership._id)
        .populate('userId', 'fullName email avatarUrl department phone')
        .populate('academicTermId', 'name isCurrent');

      return res.status(200).json({
        success: true,
        data: { membership: populated },
      });
    }

    const membership = await Membership.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      userId: targetUser._id,
      academicTermId: targetTerm._id,
      clubRole: data.clubRole,
      title: data.title || '',
      status: 'ACTIVE',
    });

    const populated = await Membership.findById(membership._id)
      .populate('userId', 'fullName email avatarUrl department phone')
      .populate('academicTermId', 'name isCurrent');

    return res.status(201).json({
      success: true,
      data: { membership: populated },
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
