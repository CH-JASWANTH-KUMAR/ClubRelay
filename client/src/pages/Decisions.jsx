import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import { CheckSquare, Plus, Calendar, Users, CheckCircle2 } from 'lucide-react';

export function Decisions() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    meetingDate: new Date().toISOString().split('T')[0],
    attendees: 'Sarah Jenkins, Alex Rivera, David Kalu',
    outcome: 'APPROVED',
  });

  const cardsRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.decision-card'), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 300,
        delay: (el, i) => i * 30,
        ease: 'easeOutQuad',
      });
    },
    [decisions.length]
  );

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/clubs/${clubId}/decisions`);
      if (res.ok) {
        const json = await res.json();
        setDecisions(json.data.decisions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) fetchDecisions();
  }, [clubId]);

  const handleRecordDecision = async (e) => {
    e.preventDefault();
    try {
      const attendeesList = formData.attendees
        .split(',')
        .map((a) => ({ name: a.trim() }))
        .filter((a) => a.name);

      const res = await fetch(`/api/v1/clubs/${clubId}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          summary: formData.summary,
          meetingDate: formData.meetingDate,
          attendees: attendeesList,
          outcome: formData.outcome,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to record decision');

      addToast('Executive decision recorded in official minutes', 'success');
      setShowAddModal(false);
      setFormData({
        title: '',
        summary: '',
        meetingDate: new Date().toISOString().split('T')[0],
        attendees: '',
        outcome: 'APPROVED',
      });
      fetchDecisions();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div ref={cardsRef} className="space-y-6">
      <PageHeader
        title="Executive Decisions & Minutes"
        subtitle="Official governance resolutions, voting records, and executive board action items"
        actions={
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" /> Record Board Decision
          </Button>
        }
      />

      {decisions.length === 0 ? (
        <Card className="text-center py-12 text-xs text-charcoal-400">
          No executive decisions recorded yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {decisions.map((d) => (
            <Card key={d._id} className="decision-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-forest-700" />
                  <h3 className="text-sm font-bold text-charcoal-900">{d.title}</h3>
                  <Badge variant="approved" size="sm">
                    {d.outcome}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
                  <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                  <span>Meeting: {new Date(d.meetingDate).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-xs text-charcoal-700 leading-relaxed mb-4">{d.summary}</p>

              {/* Attendees */}
              {d.attendees && d.attendees.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-charcoal-500 mb-3">
                  <Users className="w-3.5 h-3.5 text-charcoal-400" />
                  <span className="font-semibold text-charcoal-700">Attendees:</span>
                  <div className="flex flex-wrap gap-1">
                    {d.attendees.map((att, idx) => (
                      <span key={idx} className="bg-subtle px-2 py-0.5 rounded text-[11px] text-charcoal-700">
                        {att.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action items */}
              {d.actionItems && d.actionItems.length > 0 && (
                <div className="bg-subtle/70 rounded p-3 text-xs space-y-1.5 border border-border">
                  <span className="font-semibold text-charcoal-800 block text-xs">
                    Follow-Up Action Items:
                  </span>
                  {d.actionItems.map((act, i) => (
                    <div key={i} className="flex items-center justify-between text-charcoal-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-forest-700" /> {act.task}
                      </span>
                      {act.owner && <span className="text-[11px] text-charcoal-400">Owner: {act.owner}</span>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Record Decision Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Record Executive Board Decision">
        <form onSubmit={handleRecordDecision} className="space-y-4">
          <Input
            label="Decision / Agenda Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Approval of Hackathon Budget Allocation"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Meeting Date"
              type="date"
              value={formData.meetingDate}
              onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
              required
            />
            <Input
              label="Vote Outcome"
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              placeholder="e.g. APPROVED (4-0)"
            />
          </div>

          <Input
            label="Attendees Present (Comma separated)"
            value={formData.attendees}
            onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
            placeholder="Sarah Jenkins, Alex Rivera, David Kalu"
          />

          <Textarea
            label="Resolution Summary"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="Document the exact resolution and rationale..."
            rows={5}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Log Official Resolution</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

