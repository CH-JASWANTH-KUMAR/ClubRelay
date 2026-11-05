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
  Plus,
  Users,
  MapPin,
  DollarSign,
  ArrowRight,
  Filter,
  Layers,
} from 'lucide-react';

export function EventsList() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'WORKSHOP',
    startDate: '',
    endDate: '',
    venueName: '',
    estimatedBudget: 500,
    expectedAttendance: 50,
    templateId: '',
  });

  const listRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.event-item-card'), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 300,
        delay: (el, i) => i * 30,
        ease: 'easeOutQuad',
      });
    },
    [filterStatus, events.length]
  );

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [eventsRes, tmplRes] = await Promise.all([
        fetch(`/api/v1/clubs/${clubId}/events${filterStatus !== 'ALL' ? `?status=${filterStatus}` : ''}`),
        fetch('/api/v1/event-templates'),
      ]);

      if (eventsRes.ok) {
        const json = await eventsRes.json();
        setEvents(json.data.events || []);
      }
      if (tmplRes.ok) {
        const json = await tmplRes.json();
        setTemplates(json.data.templates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) fetchEvents();
  }, [clubId, filterStatus]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create event');

      addToast(`Event "${json.data.event.title}" created successfully!`, 'success');
      setShowCreateModal(false);
      navigate(`/clubs/${clubId}/events/${json.data.event._id}`);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleTemplateChange = (e) => {
    const tmplId = e.target.value;
    const tmpl = templates.find((t) => t._id === tmplId);
    if (tmpl) {
      setFormData((prev) => ({
        ...prev,
        templateId: tmplId,
        eventType: tmpl.eventType,
        description: tmpl.defaultDescription,
        title: `${tmpl.name} 2026`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, templateId: '' }));
    }
  };

  const statusVariants = {
    DRAFT: 'draft',
    PROPOSED: 'proposed',
    APPROVED: 'approved',
    PLANNING: 'planning',
    IN_PROGRESS: 'inProgress',
    COMPLETED: 'completed',
    ARCHIVED: 'archived',
  };

  return (
    <div ref={listRef} className="space-y-6">
      <PageHeader
        title="Event Execution Workspace"
        subtitle="Manage end-to-end event lifecycles, assign tasks, and capture historical outcomes"
        actions={
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> New Event Proposal
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-2 overflow-x-auto text-xs font-medium">
        {['ALL', 'DRAFT', 'PROPOSED', 'APPROVED', 'PLANNING', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              filterStatus === status
                ? 'bg-forest-700 text-white font-semibold'
                : 'text-charcoal-600 hover:bg-subtle hover:text-charcoal-900'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-charcoal-900">No events found</h4>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-4">
            No events match the selected status filter. Click "New Event Proposal" to create one.
          </p>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" /> Create Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card
              key={event._id}
              hover
              onClick={() => navigate(`/clubs/${clubId}/events/${event._id}`)}
              className="event-item-card cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={statusVariants[event.status] || 'default'} size="sm">
                    {event.status}
                  </Badge>
                  <span className="text-[10px] text-charcoal-400 font-mono uppercase tracking-wider">
                    {event.eventType}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-charcoal-900 hover:text-forest-700 transition-colors line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-xs text-charcoal-600 line-clamp-2 mt-1 mb-4">
                  {event.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 text-xs text-charcoal-500 border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
                    <span className="truncate">{event.venueName || 'Venue Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" />
                    <span>Budget: ${event.estimatedBudget || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={event.leadOrganizerId?.fullName || 'Lead'}
                    size="sm"
                    src={event.leadOrganizerId?.avatarUrl}
                  />
                  <span className="text-charcoal-700 truncate max-w-[120px]">
                    {event.leadOrganizerId?.fullName?.split(' ')[0]}
                  </span>
                </div>
                <span className="text-forest-700 font-medium flex items-center gap-1">
                  Workspace <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Event or Project"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          {/* Reusable Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-forest-700" /> Start from Reusable Template
            </label>
            <select
              value={formData.templateId}
              onChange={handleTemplateChange}
              className="w-full rounded border border-border bg-white px-3 py-2 text-xs text-charcoal-800 focus:outline-none focus:border-forest-700"
            >
              <option value="">Start from Scratch (Blank)</option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} (Auto-populates {t.defaultTasks?.length || 0} tasks)
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Event Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Distributed Systems & Rust Bootcamp"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Event Type"
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              options={[
                { label: 'Technical Workshop', value: 'WORKSHOP' },
                { label: '48-Hour Hackathon', value: 'HACKATHON' },
                { label: 'Guest Lecture', value: 'GUEST_LECTURE' },
                { label: 'Developer Meetup', value: 'MEETUP' },
                { label: 'Coding Competition', value: 'COMPETITION' },
                { label: 'Community Mixer', value: 'MIXER' },
              ]}
            />
            <Input
              label="Venue / Classroom"
              value={formData.venueName}
              onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              placeholder="e.g. Science Auditorium 201"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Estimated Budget ($)"
              type="number"
              value={formData.estimatedBudget}
              onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) })}
            />
            <Input
              label="Expected Attendance"
              type="number"
              value={formData.expectedAttendance}
              onChange={(e) => setFormData({ ...formData, expectedAttendance: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Description & Learning Objectives"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Outline speakers, requirements, target audience"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Initialize Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
