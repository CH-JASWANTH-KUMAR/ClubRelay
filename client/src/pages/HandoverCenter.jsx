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
import { Select } from '../components/ui/Select';
import { Avatar } from '../components/ui/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ShieldCheck,
  UserCheck,
  Calendar,
  CheckSquare,
  BookOpen,
  Users,
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
  const [accessDenied, setAccessDenied] = useState(false);
  const [isAdvisoryView, setIsAdvisoryView] = useState(false);

  // Terms and eligible officers / custom positions
  const [terms, setTerms] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [positions, setPositions] = useState([]);

  // Modals
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Forms
  const [initiateForm, setInitiateForm] = useState({
    incomingLeaderEmail: '',
    outgoingLeaderEmail: '',
    roleHandover: 'PRESIDENT',
    positionId: '',
    fromTermId: '',
    toTermId: '',
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

  const fetchTerms = async () => {
    try {
      const campusId = user?.campusId?._id || user?.campusId;
      if (!campusId) return;
      const res = await fetch(`/api/v1/campuses/${campusId}/terms`);
      if (res && res.ok) {
        const json = await res.json();
        const loadedTerms = json.data?.terms || [];
        setTerms(loadedTerms);
        const current = loadedTerms.find((t) => t.isCurrent) || loadedTerms[0];
        const future = loadedTerms.find((t) => !t.isCurrent) || current;
        setInitiateForm((prev) => ({
          ...prev,
          fromTermId: prev.fromTermId || current?._id || '',
          toTermId: prev.toTermId || future?._id || '',
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClubMembers = async (termId) => {
    try {
      if (!clubId) return;
      const url = termId
        ? `/api/v1/clubs/${clubId}/members?academicTermId=${termId}`
        : `/api/v1/clubs/${clubId}/members`;
      const res = await fetch(url);
      if (res && res.ok) {
        const json = await res.json();
        setClubMembers(json.data?.members || []);
        if (json.data?.positions) setPositions(json.data.positions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      setAccessDenied(false);
      const res = await fetch(`/api/v1/clubs/${clubId}/handovers`);
      if (res && res.status === 403) {
        setAccessDenied(true);
        setHandovers([]);
        setActiveHandover(null);
        return;
      }
      if (res && res.ok) {
        const json = await res.json();
        const list = json.data?.handovers || [];
        setHandovers(list);
        if (list.length > 0) {
          fetchHandoverDetail(list[0]._id);
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
      if (res && res.status === 403) {
        setAccessDenied(true);
        setActiveHandover(null);
        return;
      }
      if (res && res.ok) {
        setAccessDenied(false);
        const json = await res.json();
        const h = json.data?.handover;
        setActiveHandover(h);
        setIsAdvisoryView(
          user?.campusRole === 'FACULTY_COORDINATOR' &&
            !h?.reviewNotes &&
            !h?.outgoingLeaderId?.email
        );
        const currentSec = h?.sections?.[activeSectionKey];
        setSectionContent(currentSec?.content || '');
        setIsSectionCompleted(!!currentSec?.completed);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchHandovers();
      fetchTerms();
    }
  }, [clubId]);

  useEffect(() => {
    if (user?.campusRole === 'CAMPUS_ADMIN' && initiateForm.fromTermId) {
      fetchClubMembers(initiateForm.fromTermId);
    }
  }, [user?.campusRole, initiateForm.fromTermId, clubId]);

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
      setActiveHandover(json.data?.handover);
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
      setActiveHandover(json.data?.handover);
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
      if (!initiateForm.fromTermId || !initiateForm.toTermId) {
        throw new Error('Please select both from and to academic terms.');
      }
      if (!initiateForm.incomingLeaderEmail.trim()) {
        throw new Error('Please enter incoming leader university email.');
      }
      if (user?.campusRole === 'CAMPUS_ADMIN' && !initiateForm.outgoingLeaderEmail.trim()) {
        throw new Error('Campus administrators must nominate an eligible outgoing officer.');
      }

      const payload = {
        incomingLeaderEmail: initiateForm.incomingLeaderEmail.trim(),
        fromTermId: initiateForm.fromTermId,
        toTermId: initiateForm.toTermId,
      };

      if (initiateForm.positionId) {
        payload.positionId = initiateForm.positionId;
        payload.roleHandover = 'CUSTOM_POSITION';
      } else {
        payload.roleHandover = initiateForm.roleHandover;
      }

      if (user?.campusRole === 'CAMPUS_ADMIN' || initiateForm.outgoingLeaderEmail.trim()) {
        if (initiateForm.outgoingLeaderEmail.trim()) {
          payload.outgoingLeaderEmail = initiateForm.outgoingLeaderEmail.trim();
        }
      }

      const res = await fetch(`/api/v1/clubs/${clubId}/handovers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to initiate handover');

      addToast('Leadership transition package initialized!', 'success');
      setShowInitiateModal(false);
      setInitiateForm((prev) => ({
        ...prev,
        incomingLeaderEmail: '',
        outgoingLeaderEmail: '',
      }));
      fetchHandovers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Eligible outgoing officers for campus admin
  const eligibleRoles =
    initiateForm.roleHandover === 'PRESIDENT'
      ? ['PRESIDENT']
      : initiateForm.roleHandover === 'SECRETARY'
      ? ['SECRETARY']
      : ['CORE_TEAM', 'PRESIDENT', 'SECRETARY'];

  const eligibleOutgoingOfficers = clubMembers.filter(
    (m) => m.status === 'ACTIVE' && eligibleRoles.includes(m.clubRole)
  );

  if (accessDenied) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Leadership Handover Center"
          subtitle="Restricted executive succession and institutional continuity workspace"
        />
        <Card className="text-center py-12 p-6 max-w-2xl mx-auto">
          <Lock className="w-10 h-10 text-charcoal-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-charcoal-900 mb-1">
            Executive Privacy Protected
          </h3>
          <p className="text-xs text-charcoal-600 leading-relaxed mb-4">
            Handover packages contain confidential leadership notes, account credential instructions, and
            governance details. Access is restricted to transitioning officers, current club executives, and
            authorized campus administrators.
          </p>
          <Badge variant="default" size="sm">
            Access Level: General Club Member
          </Badge>
        </Card>
      </div>
    );
  }

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

      {/* Advisory Access Banner for Faculty */}
      {isAdvisoryView && (
        <div className="flex items-center gap-2 p-3 rounded bg-amberGold-50 border border-amberGold-100 text-xs text-amberGold-800">
          <ShieldCheck className="w-4 h-4 text-amberGold-700 flex-shrink-0" />
          <span>
            <strong>Faculty Advisory Access:</strong> You are viewing this handover package in advisory oversight mode.
            Private officer review notes and confidential phone/email records remain restricted to the transitioning student leaders.
          </span>
        </div>
      )}

      {/* Security Guidance Alert */}
      <div className="flex items-center gap-2 p-2.5 rounded bg-forest-50/70 border border-forest-200 text-xs text-forest-900">
        <Lock className="w-4 h-4 text-forest-700 flex-shrink-0" />
        <span>
          <strong>Credential Security:</strong> Do not post plaintext account passwords in the handover. Use the
          “Important Documents” section to transfer Bitwarden or 1Password shared vault ownership.
        </span>
      </div>

      {loading ? (
        <Card className="text-center py-12 text-xs text-charcoal-500 font-medium">
          Loading handover packages…
        </Card>
      ) : !activeHandover ? (
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
                    <span className="text-xs text-charcoal-500 font-medium block">
                      Outgoing {activeHandover.roleHandover}
                    </span>
                    <span className="text-xs font-bold text-charcoal-900">
                      {activeHandover.outgoingLeaderId?.fullName || 'Outgoing Leader'}
                    </span>
                    {activeHandover.outgoingLeaderId?.email && (
                      <span className="text-[11px] text-charcoal-400 block">
                        {activeHandover.outgoingLeaderId.email}
                      </span>
                    )}
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
                    <span className="text-xs text-charcoal-500 font-medium block">
                      Incoming {activeHandover.roleHandover}
                    </span>
                    <span className="text-xs font-bold text-charcoal-900">
                      {activeHandover.incomingLeaderId?.fullName || 'Incoming Leader'}
                    </span>
                    {activeHandover.incomingLeaderId?.email && (
                      <span className="text-[11px] text-charcoal-400 block">
                        {activeHandover.incomingLeaderId.email}
                      </span>
                    )}
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
                      <UserCheck className="w-3.5 h-3.5" /> Sign-Off
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleCompleteTransition}
                      disabled={activeHandover.completionPercentage < 100}
                    >
                      Complete Handover
                    </Button>
                  </>
                )}
                {activeHandover.status === 'COMPLETED' && (
                  <Badge variant="approved" size="md">
                    Transition Finalized
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
                    className={`w-full text-left p-3 rounded border text-xs font-medium flex items-center justify-between transition-colors ${
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
                      <span className="w-2 h-2 rounded-full bg-amberGold-500 flex-shrink-0" />
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
                      <span className="font-semibold text-charcoal-800 block text-xs">
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
                      <span className="font-semibold text-charcoal-800 block text-xs">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="From Academic Term"
              value={initiateForm.fromTermId}
              onChange={(e) => setInitiateForm({ ...initiateForm, fromTermId: e.target.value })}
              options={terms.map((t) => ({
                label: `${t.name}${t.isCurrent ? ' (Current)' : ''}`,
                value: t._id,
              }))}
              required
            />
            <Select
              label="To Academic Term"
              value={initiateForm.toTermId}
              onChange={(e) => setInitiateForm({ ...initiateForm, toTermId: e.target.value })}
              options={terms.map((t) => ({
                label: `${t.name}${t.isCurrent ? ' (Current)' : ''}`,
                value: t._id,
              }))}
              required
            />
          </div>

          {positions.length > 0 ? (
            <Select
              label="Custom Position Being Transitioned"
              value={initiateForm.positionId}
              onChange={(e) => setInitiateForm({ ...initiateForm, positionId: e.target.value })}
              options={[
                { label: 'Select position or use legacy role...', value: '' },
                ...positions.map((pos) => ({ label: pos.name, value: pos._id })),
              ]}
            />
          ) : null}

          {!initiateForm.positionId && (
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
          )}

          {/* Campus Administrator Outgoing Officer Selector */}
          {user?.campusRole === 'CAMPUS_ADMIN' && (
            <Select
              label="Nominate Outgoing Officer"
              value={initiateForm.outgoingLeaderEmail}
              onChange={(e) =>
                setInitiateForm({ ...initiateForm, outgoingLeaderEmail: e.target.value })
              }
              options={[
                { label: 'Select eligible outgoing officer…', value: '' },
                ...eligibleOutgoingOfficers.map((m) => ({
                  label: `${m.userId?.fullName || 'User'} (${m.clubRole.replace('_', ' ')}) · ${
                    m.academicTermId?.name || 'Term'
                  }`,
                  value: m.userId?.email,
                })),
              ]}
              helperText="Campus administrators must nominate the outgoing officer explicitly."
              required
            />
          )}

          <Input
            label="Incoming Leader University Email"
            type="email"
            value={initiateForm.incomingLeaderEmail}
            onChange={(e) =>
              setInitiateForm({ ...initiateForm, incomingLeaderEmail: e.target.value })
            }
            placeholder="e.g. incoming.leader@pcu.edu"
            helperText="Candidate officer must have an active student account."
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowInitiateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Handover</Button>
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
            <Button type="submit">Sign Handover</Button>
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
              <span className="text-charcoal-500 block text-xs">Outgoing Officer:</span>
              <span className="font-bold">{activeHandover?.outgoingLeaderId?.fullName || 'Outgoing Officer'}</span>
              {activeHandover?.outgoingLeaderId?.email && (
                <span> ({activeHandover.outgoingLeaderId.email})</span>
              )}
            </div>
            <div>
              <span className="text-charcoal-500 block text-xs">Incoming Officer:</span>
              <span className="font-bold">{activeHandover?.incomingLeaderId?.fullName || 'Incoming Officer'}</span>
              {activeHandover?.incomingLeaderId?.email && (
                <span> ({activeHandover.incomingLeaderId.email})</span>
              )}
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

