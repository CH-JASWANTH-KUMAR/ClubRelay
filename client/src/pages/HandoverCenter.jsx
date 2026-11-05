import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { Avatar } from '../components/ui/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Send,
  ShieldCheck,
  UserCheck,
  Calendar,
  CheckSquare,
  BookOpen,
  Users,
  ExternalLink,
  Lock,
} from 'lucide-react';

const SECTIONS = [
  { key: 'roleResponsibilities', title: '1. Role Responsibilities & Governance', icon: ShieldCheck },
  { key: 'outstandingTasks', title: '2. Outstanding Tasks & Immediate Deadlines', icon: CheckSquare },
  { key: 'pendingCommitments', title: '3. Pending Commitments & Account Credits', icon: AlertCircle },
  { key: 'futureEventSchedules', title: '4. Future Event Schedules & Venue Holds', icon: Calendar },
  { key: 'importantDocuments', title: '5. Key Documents & Vault Instructions', icon: FileText },
  { key: 'contactsAndPartners', title: '6. Vendor, Sponsor & Stakeholder Network', icon: Users },
  { key: 'reusablePlaybooks', title: '7. Reusable Playbooks & Compliance SOPs', icon: BookOpen },
  { key: 'recommendationsAndAdvice', title: '8. Lessons Learned & Strategic Advice', icon: CheckCircle2 },
];

export function HandoverCenter() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [handovers, setHandovers] = useState([]);
  const [activeHandover, setActiveHandover] = useState(null);
  const [activeSectionKey, setActiveSectionKey] = useState('roleResponsibilities');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Forms
  const [initiateForm, setInitiateForm] = useState({
    incomingLeaderEmail: 'alex.incoming@pcu.edu',
    roleHandover: 'PRESIDENT',
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [sectionContent, setSectionContent] = useState('');
  const [isSectionCompleted, setIsSectionCompleted] = useState(false);

  const containerRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.handover-card'), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 350,
        delay: (el, i) => i * 35,
        ease: 'easeOutQuad',
      });
    },
    [activeHandover?._id, activeSectionKey]
  );

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/clubs/${clubId}/handovers`);
      if (res.ok) {
        const json = await res.json();
        setHandovers(json.data.handovers || []);
        if (json.data.handovers?.length > 0) {
          // Select first active or completed handover
          const firstId = json.data.handovers[0]._id;
          fetchHandoverDetail(firstId);
        } else {
          setActiveHandover(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHandoverDetail = async (id) => {
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/handovers/${id}`);
      if (res.ok) {
        const json = await res.json();
        setActiveHandover(json.data.handover);
        const currentSec = json.data.handover.sections?.[activeSectionKey];
        setSectionContent(currentSec?.content || '');
        setIsSectionCompleted(!!currentSec?.completed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (clubId) fetchHandovers();
  }, [clubId]);

  useEffect(() => {
    if (activeHandover) {
      const sec = activeHandover.sections?.[activeSectionKey];
      setSectionContent(sec?.content || '');
      setIsSectionCompleted(!!sec?.completed);
    }
  }, [activeSectionKey]);

  const handleSaveSection = async (markComplete = null) => {
    try {
      const completed = markComplete !== null ? markComplete : isSectionCompleted;
      const res = await fetch(`/api/v1/clubs/${clubId}/handovers/${activeHandover._id}/section`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: activeSectionKey,
          content: sectionContent,
          completed,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to save section');

      addToast(json.message || 'Section saved successfully', 'success');
      setActiveHandover(json.data.handover);
      setIsSectionCompleted(completed);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAcknowledge = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/handovers/${activeHandover._id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to acknowledge');

      addToast('Handover formally acknowledged by incoming officer!', 'success');
      setShowAcknowledgeModal(false);
      setActiveHandover(json.data.handover);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCompleteTransition = async () => {
    if (!window.confirm('Are you sure you want to finalize this leadership transition? Executive roles will be transferred.')) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/handovers/${activeHandover._id}/complete`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to complete transition');

      addToast(json.message, 'success');
      fetchHandoverDetail(activeHandover._id);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    try {
      // Find term IDs
      const termsRes = await fetch(`/api/v1/campuses/${user?.campusId?._id}/terms`);
      const termsJson = await termsRes.json();
      const currentTerm = termsJson.data.terms.find((t) => t.isCurrent) || termsJson.data.terms[0];
      const nextTerm = termsJson.data.terms.find((t) => !t.isCurrent) || currentTerm;

      const res = await fetch(`/api/v1/clubs/${clubId}/handovers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingLeaderEmail: initiateForm.incomingLeaderEmail,
          roleHandover: initiateForm.roleHandover,
          fromTermId: currentTerm._id,
          toTermId: nextTerm._id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to initiate handover');

      addToast('Leadership transition package initialized!', 'success');
      setShowInitiateModal(false);
      fetchHandovers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader
        title="Leadership Handover Center"
        subtitle="End-to-end executive succession workflow, institutional memory transfer, and digital sign-off"
        badge={
          activeHandover && (
            <Badge
              variant={
                activeHandover.status === 'COMPLETED'
                  ? 'approved'
                  : activeHandover.status === 'ACKNOWLEDGED'
                  ? 'inProgress'
                  : 'proposed'
              }
              size="md"
            >
              {activeHandover.status.replace('_', ' ')}
            </Badge>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            {activeHandover && (
              <Button size="sm" variant="outline" onClick={() => setShowPrintModal(true)}>
                <Printer className="w-3.5 h-3.5" /> Printable Package (PDF)
              </Button>
            )}
            <Button size="sm" onClick={() => setShowInitiateModal(true)}>
              <ArrowRightLeft className="w-3.5 h-3.5" /> Initiate Transition
            </Button>
          </div>
        }
      />

      {/* Security Guidance Alert */}
      <div className="flex items-center gap-2 p-2.5 rounded bg-forest-50/70 border border-forest-200 text-xs text-forest-900">
        <Lock className="w-4 h-4 text-forest-700 flex-shrink-0" />
        <span>
          <strong>Credential Security:</strong> Do not post plaintext account passwords in the handover. Use the
          "Important Documents" section to transfer Bitwarden or 1Password shared vault ownership.
        </span>
      </div>

      {!activeHandover ? (
        <Card className="text-center py-12">
          <ArrowRightLeft className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-charcoal-900">No active handover initiated</h4>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-4">
            Start a structured transition package to prepare role responsibilities and SOPs for the next
            leadership team.
          </p>
          <Button size="sm" onClick={() => setShowInitiateModal(true)}>
            <ArrowRightLeft className="w-4 h-4" /> Start Handover Package
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Transition Progress Flight Deck */}
          <Card className="handover-card bg-surface border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={activeHandover.outgoingLeaderId?.fullName || 'Outgoing'}
                    size="md"
                    src={activeHandover.outgoingLeaderId?.avatarUrl}
                  />
                  <div>
                    <span className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-wider block">
                      Outgoing {activeHandover.roleHandover}
                    </span>
                    <span className="text-xs font-bold text-charcoal-900">
                      {activeHandover.outgoingLeaderId?.fullName}
                    </span>
                  </div>
                </div>

                <div className="text-charcoal-300 text-lg">→</div>

                <div className="flex items-center gap-2">
                  <Avatar
                    name={activeHandover.incomingLeaderId?.fullName || 'Incoming'}
                    size="md"
                    src={activeHandover.incomingLeaderId?.avatarUrl}
                  />
                  <div>
                    <span className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-wider block">
                      Incoming {activeHandover.roleHandover}
                    </span>
                    <span className="text-xs font-bold text-charcoal-900">
                      {activeHandover.incomingLeaderId?.fullName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Acknowledgment & Final Completion */}
              <div className="flex items-center gap-2">
                {activeHandover.status !== 'COMPLETED' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAcknowledgeModal(true)}
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Incoming Leader Sign-Off
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleCompleteTransition}
                      disabled={activeHandover.completionPercentage < 100}
                    >
                      Complete & Transfer Roles
                    </Button>
                  </>
                )}
                {activeHandover.status === 'COMPLETED' && (
                  <Badge variant="approved" size="md">
                    Transition Finalized & Logged
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress Bar & Section Counters */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-charcoal-700">Overall Package Completion</span>
                <span className="text-forest-800">{activeHandover.completionPercentage || 0}% Complete</span>
              </div>
              <Progress value={activeHandover.completionPercentage || 0} />
            </div>
          </Card>

          {/* 2-Column Handover Workspace: Left = Section Navigator; Right = Section Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: 8 Section Tabs (4 cols) */}
            <div className="lg:col-span-4 space-y-1.5">
              {SECTIONS.map((sec) => {
                const isSelected = activeSectionKey === sec.key;
                const isComplete = activeHandover.sections?.[sec.key]?.completed;
                const Icon = sec.icon;

                return (
                  <button
                    key={sec.key}
                    onClick={() => setActiveSectionKey(sec.key)}
                    className={`w-full text-left p-3 rounded border text-xs font-medium flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-forest-700 bg-forest-50/70 text-forest-900 font-semibold shadow-subtle'
                        : 'border-border bg-surface text-charcoal-700 hover:bg-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isComplete ? 'text-forest-700' : 'text-charcoal-400'
                        }`}
                      />
                      <span className="truncate">{sec.title}</span>
                    </div>

                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Column: Active Section Content & Sign-Off (8 cols) */}
            <div className="lg:col-span-8">
              <Card className="handover-card">
                <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                  <h3 className="text-sm font-bold text-charcoal-900">
                    {SECTIONS.find((s) => s.key === activeSectionKey)?.title}
                  </h3>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal-800 select-none">
                    <input
                      type="checkbox"
                      checked={isSectionCompleted}
                      onChange={(e) => {
                        const nextVal = e.target.checked;
                        setIsSectionCompleted(nextVal);
                        handleSaveSection(nextVal);
                      }}
                      className="w-4 h-4 rounded border-border text-forest-700 focus:ring-forest-700"
                    />
                    <span>Mark section verified & complete</span>
                  </label>
                </div>

                {/* Section Specific Content */}
                <div className="space-y-4">
                  <Textarea
                    label="Operational Notes & Documentation"
                    value={sectionContent}
                    onChange={(e) => setSectionContent(e.target.value)}
                    rows={12}
                    placeholder="Document specific responsibilities, account names, past agreements, or strategic warnings..."
                    helperText="Ensure links to shared documents or drive folders are accessible to incoming officers."
                  />

                  {/* Pre-populated structured references if present */}
                  {activeHandover.sections?.[activeSectionKey]?.taskList && (
                    <div className="bg-subtle p-3 rounded text-xs space-y-1.5 border border-border">
                      <span className="font-semibold text-charcoal-800 block text-[11px] uppercase">
                        Current Outstanding Tasks:
                      </span>
                      {activeHandover.sections[activeSectionKey].taskList.map((t, i) => (
                        <div key={i} className="flex justify-between text-charcoal-700">
                          <span>• {t.task}</span>
                          <span className="text-[11px] text-charcoal-400">Due: {t.deadline}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeHandover.sections?.[activeSectionKey]?.commitments && (
                    <div className="bg-subtle p-3 rounded text-xs space-y-1.5 border border-border">
                      <span className="font-semibold text-charcoal-800 block text-[11px] uppercase">
                        Pending Commitments:
                      </span>
                      {activeHandover.sections[activeSectionKey].commitments.map((c, i) => (
                        <div key={i} className="text-charcoal-700">
                          <strong>{c.title}:</strong> {c.notes} ({c.party})
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-3 border-t border-border">
                    <Button size="sm" onClick={() => handleSaveSection()}>
                      Save Section Draft
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Handover Modal */}
      <Modal
        isOpen={showInitiateModal}
        onClose={() => setShowInitiateModal(false)}
        title="Initiate Leadership Handover Package"
      >
        <form onSubmit={handleInitiate} className="space-y-4">
          <Input
            label="Incoming Leader University Email"
            type="email"
            value={initiateForm.incomingLeaderEmail}
            onChange={(e) => setInitiateForm({ ...initiateForm, incomingLeaderEmail: e.target.value })}
            placeholder="e.g. alex.incoming@pcu.edu"
            required
          />

          <Select
            label="Executive Office Being Transitioned"
            value={initiateForm.roleHandover}
            onChange={(e) => setInitiateForm({ ...initiateForm, roleHandover: e.target.value })}
            options={[
              { label: 'Club President', value: 'PRESIDENT' },
              { label: 'General Secretary', value: 'SECRETARY' },
              { label: 'Core Technical Lead', value: 'CORE_LEAD' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowInitiateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Transition Package</Button>
          </div>
        </form>
      </Modal>

      {/* Incoming Leader Digital Sign-off Modal */}
      <Modal
        isOpen={showAcknowledgeModal}
        onClose={() => setShowAcknowledgeModal(false)}
        title="Incoming Officer Digital Acknowledgment"
      >
        <form onSubmit={handleAcknowledge} className="space-y-4">
          <p className="text-xs text-charcoal-600 leading-relaxed">
            By acknowledging this package, you confirm that you have reviewed the 8 operational sections,
            understand your executive responsibilities, and have verified access to relevant documents and
            external partner contacts.
          </p>

          <Textarea
            label="Acknowledgment Notes / Transition Remarks"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Document any questions, asset access confirmations, or remarks..."
            rows={4}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAcknowledgeModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Digitally Sign & Acknowledge</Button>
          </div>
        </form>
      </Modal>

      {/* Printable / PDF Preview Modal */}
      <Modal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Official Leadership Handover Dossier"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6 text-xs text-charcoal-800 p-2 max-h-[70vh] overflow-y-auto">
          <div className="text-center pb-4 border-b border-border">
            <h2 className="text-lg font-bold text-charcoal-900">
              OFFICIAL LEADERSHIP TRANSITION DOSSIER
            </h2>
            <p className="text-xs text-charcoal-500">
              Preserved via ClubRelay Institutional Memory System
            </p>
            <div className="mt-2 text-xs font-semibold text-forest-800">
              {activeHandover?.roleHandover} TRANSITION · 2025-2026 ACADEMIC TERM
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-subtle p-3 rounded">
            <div>
              <span className="text-charcoal-500 block text-[10px] uppercase">Outgoing Officer:</span>
              <span className="font-bold">{activeHandover?.outgoingLeaderId?.fullName}</span> (
              {activeHandover?.outgoingLeaderId?.email})
            </div>
            <div>
              <span className="text-charcoal-500 block text-[10px] uppercase">Incoming Officer:</span>
              <span className="font-bold">{activeHandover?.incomingLeaderId?.fullName}</span> (
              {activeHandover?.incomingLeaderId?.email})
            </div>
          </div>

          {SECTIONS.map((sec) => (
            <div key={sec.key} className="space-y-1.5 pb-3 border-b border-border">
              <h4 className="font-bold text-charcoal-900 text-xs flex items-center justify-between">
                <span>{sec.title}</span>
                <span className="text-[10px] font-normal text-forest-700">
                  {activeHandover?.sections?.[sec.key]?.completed ? '✓ Verified' : 'Incomplete'}
                </span>
              </h4>
              <p className="whitespace-pre-wrap text-charcoal-700 text-[11px] leading-relaxed">
                {activeHandover?.sections?.[sec.key]?.content || 'No specific notes recorded.'}
              </p>
            </div>
          ))}

          {activeHandover?.reviewNotes && (
            <div className="bg-forest-50 p-3 rounded border border-forest-200">
              <span className="font-bold text-forest-900 block mb-1">
                Incoming Leader Review Remarks:
              </span>
              <p className="italic text-charcoal-700 text-[11px]">"{activeHandover.reviewNotes}"</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
              Close Preview
            </Button>
            <Button
              onClick={() => {
                window.print();
              }}
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

