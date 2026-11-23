import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Send,
  FileCheck2,
  Plus,
  Layers,
  Sparkles,
  ClipboardList,
  Compass,
} from 'lucide-react';

const LIFECYCLE_STAGES = [
  'DRAFT',
  'PROPOSED',
  'APPROVED',
  'PLANNING',
  'IN_PROGRESS',
  'COMPLETED',
  'ARCHIVED',
];

const TABS = [
  { key: 'overview', label: 'Overview', icon: Compass },
  { key: 'tasks', label: 'Tasks', icon: ClipboardList },
  { key: 'attendees', label: 'Attendees', icon: Users },
  { key: 'budget', label: 'Budget', icon: DollarSign },
  { key: 'resources', label: 'Resources', icon: Layers },
  { key: 'approvals', label: 'Approvals', icon: FileCheck2 },
  { key: 'retrospective', label: 'Retrospective', icon: Sparkles },
];

export function EventDetail() {
  const { eventId } = useParams();
  const { addToast } = useToast();

  const [eventData, setEventData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRetroModal, setShowRetroModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
  });

  const [retroForm, setRetroForm] = useState({
    actualAttendance: 0,
    actualBudget: 0,
    summary: '',
    whatWentWell: '',
    whatCouldImprove: '',
    sponsorSatisfaction: '',
  });

  const [submissionNotes, setSubmissionNotes] = useState('');

  const containerRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.tab-content-panel'), {
        opacity: [0, 1],
        translateY: [4, 0],
        duration: 250,
        ease: 'easeOutQuad',
      });
    },
    [activeTab, eventData?._id]
  );

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/events/${eventId}`);
      if (res.ok) {
        const json = await res.json();
        setEventData(json.data.event);
        setTasks(json.data.tasks || []);
        setApprovals(json.data.approvals || []);
        setRetroForm({
          actualAttendance:
            json.data.event.actualAttendance || json.data.event.expectedAttendance || 0,
          actualBudget:
            json.data.event.actualBudget || json.data.event.estimatedBudget || 0,
          summary: json.data.event.retrospective?.summary || '',
          whatWentWell: json.data.event.retrospective?.whatWentWell || '',
          whatCouldImprove: json.data.event.retrospective?.whatCouldImprove || '',
          sponsorSatisfaction: json.data.event.retrospective?.sponsorSatisfaction || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchEventData();
  }, [eventId]);

  const handleTransitionState = async (newStatus) => {
    try {
      const res = await fetch(`/api/v1/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Status transition failed');

      addToast(`Lifecycle updated to ${newStatus}`, 'success');
      setEventData(json.data.event);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/events/${eventId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create task');

      addToast('Task added successfully', 'success');
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        assigneeId: '',
      });
      fetchEventData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
      const res = await fetch(`/api/v1/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/events/${eventId}/submit-proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionNotes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Submission failed');

      addToast('Event proposal submitted to faculty coordinator!', 'success');
      setShowSubmitModal(false);
      fetchEventData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSaveRetro = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/events/${eventId}/retrospective`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retroForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Retrospective save failed');

      addToast('Retrospective recorded and event finalized!', 'success');
      setShowRetroModal(false);
      fetchEventData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading && !eventData) {
    return (
      <div className="text-center py-12 text-xs text-charcoal-500 font-medium">
        Loading event workspace…
      </div>
    );
  }

  const currentStageIndex = LIFECYCLE_STAGES.indexOf(eventData.status);

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader
        title={eventData.title}
        subtitle={`${eventData.eventType} · Organized by ${eventData.clubId?.name}`}
        badge={<Badge variant="default">{eventData.status}</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {eventData.status === 'DRAFT' && (
              <Button size="sm" onClick={() => setShowSubmitModal(true)}>
                <Send className="w-3.5 h-3.5" /> Submit Proposal
              </Button>
            )}
            {eventData.status === 'APPROVED' && (
              <Button size="sm" onClick={() => handleTransitionState('PLANNING')}>
                Begin Planning
              </Button>
            )}
            {eventData.status === 'PLANNING' && (
              <Button size="sm" onClick={() => handleTransitionState('IN_PROGRESS')}>
                Mark In Progress
              </Button>
            )}
            {eventData.status === 'IN_PROGRESS' && (
              <Button size="sm" onClick={() => setShowRetroModal(true)}>
                Complete Event
              </Button>
            )}
            {eventData.status === 'COMPLETED' && (
              <Button size="sm" variant="outline" onClick={() => setShowRetroModal(true)}>
                Edit Post-Mortem
              </Button>
            )}
          </div>
        }
      />

      {/* 7-Stage Lifecycle Stepper */}
      <Card className="p-4 bg-surface border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-charcoal-700">Event Lifecycle Progression</span>
          <span className="text-[11px] text-charcoal-400 font-medium">
            Stage {currentStageIndex + 1} of 7
          </span>
        </div>
        <div className="flex items-center justify-between relative overflow-x-auto gap-2">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div key={stage} className="flex-1 min-w-[85px] text-center">
                <div
                  className={`w-full h-1.5 rounded-full mb-1.5 transition-colors ${
                    isCompleted
                      ? 'bg-forest-700'
                      : isCurrent
                      ? 'bg-amberGold-500'
                      : 'bg-muted'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium block ${
                    isCurrent
                      ? 'text-forest-900 font-bold'
                      : isCompleted
                      ? 'text-charcoal-700'
                      : 'text-charcoal-400'
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 7 Interactive Cockpit Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-1 overflow-x-auto text-xs font-medium">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-forest-700 text-forest-900 bg-forest-50/50 font-bold'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900 hover:bg-subtle/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.key === 'tasks' && (
                <span className="text-[10px] bg-subtle px-1.5 py-0.2 rounded font-mono">
                  {tasks.length}
                </span>
              )}
              {tab.key === 'approvals' && approvals.length > 0 && (
                <span className="text-[10px] bg-amberGold-100 text-amberGold-800 px-1.5 py-0.2 rounded font-mono">
                  {approvals.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="tab-content-panel">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 space-y-4">
              <CardHeader title="Event Summary & Scope" />
              <p className="text-xs text-charcoal-700 leading-relaxed whitespace-pre-wrap">
                {eventData.description || 'No detailed scope recorded for this event.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                <div className="p-3 rounded bg-subtle">
                  <span className="text-[11px] text-charcoal-500 block">Category</span>
                  <span className="font-bold text-charcoal-900 text-xs mt-0.5 block">
                    {eventData.eventType}
                  </span>
                </div>
                <div className="p-3 rounded bg-subtle">
                  <span className="text-[11px] text-charcoal-500 block">Expected Size</span>
                  <span className="font-bold text-charcoal-900 text-xs mt-0.5 block">
                    {eventData.expectedAttendance} Students
                  </span>
                </div>
                <div className="p-3 rounded bg-subtle">
                  <span className="text-[11px] text-charcoal-500 block">Budget Target</span>
                  <span className="font-bold text-charcoal-900 text-xs mt-0.5 block">
                    ${eventData.estimatedBudget}
                  </span>
                </div>
                <div className="p-3 rounded bg-subtle">
                  <span className="text-[11px] text-charcoal-500 block">Lead Coordinator</span>
                  <span className="font-bold text-forest-800 text-xs mt-0.5 block truncate">
                    {eventData.leadOrganizerId?.fullName || 'Lead'}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="space-y-3 text-xs">
              <CardHeader title="Logistics & Venue" />
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1.5 border-b border-border">
                  <span className="text-charcoal-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest-700" /> Start Date
                  </span>
                  <span className="font-semibold text-charcoal-900">
                    {new Date(eventData.startDate).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border">
                  <span className="text-charcoal-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-charcoal-400" /> End Date
                  </span>
                  <span className="font-semibold text-charcoal-900">
                    {eventData.endDate ? new Date(eventData.endDate).toLocaleString() : 'Single Day'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-border">
                  <span className="text-charcoal-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-charcoal-400" /> Venue Space
                  </span>
                  <span className="font-semibold text-charcoal-900">
                    {eventData.venueName || 'Campus Venue TBD'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: TASKS */}
        {activeTab === 'tasks' && (
          <Card>
            <CardHeader
              title={`Execution Tasks (${tasks.length})`}
              subtitle="Delegate committee tasks, manage priorities, and track readiness"
              action={
                <Button size="sm" onClick={() => setShowTaskModal(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </Button>
              }
            />

            {tasks.length === 0 ? (
              <div className="text-center py-12 text-xs text-charcoal-400">
                No tasks logged for this event. Click “Add Task” to begin delegating.
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 rounded-lg border border-border bg-surface hover:bg-subtle/50 transition-colors flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'DONE'}
                        onChange={() => handleToggleTaskStatus(task)}
                        className="w-4 h-4 rounded border-border text-forest-700 focus:ring-forest-700 cursor-pointer"
                      />
                      <div>
                        <span
                          className={`font-semibold block ${
                            task.status === 'DONE'
                              ? 'line-through text-charcoal-400'
                              : 'text-charcoal-900'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-[11px] text-charcoal-500 block">
                            {task.description}
                          </span>
                        )}
                      </div>
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
                      <Badge variant={task.status === 'DONE' ? 'approved' : 'default'} size="sm">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: ATTENDEES */}
        {activeTab === 'attendees' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <span className="text-xs text-charcoal-500 font-semibold block">Expected RSVPs</span>
              <span className="text-3xl font-bold text-charcoal-900 mt-1 block">
                {eventData.expectedAttendance || 0}
              </span>
              <p className="text-[11px] text-charcoal-400 mt-1">Initial capacity estimation</p>
            </Card>

            <Card className="text-center p-6">
              <span className="text-xs text-charcoal-500 font-semibold block">Actual Checked In</span>
              <span className="text-3xl font-bold text-forest-800 mt-1 block">
                {eventData.actualAttendance || 0}
              </span>
              <p className="text-[11px] text-charcoal-400 mt-1">Verified on-site check-ins</p>
            </Card>

            <Card className="text-center p-6">
              <span className="text-xs text-charcoal-500 font-semibold block">Turnout Yield</span>
              <span className="text-3xl font-bold text-charcoal-900 mt-1 block">
                {eventData.expectedAttendance
                  ? `${Math.round(
                      ((eventData.actualAttendance || 0) / eventData.expectedAttendance) * 100
                    )}%`
                  : '—'}
              </span>
              <p className="text-[11px] text-charcoal-400 mt-1">Attendance fulfillment rate</p>
            </Card>
          </div>
        )}

        {/* TAB 4: BUDGET */}
        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <CardHeader title="Budget Allocation" subtitle="Financial planning and actual expenditures" />
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-charcoal-600">Estimated Project Budget</span>
                  <span className="font-bold text-charcoal-900">${eventData.estimatedBudget || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-charcoal-600">Actual Recorded Expenses</span>
                  <span className="font-bold text-forest-800">${eventData.actualBudget || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-charcoal-600">Variance Balance</span>
                  <span className="font-bold text-charcoal-900">
                    ${(eventData.estimatedBudget || 0) - (eventData.actualBudget || 0)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="space-y-3 text-xs">
              <CardHeader title="Procurement Guidelines" subtitle="University reimbursement standards" />
              <div className="p-3 rounded bg-subtle border border-border text-charcoal-600 space-y-1.5 leading-relaxed">
                <p>• All itemized receipts must be retained and uploaded for faculty approval.</p>
                <p>• Department funding covers venue equipment, audio-visual kits, and speaker travel.</p>
                <p>• Refreshment expenses require pre-cleared purchase order requisitions.</p>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: RESOURCES */}
        {activeTab === 'resources' && (
          <Card className="space-y-4">
            <CardHeader
              title="Campus Facilities & Equipment Resources"
              subtitle="Permits, venue holds, and equipment requirements"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1.5">
                <span className="font-bold text-ink block">Facility Space</span>
                <span className="text-mutedSlate block">{eventData.venueName || 'Venue TBD'}</span>
                <Badge
                  variant={eventData.venueName ? (eventData.status === 'APPROVED' || eventData.status === 'COMPLETED' ? 'approved' : 'planning') : 'default'}
                  size="sm"
                >
                  {eventData.venueName ? (eventData.status === 'APPROVED' || eventData.status === 'COMPLETED' ? 'Hold Verified' : 'Hold Requested') : 'Unassigned'}
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1.5">
                <span className="font-bold text-ink block">Audio-Visual Logistics</span>
                <span className="text-mutedSlate block">
                  {eventData.status === 'DRAFT' || eventData.status === 'PROPOSED'
                    ? 'Configured during Planning stage'
                    : 'Standard campus AV equipment requested'}
                </span>
                <Badge variant={eventData.status === 'DRAFT' || eventData.status === 'PROPOSED' ? 'default' : 'planning'} size="sm">
                  {eventData.status === 'DRAFT' || eventData.status === 'PROPOSED' ? 'Pending Stage' : 'Scheduled'}
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1.5">
                <span className="font-bold text-ink block">Security & Campus Access</span>
                <span className="text-mutedSlate block">
                  {eventData.status === 'APPROVED' || eventData.status === 'COMPLETED'
                    ? 'Security dispatch notified'
                    : 'Notified upon proposal approval'}
                </span>
                <Badge variant={eventData.status === 'APPROVED' || eventData.status === 'COMPLETED' ? 'approved' : 'default'} size="sm">
                  {eventData.status === 'APPROVED' || eventData.status === 'COMPLETED' ? 'Permit Active' : 'Hold'}
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 6: APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <Card>
              <CardHeader
                title="Faculty Coordinator Approvals"
                subtitle="Formal compliance decisions, advisor feedback, and audit history"
              />

              {approvals.length === 0 ? (
                <div className="text-center py-8 text-xs text-charcoal-400">
                  No approval records found. Submit proposal to initiate faculty review.
                </div>
              ) : (
                <div className="space-y-3">
                  {approvals.map((app) => (
                    <div
                      key={app._id}
                      className="p-3.5 rounded border border-border bg-surface text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-charcoal-900">
                            {app.reviewerId?.fullName || 'Faculty Coordinator'}
                          </span>
                          <Badge
                            variant={app.decision === 'APPROVED' ? 'approved' : 'proposed'}
                            size="sm"
                          >
                            {app.decision}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-charcoal-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {app.comments && (
                        <p className="text-charcoal-700 bg-subtle p-2.5 rounded border border-border leading-relaxed">
                          "{app.comments}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 7: RETROSPECTIVE */}
        {activeTab === 'retrospective' && (
          <Card className="space-y-4">
            <CardHeader
              title="Post-Event Retrospective & Historical Continuity"
              subtitle="Lessons learned and institutional memory preserved for future student leadership"
              action={
                <Button size="sm" variant="outline" onClick={() => setShowRetroModal(true)}>
                  Edit Post-Mortem
                </Button>
              }
            />

            {eventData.retrospective?.summary || eventData.retrospective?.whatWentWell ? (
              <div className="space-y-4 text-xs">
                {eventData.retrospective.summary && (
                  <div>
                    <span className="font-bold text-charcoal-900 block mb-1">Executive Summary</span>
                    <p className="text-charcoal-700 leading-relaxed bg-subtle p-3 rounded border border-border">
                      {eventData.retrospective.summary}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded bg-forest-50/50 border border-forest-100">
                    <span className="font-bold text-forest-900 block mb-1">What Went Well</span>
                    <p className="text-charcoal-700 leading-relaxed">
                      {eventData.retrospective.whatWentWell || 'None recorded.'}
                    </p>
                  </div>

                  <div className="p-3 rounded bg-amberGold-50/50 border border-amberGold-100">
                    <span className="font-bold text-amberGold-900 block mb-1">What Could Improve</span>
                    <p className="text-charcoal-700 leading-relaxed">
                      {eventData.retrospective.whatCouldImprove || 'None recorded.'}
                    </p>
                  </div>
                </div>

                {eventData.retrospective.sponsorSatisfaction && (
                  <div>
                    <span className="font-bold text-charcoal-900 block mb-1">
                      Sponsor & Partner Feedback
                    </span>
                    <p className="text-charcoal-700 leading-relaxed bg-subtle p-3 rounded border border-border">
                      {eventData.retrospective.sponsorSatisfaction}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-charcoal-400 space-y-2">
                <p>No retrospective logged yet. Complete the event and record post-mortem notes.</p>
                <Button size="sm" onClick={() => setShowRetroModal(true)}>
                  Record Post-Mortem
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add Execution Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="e.g. Confirm audio-visual projector setup"
            required
          />
          <Textarea
            label="Task Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="Detailed instructions or venue contacts"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              options={[
                { label: 'Low', value: 'LOW' },
                { label: 'Medium', value: 'MEDIUM' },
                { label: 'High', value: 'HIGH' },
                { label: 'Urgent', value: 'URGENT' },
              ]}
            />
            <Input
              label="Due Date"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Submit Proposal Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Proposal to Advisor"
      >
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Submitting this event proposal will lock changes and send a review notification to the assigned
            campus faculty coordinator.
          </p>
          <Textarea
            label="Submission Remarks"
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            placeholder="Document any special safety requirements or co-sponsor requests..."
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Proposal</Button>
          </div>
        </form>
      </Modal>

      {/* Retrospective Modal */}
      <Modal
        isOpen={showRetroModal}
        onClose={() => setShowRetroModal(false)}
        title="Record Event Retrospective"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveRetro} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Actual Attendance"
              type="number"
              value={retroForm.actualAttendance}
              onChange={(e) =>
                setRetroForm({ ...retroForm, actualAttendance: parseInt(e.target.value, 10) || 0 })
              }
              required
            />
            <Input
              label="Actual Expenditure ($)"
              type="number"
              value={retroForm.actualBudget}
              onChange={(e) =>
                setRetroForm({ ...retroForm, actualBudget: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>

          <Textarea
            label="Executive Summary"
            value={retroForm.summary}
            onChange={(e) => setRetroForm({ ...retroForm, summary: e.target.value })}
            placeholder="High-level recap of the event milestone..."
            rows={2}
          />

          <Textarea
            label="What Went Well (Best Practices)"
            value={retroForm.whatWentWell}
            onChange={(e) => setRetroForm({ ...retroForm, whatWentWell: e.target.value })}
            placeholder="Key successes to repeat next year..."
            rows={3}
            required
          />

          <Textarea
            label="What Could Improve (Lessons Learned)"
            value={retroForm.whatCouldImprove}
            onChange={(e) => setRetroForm({ ...retroForm, whatCouldImprove: e.target.value })}
            placeholder="Pitfalls, venue delays, or communication gaps to prevent..."
            rows={3}
            required
          />

          <Textarea
            label="Sponsor & Partner Feedback"
            value={retroForm.sponsorSatisfaction}
            onChange={(e) => setRetroForm({ ...retroForm, sponsorSatisfaction: e.target.value })}
            placeholder="Feedback from external keynotes, sponsors, or catering partners..."
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowRetroModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Finalize Retrospective</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
