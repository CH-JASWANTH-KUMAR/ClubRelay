import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Avatar } from '../components/ui/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  Calendar,
  CheckSquare,
  ArrowRightLeft,
  Users,
  BookOpen,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export function ClubDashboard() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [clubData, setClubData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.dash-widget'), {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 350,
        delay: (el, i) => i * 40,
        ease: 'easeOutQuad',
      });
    },
    [loading]
  );

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [clubRes, eventsRes] = await Promise.all([
          fetch(`/api/v1/clubs/${clubId}`),
          fetch(`/api/v1/clubs/${clubId}/events`),
        ]);

        if (clubRes.ok) {
          const json = await clubRes.json();
          setClubData(json.data);
        }
        if (eventsRes.ok) {
          const json = await eventsRes.json();
          setEvents(json.data.events || []);
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

  const upcomingEvents = events.filter((e) => ['PLANNING', 'APPROVED', 'PROPOSED'].includes(e.status));
  const completedEvents = events.filter((e) => e.status === 'COMPLETED');

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader
        title={club?.name || 'Club Workspace'}
        subtitle={`Organization code: ${club?.code || ''} · ${club?.category || ''} Category`}
        badge={
          <Badge variant="approved" size="md">
            Active Term: 2025-2026
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/clubs/${clubId}/handover`)}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Handover Center
            </Button>
            <Button size="sm" onClick={() => navigate(`/clubs/${clubId}/events`)}>
              <Calendar className="w-3.5 h-3.5" /> Manage Events
            </Button>
          </div>
        }
      />

      {/* Succession Alert Widget (Core Differentiator Banner) */}
      <Card className="dash-widget bg-gradient-to-r from-forest-50/70 to-subtle border-forest-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest-700 animate-pulse" />
              <h4 className="text-sm font-bold text-forest-900">
                Annual Leadership Transition Health
              </h4>
            </div>
            <p className="text-xs text-charcoal-600 max-w-2xl">
              Preserve institutional memory before outgoing board members step down. Section-by-section
              knowledge, playbooks, vendor notes, and digital sign-off.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <span className="text-xs font-semibold text-charcoal-900">
                {metrics?.handoverProgress !== null ? `${metrics?.handoverProgress}% Ready` : 'Not Initiated'}
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
        {/* Left Column: Upcoming Events Flight Deck (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
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
                    className="p-3.5 rounded border border-border bg-surface hover:border-forest-600 hover:shadow-subtle transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-charcoal-900 hover:text-forest-700">
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
                          <Calendar className="w-3 h-3" />
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

          {/* Quick Memory & Playbook Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card
              hover
              onClick={() => navigate(`/clubs/${clubId}/memory`)}
              className="dash-widget cursor-pointer p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-forest-50 border border-forest-100 text-forest-700 flex items-center justify-center">
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
                <div className="w-9 h-9 rounded bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
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

        {/* Right Column: Active Leadership Roster & Metrics */}
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
              {leadership.map((m) => (
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
                    {m.clubRole.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Past Event Performance Summary */}
          <Card className="dash-widget">
            <CardHeader
              title="Historical Continuity"
              subtitle="Recorded outcomes across prior milestones"
            />
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-charcoal-500">Events Completed</span>
                <span className="font-bold text-charcoal-900">{completedEvents.length}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-charcoal-500">Total Student Reach</span>
                <span className="font-bold text-charcoal-900">
                  {completedEvents.reduce((acc, c) => acc + (c.actualAttendance || 0), 0)} Attendees
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-charcoal-500">Budget Efficiency</span>
                <span className="font-bold text-forest-800">96.8% On Budget</span>
              </div>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => navigate(`/clubs/${clubId}/reports`)}
                >
                  Generate Annual Report
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
