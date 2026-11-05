import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Input';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
} from 'lucide-react';

export function FacultyApprovals() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [decision, setDecision] = useState('APPROVED');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const listRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.approval-card'), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 300,
        delay: (el, i) => i * 35,
        ease: 'easeOutQuad',
      });
    },
    [approvals.length]
  );

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/approvals/pending');
      if (res.ok) {
        const json = await res.json();
        setApprovals(json.data.approvals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const eventId = selectedApproval.eventId?._id;
      const res = await fetch(`/api/v1/approvals/events/${eventId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comments }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to submit review');

      addToast(json.message || 'Review submitted successfully', 'success');
      setSelectedApproval(null);
      setComments('');
      fetchApprovals();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={listRef} className="space-y-6">
      <PageHeader
        title="Faculty Approval & Governance Queue"
        subtitle="Review student organization event proposals, evaluate budget requests, and ensure campus policy compliance"
      />

      {approvals.length === 0 ? (
        <Card className="text-center py-12 text-xs text-charcoal-400">
          <FileCheck2 className="w-10 h-10 text-forest-700 mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-semibold text-charcoal-900">All proposals reviewed</h4>
          <p className="mt-1">No pending student organization proposals awaiting your approval.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((appr) => {
            const event = appr.eventId;
            if (!event) return null;

            return (
              <Card key={appr._id} className="approval-card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="proposed" size="sm">
                        Pending Evaluation
                      </Badge>
                      <span className="text-xs font-semibold text-forest-800">
                        {event.clubId?.name} ({event.clubId?.code})
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-charcoal-900">{event.title}</h3>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedApproval(appr);
                      setDecision('APPROVED');
                      setComments('Approved. Facilities permit and faculty advisor sign-off granted.');
                    }}
                  >
                    Evaluate Proposal
                  </Button>
                </div>

                <p className="text-xs text-charcoal-700 leading-relaxed mb-4">
                  {event.description || 'No description provided.'}
                </p>

                {/* Logistics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-subtle/70 p-3 rounded text-xs border border-border">
                  <div>
                    <span className="text-charcoal-500 text-xs font-medium block">
                      Event Schedule
                    </span>
                    <span className="font-semibold text-charcoal-800">
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal-500 text-xs font-medium block">
                      Proposed Venue
                    </span>
                    <span className="font-semibold text-charcoal-800">
                      {event.venueName || 'Unassigned'}
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal-500 text-xs font-medium block">
                      Requested Budget
                    </span>
                    <span className="font-semibold text-charcoal-800">
                      ${event.estimatedBudget || 0}
                    </span>
                  </div>

                  <div>
                    <span className="text-charcoal-500 text-xs font-medium block">
                      Lead Organizer
                    </span>
                    <span className="font-semibold text-charcoal-800">
                      {event.leadOrganizerId?.fullName}
                    </span>
                  </div>
                </div>

                {appr.comments && (
                  <div className="mt-3 text-xs text-charcoal-500 italic">
                    Submission note: "{appr.comments}"
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        title={`Faculty Evaluation: ${selectedApproval?.eventId?.title}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-2">
              Decision Outcome
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('APPROVED')}
                className={`p-2.5 rounded border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                  decision === 'APPROVED'
                    ? 'border-forest-700 bg-forest-50 text-forest-900'
                    : 'border-border bg-white text-charcoal-600 hover:bg-subtle'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                <span>Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('MODIFICATIONS_REQUESTED')}
                className={`p-2.5 rounded border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                  decision === 'MODIFICATIONS_REQUESTED'
                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                    : 'border-border bg-white text-charcoal-600 hover:bg-subtle'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Request Changes</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`p-2.5 rounded border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                  decision === 'REJECTED'
                    ? 'border-red-600 bg-red-50 text-red-900'
                    : 'border-border bg-white text-charcoal-600 hover:bg-subtle'
                }`}
              >
                <XCircle className="w-4 h-4 text-red-700" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          <Textarea
            label="Faculty Advisor Feedback & Conditions (Mandatory)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder="Document safety instructions, required permits, or modification reasons..."
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setSelectedApproval(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Faculty Decision'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

