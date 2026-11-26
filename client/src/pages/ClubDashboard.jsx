import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Avatar } from '../components/ui/EmptyState';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  Calendar,
  CheckSquare,
  ArrowRightLeft,
  Users,
  BookOpen,
  ArrowRight,
  Tag,
} from 'lucide-react';

export function ClubDashboard() {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [clubData, setClubData] = useState(null);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.dash-widget'), {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 350,
        delay: (el, i) => i * 35,
        ease: 'easeOutQuad',
      });
    },
    [loading]
  );

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [clubRes, eventsRes, tasksRes] = await Promise.all([
          fetch(`/api/v1/clubs/${clubId}`),
          fetch(`/api/v1/clubs/${clubId}/events`),
          fetch(`/api/v1/tasks/my-work?clubId=${clubId}`),
        ]);

        if (clubRes.ok) {
          const json = await clubRes.json();
          setClubData(json.data);
        }
        if (eventsRes.ok) {
          const json = await eventsRes.json();
          setEvents(json.data?.events || []);
        }
        if (tasksRes.ok) {
          const json = await tasksRes.json();
          setTasks(json.data?.tasks || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (clubId) {
      fetchDashboard();
    }
  }, [clubId]);

  const club = clubData?.club;
  const metrics = clubData?.metrics;
  const leadership = clubData?.leadership || [];

  const upcomingEvents = events.filter((e) =>
    ['PLANNING', 'APPROVED', 'PROPOSED'].includes(e.status)
  );
  const completedEvents = events.filter((e) => e.status === 'COMPLETED');

  // Engineering Community Tags based on category
  const defaultTags =
    club?.category === 'TECHNICAL'
      ? ['Open Source', 'Software Eng', 'Workshops', 'Hackathons']
      : club?.category === 'CULTURAL'
      ? ['Arts & Music', 'Stage', 'Exhibitions', 'Campus Life']
      : club?.category === 'ACADEMIC'
      ? ['Research', 'Seminars', 'Peer Tutoring', 'Publications']
      : ['Student Leadership', 'Operations', 'Community Outreach'];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Organization Header & Community Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border shadow-subtle">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white font-extrabold text-xl flex items-center justify-center shadow-subtle flex-shrink-0">
            {club?.code || 'CR'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-ink tracking-tight">
                {club?.name || 'Organization Workspace'}
              </h2>
              <Badge variant="approved" size="sm">
                {club?.category === 'CUSTOM' ? club?.customCategory || 'Custom' : club?.category || 'General'}
              </Badge>
              <Badge variant="default" size="sm">
                Term: {club?.activeTermId?.name || 'Active Term'}
              </Badge>
              {(clubData?.userAccess?.positions || []).map((pos) => (
                <Badge key={pos.positionId} variant="planning" size="sm">
                  {pos.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-charcoal-600 mt-1 max-w-2xl">
              {club?.mission || club?.description || 'Active student organization workspace and institutional continuity hub.'}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Tag className="w-3 h-3 text-charcoal-400" />
              {defaultTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium bg-subtle text-charcoal-600 px-2 py-0.5 rounded border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          {clubData?.userAccess?.capabilities?.includes('club.manage_structure') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/clubs/${clubId}/structure`)}
            >
              Structure & Roles
            </Button>
          )}
          {(clubData?.userAccess?.capabilities?.includes('handover.view') ||
            clubData?.userAccess?.capabilities?.includes('handover.manage_own') ||
            clubData?.userAccess?.capabilities?.includes('handover.manage_all')) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/clubs/${clubId}/handover`)}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Handover
            </Button>
          )}
          {clubData?.userAccess?.capabilities?.includes('events.create') && (
            <Button size="sm" onClick={() => navigate(`/clubs/${clubId}/events`)}>
              <Calendar className="w-3.5 h-3.5" /> Manage Events
            </Button>
          )}
        </div>
      </div>

      {/* Succession Alert Widget (Core Differentiator Banner) */}
      <Card className="dash-widget bg-gradient-to-r from-brand-50/80 via-canvas to-surface border-brand-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <h4 className="font-heading text-sm font-bold text-brand-900">
                Annual Leadership Transition Health
              </h4>
            </div>
            <p className="text-xs text-mutedSlate max-w-2xl">
              Preserve institutional memory before outgoing board members step down. Section-by-section
              knowledge, playbooks, vendor notes, and digital sign-off.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <span className="text-xs font-semibold text-charcoal-900">
                {metrics?.handoverProgress !== null && metrics?.handoverProgress !== undefined
                  ? `${metrics?.handoverProgress}% Ready`
                  : 'Not Initiated'}
              </span>
              <div className="w-32 mt-1">
                <Progress value={metrics?.handoverProgress || 0} />
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/clubs/${clubId}/handover`)}
            >
              Open Handover
            </Button>
          </div>
        </div>
      </Card>

      {/* Primary 3-Column Operational Flight Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Events & Open Tasks (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events Flight Deck */}
          <Card className="dash-widget">
            <CardHeader
              title="Scheduled Events Flight Deck"
              subtitle="Events in preparation or awaiting review for the current term"
              action={
                <Link
                  to={`/clubs/${clubId}/events`}
                  className="text-xs font-semibold text-forest-700 hover:underline flex items-center gap-1"
                >
                  View all ({events.length}) <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-charcoal-400 text-xs">
                No active upcoming events scheduled. Create a new event to begin planning.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/clubs/${clubId}/events/${event._id}`)}
                    className="p-3.5 rounded-lg border border-border bg-surface hover:border-forest-600 hover:shadow-subtle transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal-900 hover:text-forest-700">
                          {event.title}
                        </span>
                        <Badge
                          variant={
                            event.status === 'APPROVED'
                              ? 'approved'
                              : event.status === 'PROPOSED'
                              ? 'proposed'
                              : 'planning'
                          }
                          size="sm"
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-charcoal-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-forest-700" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <span>{event.venueName || 'Venue TBD'}</span>
                        <span>·</span>
                        <span>Budget: ${event.estimatedBudget}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar
                        name={event.leadOrganizerId?.fullName || 'Lead'}
                        size="sm"
                        src={event.leadOrganizerId?.avatarUrl}
                      />
                      <ArrowRight className="w-4 h-4 text-charcoal-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Open Organization Tasks Widget */}
          <Card className="dash-widget">
            <CardHeader
              title={`Open Organization Tasks (${tasks.length})`}
              subtitle="Action items assigned across current events and club milestones"
              action={
                <Link
                  to="/my-work"
                  className="text-xs font-semibold text-forest-700 hover:underline flex items-center gap-1"
                >
                  My Work Board <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />

            {tasks.length === 0 ? (
              <div className="text-center py-6 text-charcoal-400 text-xs">
                No active tasks assigned for this organization.
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 4).map((task) => (
                  <div
                    key={task._id}
                    onClick={() => navigate('/my-work')}
                    className="p-2.5 rounded border border-border bg-surface hover:bg-subtle transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckSquare className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                      <span className="font-semibold text-charcoal-900 truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant={
                          task.priority === 'URGENT'
                            ? 'urgent'
                            : task.priority === 'HIGH'
                            ? 'high'
                            : 'medium'
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        variant={task.status === 'DONE' ? 'approved' : 'default'}
                        size="sm"
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Memory & Playbook Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              hover
              onClick={() => navigate(`/clubs/${clubId}/memory`)}
              className="dash-widget cursor-pointer p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-forest-50 border border-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900">Standard Operating Procedures</h4>
                  <p className="text-[11px] text-charcoal-500">Auditorium permits, lab access, AV forms</p>
                </div>
              </div>
            </Card>

            <Card
              hover
              onClick={() => navigate(`/clubs/${clubId}/directory`)}
              className="dash-widget cursor-pointer p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-amberGold-50 border border-amberGold-100 text-amberGold-700 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal-900">Sponsors & Vendors Network</h4>
                  <p className="text-[11px] text-charcoal-500">Print shops, keynote contacts, ratings</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Active Leadership Roster & Historical Continuity */}
        <div className="space-y-6">
          {/* Executive Leadership Team */}
          <Card className="dash-widget">
            <CardHeader
              title="Executive Board"
              subtitle="Current operational leadership"
              action={
                <Link
                  to={`/clubs/${clubId}/members`}
                  className="text-xs text-forest-700 hover:underline"
                >
                  Roster
                </Link>
              }
            />

            <div className="space-y-3">
              {leadership.length === 0 ? (
                <div className="text-center py-4 text-xs text-charcoal-400">
                  No active executive officers recorded.
                </div>
              ) : (
                leadership.map((m) => (
                  <div key={m._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={m.userId?.fullName || 'Member'}
                        size="sm"
                        src={m.userId?.avatarUrl}
                      />
                      <div>
                        <div className="font-semibold text-charcoal-900">{m.userId?.fullName}</div>
                        <div className="text-[10px] text-charcoal-400">{m.title || m.clubRole}</div>
                      </div>
                    </div>
                    <Badge variant="default" size="sm">
                      {String(m.title || m.clubRole || 'Member').replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Past Event & Workspace Real Summary (Zero Fake Metrics) */}
          <Card className="dash-widget">
            <CardHeader
              title="Organization Snapshot"
              subtitle="Live metrics calculated from workspace records"
            />
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-charcoal-500">Active Members</span>
                <span className="font-bold text-charcoal-900">{metrics?.memberCount ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-charcoal-500">Configured Positions</span>
                <span className="font-bold text-charcoal-900">{metrics?.positionsCount ?? clubData?.positions?.length ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-charcoal-500">Events Completed</span>
                <span className="font-bold text-charcoal-900">{completedEvents.length}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-charcoal-500">Total Recorded Attendance</span>
                <span className="font-bold text-charcoal-900">
                  {completedEvents.reduce((acc, c) => acc + (c.actualAttendance || 0), 0)} Attendees
                </span>
              </div>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => navigate(`/clubs/${clubId}/reports`)}
                >
                  View Reports & Analytics
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
