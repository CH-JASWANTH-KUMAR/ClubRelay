import { Event, Club, Membership, Handover, Contact, KnowledgeItem } from '../models/index.js';

export async function getAnnualReport(req, res, next) {
  try {
    const clubId = req.params.clubId;
    const campusId = req.campusId;

    const club = await Club.findOne({ _id: clubId, campusId })
      .populate('facultyCoordinatorId', 'fullName email department');

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Club not found.' },
      });
    }

    const [events, members, contacts, knowledgeCount, handovers] = await Promise.all([
      Event.find({ clubId, campusId }).sort({ startDate: 1 }),
      Membership.find({ clubId, campusId, status: 'ACTIVE' }).populate('userId', 'fullName email'),
      Contact.find({ clubId, campusId }),
      KnowledgeItem.countDocuments({ clubId, campusId, isArchived: false }),
      Handover.find({ clubId, campusId }).sort({ createdAt: -1 }),
    ]);

    // Compute metrics
    const completedEvents = events.filter((e) => e.status === 'COMPLETED');
    const totalAttendees = completedEvents.reduce((acc, curr) => acc + (curr.actualAttendance || 0), 0);
    const totalAllocatedBudget = events.reduce((acc, curr) => acc + (curr.estimatedBudget || 0), 0);
    const totalActualBudget = completedEvents.reduce((acc, curr) => acc + (curr.actualBudget || 0), 0);

    const latestHandover = handovers[0] || null;

    return res.json({
      success: true,
      data: {
        club,
        academicYear: '2025-2026',
        summary: {
          totalEventsPlanned: events.length,
          eventsCompleted: completedEvents.length,
          totalAttendeesReached: totalAttendees,
          totalAllocatedBudget,
          totalActualBudget,
          activeRosterCount: members.length,
          sponsorVendorContactsCount: contacts.length,
          preservedKnowledgeDocsCount: knowledgeCount,
          handoverCompletionPercentage: latestHandover ? latestHandover.completionPercentage : 0,
          handoverStatus: latestHandover ? latestHandover.status : 'NOT_INITIATED',
        },
        events,
        members,
        contacts,
        latestHandover,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function exportCsv(req, res, next) {
  try {
    const clubId = req.params.clubId;
    const campusId = req.campusId;

    const events = await Event.find({ clubId, campusId }).sort({ startDate: 1 });

    const headers = [
      'Event Title',
      'Event Type',
      'Status',
      'Start Date',
      'End Date',
      'Venue',
      'Expected Attendance',
      'Actual Attendance',
      'Estimated Budget ($)',
      'Actual Budget ($)',
    ];

    const rows = events.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.eventType,
      e.status,
      e.startDate.toISOString().split('T')[0],
      e.endDate.toISOString().split('T')[0],
      `"${(e.venueName || '').replace(/"/g, '""')}"`,
      e.expectedAttendance || 0,
      e.actualAttendance || 0,
      e.estimatedBudget || 0,
      e.actualBudget || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="clubrelay-annual-report-${clubId}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    next(err);
  }
}
