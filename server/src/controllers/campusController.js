import { Campus, Club, AcademicTerm, Event, Approval, Handover } from '../models/index.js';
import { findCampusesByDomain } from '../utils/campusDomain.js';

export async function resolveCampusByDomain(req, res, next) {
  try {
    const rawDomain = typeof req.query.domain === 'string' ? req.query.domain.trim().toLowerCase() : '';
    if (!rawDomain) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DOMAIN', message: 'Domain query parameter is required.' },
      });
    }

    const campuses = await findCampusesByDomain(rawDomain, '_id name');
    if (campuses.length !== 1) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAMPUS_NOT_FOUND', message: 'Campus not found for this domain.' },
      });
    }

    return res.json({
      success: true,
      data: {
        campus: {
          id: campuses[0]._id,
          name: campuses[0].name,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listCampuses(req, res, next) {
  try {
    const campuses = await Campus.find().sort({ name: 1 });
    return res.json({
      success: true,
      data: { campuses },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCampusDetails(req, res, next) {
  try {
    const campus = await Campus.findById(req.params.campusId);
    if (!campus) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAMPUS_NOT_FOUND', message: 'Campus not found' },
      });
    }

    const terms = await AcademicTerm.find({ campusId: campus._id }).sort({ startDate: -1 });

    return res.json({
      success: true,
      data: { campus, terms },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCampusStats(req, res, next) {
  try {
    const campusId = req.params.campusId || req.campusId;

    if (req.campusId && campusId.toString() !== req.campusId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_MISMATCH',
          message: 'Access denied: You cannot view workspace metrics for another campus.',
        },
      });
    }

    const facultyFields =
      req.user?.campusRole === 'CAMPUS_ADMIN' ? 'fullName email department' : 'fullName department';

    const [activeClubsCount, totalEvents, pendingApprovalsCount, activeHandoversCount, clubs] =
      await Promise.all([
        Club.countDocuments({ campusId, status: 'ACTIVE' }),
        Event.countDocuments({ campusId }),
        Approval.countDocuments({ campusId, decision: 'PENDING' }),
        Handover.countDocuments({ campusId, status: { $in: ['DRAFT', 'IN_REVIEW'] } }),
        Club.find({ campusId, status: 'ACTIVE' })
          .populate('facultyCoordinatorId', facultyFields)
          .sort({ name: 1 }),
      ]);

    return res.json({
      success: true,
      data: {
        stats: {
          activeClubsCount,
          totalEvents,
          pendingApprovalsCount,
          activeHandoversCount,
        },
        clubs,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listTerms(req, res, next) {
  try {
    const campusId = req.params.campusId || req.campusId;

    if (req.campusId && campusId.toString() !== req.campusId.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_MISMATCH',
          message: 'Access denied: You cannot view terms for another campus workspace.',
        },
      });
    }

    const terms = await AcademicTerm.find({ campusId }).sort({ startDate: -1 });
    return res.json({
      success: true,
      data: { terms },
    });
  } catch (err) {
    next(err);
  }
}
