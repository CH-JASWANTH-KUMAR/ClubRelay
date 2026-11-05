import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Avatar } from '../components/ui/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Send,
  FileCheck2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
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

export function EventDetail() {
  const { eventId, clubId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [eventData, setEventData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

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
          actualAttendance: json.data.event.actualAttendance || json.data.event.expectedAttendance || 0,
          actualBudget: json.data.event.actualBudget || json.data.event.estimatedBudget || 0,
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/events/${eventId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create task');

      addToast('Task added to event execution board', 'success');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      fetchEventData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
    const nextStatusMap = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
      BLOCKED: 'IN_PROGRESS',
    };
    const newStatus = nextStatusMap[currentStatus] || 'TODO';

    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/events/${eventId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionNotes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to submit proposal');

      addToast(json.message || 'Proposal submitted for faculty approval!', 'success');
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
      if (!res.ok) throw new Error(json.error?.message || 'Failed to save retrospective');

      addToast('Retrospective saved and event completed!', 'success');
      setShowRetroModal(false);
      fetchEventData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleTransitionState = async (nextStatus) => {
    try {
      const res = await fetch(`/api/v1/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        addToast(`Event moved to ${nextStatus}`, 'success');
        fetchEventData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !eventData) {
    return <div className="text-center py-12 text-xs text-charcoal-500">Loading workspace…</div>;
  }

  const currentStageIndex = LIFECYCLE_STAGES.indexOf(eventData.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={eventData.title}
        subtitle={`${eventData.eventType} · Organized by ${eventData.clubId?.name}`}
        badge={<Badge variant="default">{eventData.status}</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {eventData.status === 'DRAFT' && (
              <Button size="sm" onClick={() => setShowSubmitModal(true)}>
                <Send className="w-3.5 h-3.5" /> Submit to Faculty Advisor
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
                Record Post-Mortem & Complete
              </Button>
            )}
            {eventData.status === 'COMPLETED' && (
              <Button size="sm" variant="outline" onClick={() => setShowRetroModal(true)}>
                Edit Retrospective
              </Button>
            )}
          </div>
        }
      />

      {/* 7-Stage Lifecycle Bar */}
      <Card className="p-4 bg-surface border-border">
        <div className="text-xs font-semibold text-charcoal-700 mb-3">
          Event Lifecycle Progression
        </div>
        <div className="flex items-center justify-between relative overflow-x-auto gap-2">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div key={stage} className="flex-1 min-w-[90px] text-center">
                <div
                  className={`w-full h-1.5 rounded-full mb-2 transition-colors ${
                    isCompleted
                      ? 'bg-forest-700'
                      : isCurrent
                      ? 'bg-amber-500'
                      : 'bg-muted'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium block ${
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

      {/* Faculty Advisor Feedback Banner (if approvals exist) */}
      {approvals.length > 0 && (
        <Card className="border-l-4 border-l-amber-600 bg-amber-50/40 p-4">
          <div className="flex items-start gap-3">
            <FileCheck2 className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-amber-900">
                  Faculty Advisor Review ({approvals[0].decision})
                </h4>
                <span className="text-[11px] text-amber-700">
                  by {approvals[0].reviewerId?.fullName}
                </span>
              </div>
              <p className="text-xs text-charcoal-700">{approvals[0].comments}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 2-Column Workspace: Left = Details & Retrospective; Right = Task Execution Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Retrospective */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Event Logistics & Budget" />
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-charcoal-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-forest-700" /> Start
                </span>
                <span className="font-semibold text-charcoal-900">
                  {new Date(eventData.startDate).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-charcoal-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-charcoal-400" /> Venue
                </span>
                <span className="font-semibold text-charcoal-900">
                  {eventData.venueName || 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-charcoal-500 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-charcoal-400" /> Budget
                </span>
                <span className="font-semibold text-charcoal-900">
                  ${eventData.estimatedBudget} (Actual: ${eventData.actualBudget || 0})
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-charcoal-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-charcoal-400" /> Attendance
                </span>
                <span className="font-semibold text-charcoal-900">
                  Expected: {eventData.expectedAttendance} (Actual: {eventData.actualAttendance || 0})
                </span>
              </div>

              <div className="pt-2">
                <span className="text-charcoal-400 block mb-1">Description</span>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  {eventData.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Retrospective Summary Card (if completed) */}
          {eventData.status === 'COMPLETED' && eventData.retrospective && (
            <Card className="bg-forest-50/30 border-forest-200">
              <CardHeader
                title="Post-Event Retrospective & Memory"
                subtitle="Captured lessons learned for future leadership teams"
              />
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-forest-900 block mb-0.5">What Went Well:</span>
                  <p className="text-charcoal-700">{eventData.retrospective.whatWentWell}</p>
                </div>
                <div>
                  <span className="font-semibold text-amber-900 block mb-0.5">What Could Improve:</span>
                  <p className="text-charcoal-700">{eventData.retrospective.whatCouldImprove}</p>
                </div>
                {eventData.retrospective.sponsorSatisfaction && (
                  <div>
                    <span className="font-semibold text-charcoal-800 block mb-0.5">Sponsor Outcomes:</span>
                    <p className="text-charcoal-700">{eventData.retrospective.sponsorSatisfaction}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Execution Task Board (2 cols on lg) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title={`Execution Tasks (${tasks.length})`}
              subtitle="Action items, assignees, priorities, and dependency blockers"
              action={
                <Button size="sm" onClick={() => setShowTaskModal(true)}>
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </Button>
              }
            />

            {tasks.length === 0 ? (
              <div className="text-center py-10 text-charcoal-400 text-xs">
                No tasks logged for this event. Add tasks to delegate responsibilities to core team leads.
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const isDone = task.status === 'DONE';
                  return (
                    <div
                      key={task._id}
                      className={`p-3 rounded border transition-colors flex items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-subtle/50 border-border opacity-70'
                          : 'bg-surface border-border hover:border-forest-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateTaskStatus(task._id, task.status)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-forest-700 border-forest-700 text-white'
                              : 'border-charcoal-400 hover:border-forest-700'
                          }`}
                          aria-label="Toggle task completion"
                        >
                          {isDone && <CheckCircle2 className="w-3 h-3" />}
                        </button>

                        <div>
                          <span
                            className={`text-xs font-medium block ${
                              isDone ? 'line-through text-charcoal-400' : 'text-charcoal-900'
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

                      <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                        <Badge
                          variant={
                            task.priority === 'URGENT'
                              ? 'urgent'
                              : task.priority === 'HIGH'
                              ? 'high'
                              : 'default'
                          }
                          size="sm"
                        >
                          {task.priority}
                        </Badge>

                        {task.dueDate && (
                          <span className="text-[11px] text-charcoal-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}

                        <Avatar
                          name={task.assigneeId?.fullName || 'Unassigned'}
                          size="sm"
                          src={task.assigneeId?.avatarUrl}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add Execution Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="e.g. Confirm WiFi SSID with IT"
            required
          />
          <Textarea
            label="Instructions & Context"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="What needs to be accomplished?"
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
            <Button type="submit">Assign Task</Button>
          </div>
        </form>
      </Modal>

      {/* Submit Proposal Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Proposal to Faculty Advisor"
      >
        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <p className="text-xs text-charcoal-600">
            This will formally transmit "{eventData.title}" to your club faculty coordinator for safety,
            facilities, and budget verification.
          </p>
          <Textarea
            label="Submission Notes / Faculty Message"
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            placeholder="Highlight speaker details, expected expenses, or special facility requests"
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Submission</Button>
          </div>
        </form>
      </Modal>

      {/* Retrospective Modal */}
      <Modal
        isOpen={showRetroModal}
        onClose={() => setShowRetroModal(false)}
        title="Post-Event Retrospective & Institutional Memory"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveRetro} className="space-y-4">
          <p className="text-xs text-charcoal-600">
            Document actual outcomes so future incoming leaders do not repeat logistical missteps.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Actual Attendance"
              type="number"
              value={retroForm.actualAttendance}
              onChange={(e) => setRetroForm({ ...retroForm, actualAttendance: Number(e.target.value) })}
              required
            />
            <Input
              label="Actual Budget Spent ($)"
              type="number"
              value={retroForm.actualBudget}
              onChange={(e) => setRetroForm({ ...retroForm, actualBudget: Number(e.target.value) })}
              required
            />
          </div>

          <Textarea
            label="Executive Summary"
            value={retroForm.summary}
            onChange={(e) => setRetroForm({ ...retroForm, summary: e.target.value })}
            placeholder="Brief overview of event outcomes and speaker reception"
            required
          />

          <Textarea
            label="What Went Well (Best Practices to Repeat)"
            value={retroForm.whatWentWell}
            onChange={(e) => setRetroForm({ ...retroForm, whatWentWell: e.target.value })}
            placeholder="AV team, check-in flow, catering timing"
            required
          />

          <Textarea
            label="What Could Improve (Gotchas & Friction Points)"
            value={retroForm.whatCouldImprove}
            onChange={(e) => setRetroForm({ ...retroForm, whatCouldImprove: e.target.value })}
            placeholder="e.g. Eduroam failed, need dedicated SSID from IT 3 weeks early"
            required
          />

          <Textarea
            label="Sponsor Deliverable Fulfillment & Relations"
            value={retroForm.sponsorSatisfaction}
            onChange={(e) => setRetroForm({ ...retroForm, sponsorSatisfaction: e.target.value })}
            placeholder="Were sponsor commitments met? Sponsor renewal interest?"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowRetroModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Memory & Complete Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

