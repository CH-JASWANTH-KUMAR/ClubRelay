import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Ticket,
  Building2,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Users,
  School,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';

export function Onboarding() {
  const { user, campus, refreshUser, switchClub } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [discoverResults, setDiscoverResults] = useState([]);

  // Join by code / token state
  const [joinCode, setJoinCode] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [selectedJoinClub, setSelectedJoinClub] = useState(null);

  // Campus setup request modal (Scenario E)
  const [showCampusRequestModal, setShowCampusRequestModal] = useState(false);
  const [campusReqForm, setCampusReqForm] = useState({
    universityName: '',
    domain: user?.email?.split('@')[1] || '',
    city: '',
    notes: '',
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/onboarding/summary', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setSummary(json.data);
        setDiscoverResults(json.data.campusOrganizations || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Could not load onboarding workspace options.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleSearchDiscovery = async (qVal = searchQuery, catVal = categoryFilter, codeVal = '') => {
    try {
      const params = new URLSearchParams();
      if (qVal.trim()) params.set('q', qVal.trim());
      if (catVal && catVal !== 'ALL') params.set('category', catVal);
      if (codeVal.trim()) params.set('joinCode', codeVal.trim().toUpperCase());

      const res = await fetch(`/api/v1/onboarding/discover?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setDiscoverResults(json.data.organizations || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinCodeLookup = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    await handleSearchDiscovery('', 'ALL', joinCode.trim());
  };

  const handleSubmitJoin = async (club, customMessage = '') => {
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/v1/clubs/${club._id}/join-requests`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: customMessage }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Unable to submit join request.');

      addToast(json.message || 'Submitted!', 'success');
      setSelectedJoinClub(null);
      setJoinMessage('');
      await refreshUser();
      if (json.data?.joinedImmediately) {
        switchClub(club);
        navigate(`/clubs/${club._id}`);
      } else {
        loadSummary();
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAcceptInvitation = async ({ invitationId, token }) => {
    setSubmittingAction(true);
    try {
      const rawToken = token?.includes('token=')
        ? new URLSearchParams(token.split('?')[1]).get('token')
        : token?.trim();

      const res = await fetch('/api/v1/invitations/accept', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invitationId ? { invitationId } : { token: rawToken }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Unable to accept invitation.');

      addToast(json.message, 'success');
      setTokenInput('');
      await refreshUser();
      if (json.data?.club?._id) {
        switchClub(json.data.club);
        navigate(`/clubs/${json.data.club._id}`);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSubmitCampusRequest = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await fetch('/api/v1/onboarding/campus-request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campusReqForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Could not submit campus request.');
      addToast('Campus setup request submitted!', 'success');
      setShowCampusRequestModal(false);
      loadSummary();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const allowCreation = summary?.campusPolicy?.allowStudentClubCreation !== false || user?.campusRole !== 'STUDENT';
  const pendingInvitations = summary?.pendingInvitations || [];
  const draftClubs = summary?.draftClubs || [];
  const myRequests = summary?.joinRequests || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Hero Onboarding Header */}
      <div className="rounded-2xl bg-surface border border-border shadow-card p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
            <School className="w-3.5 h-3.5" />
            <span>{campus?.name || 'Independent Organizer Account'}</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Welcome to ClubRelay, {user?.fullName?.split(' ')[0] || 'Organizer'}
          </h1>
          <p className="text-sm text-mutedSlate leading-relaxed">
            Set up your student organization workspace with your own roles and permissions, join an existing campus group, or accept a team invitation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {!campus && (
            <Button variant="secondary" onClick={() => setShowCampusRequestModal(true)}>
              <Building2 className="w-4 h-4 mr-1.5" />
              <span>Request Campus Setup</span>
            </Button>
          )}
          <Button
            onClick={() => navigate('/clubs/create')}
            disabled={!allowCreation}
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Create an Organization</span>
          </Button>
        </div>
      </div>

      {/* Personal / No-campus explanatory notice */}
      {!campus && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-700">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink">No university campus linked to your email domain yet</p>
              <p className="text-mutedSlate mt-0.5">
                You can still create an independent or invite-only organization right away, accept direct invitations, or request official campus onboarding.
              </p>
            </div>
          </div>
          {summary?.campusRequests?.length > 0 && (
            <Badge variant="proposed">Campus request submitted ({summary.campusRequests[0].domain})</Badge>
          )}
        </div>
      )}

      {/* Resumable Draft Organizations */}
      {draftClubs.length > 0 && (
        <div className="rounded-2xl bg-surface border border-brand-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Resume Saved Organization Drafts</span>
            </h2>
            <span className="text-xs text-mutedSlate">{draftClubs.length} in progress</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {draftClubs.map((draft) => (
              <div
                key={draft._id}
                className="rounded-xl border border-border bg-canvas/70 p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-heading text-sm font-bold text-ink truncate">{draft.name}</p>
                  <p className="text-xs text-mutedSlate">
                    {draft.code} · {draft.status === 'PENDING_REVIEW' ? 'Pending campus review' : `Step ${draft.setupStep || 1} of 8`}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/clubs/create/${draft._id}`)}
                >
                  <span>Resume</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Invitations Alert */}
      {pendingInvitations.length > 0 && (
        <div className="rounded-2xl bg-mint-50/70 border border-mint-200 p-5 space-y-3">
          <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-mint-700" />
            <span>Pending Organization Invitations ({pendingInvitations.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingInvitations.map((inv) => (
              <div
                key={inv._id}
                className="rounded-xl bg-white border border-mint-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold text-ink">{inv.club?.name}</span>
                    <Badge variant="approved" size="sm">{inv.club?.code}</Badge>
                  </div>
                  <p className="text-xs text-mutedSlate">
                    Invited by {inv.invitedBy?.fullName || 'Administrator'}
                    {inv.intendedPositions?.length > 0
                      ? ` for ${inv.intendedPositions.map((p) => p.name).join(', ')}`
                      : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={submittingAction}
                  onClick={() => handleAcceptInvitation({ invitationId: inv._id })}
                >
                  Accept Invitation
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three Primary Onboarding Paths */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-surface border border-border p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-base font-bold text-ink">1. Create an Organization</h2>
            <p className="text-xs text-mutedSlate leading-relaxed">
              Launch a technical society, cultural collective, lab, or committee with custom positions, permissions, and onboarding rules.
            </p>
          </div>
          {allowCreation ? (
            <Button className="w-full" onClick={() => navigate('/clubs/create')}>
              Start Setup Wizard
            </Button>
          ) : (
            <div className="text-xs text-coral-700 bg-coral-50 p-2.5 rounded-lg border border-coral-200">
              Campus policy restricts student creation. Contact a campus administrator.
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-surface border border-border p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-base font-bold text-ink">2. Join by Code</h2>
            <p className="text-xs text-mutedSlate leading-relaxed">
              Have an organization join code from a fair or orientation session? Look up the club directly below.
            </p>
          </div>
          <form onSubmit={handleJoinCodeLookup} className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="e.g. CRAFT26"
              aria-label="Organization join code"
              className="flex-1 h-9 rounded-lg border border-border bg-white px-3 text-xs uppercase text-ink focus:border-brand-500 focus:outline-none"
            />
            <Button type="submit" size="sm" variant="secondary">
              Find
            </Button>
          </form>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sunshine-50 text-sunshine-700 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <h2 className="font-heading text-base font-bold text-ink">3. Accept an Invitation</h2>
            <p className="text-xs text-mutedSlate leading-relaxed">
              Paste your invitation token or invite link shared by an organization steward to claim your role.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste invite token or link..."
              aria-label="Invitation token"
              className="flex-1 h-9 rounded-lg border border-border bg-white px-3 text-xs text-ink focus:border-brand-500 focus:outline-none"
            />
            <Button
              type="button"
              size="sm"
              disabled={!tokenInput.trim() || submittingAction}
              onClick={() => handleAcceptInvitation({ token: tokenInput })}
            >
              Join
            </Button>
          </div>
        </div>
      </div>

      {/* Discover Campus Organizations Directory */}
      <div className="rounded-2xl bg-surface border border-border p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">
              {campus ? `Organizations at ${campus.name}` : 'Discovered Organizations'}
            </h2>
            <p className="text-xs text-mutedSlate">
              Explore public groups you can join directly or request membership in.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-mutedSlate absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearchDiscovery(e.target.value, categoryFilter);
                }}
                placeholder="Search clubs..."
                className="h-9 pl-8 pr-3 rounded-lg border border-border bg-white text-xs text-ink focus:border-brand-500 focus:outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                handleSearchDiscovery(searchQuery, e.target.value);
              }}
              aria-label="Filter organizations by category"
              className="h-9 px-3 rounded-lg border border-border bg-white text-xs text-ink focus:border-brand-500 focus:outline-none"
            >
              <option value="ALL">All categories</option>
              <option value="TECHNICAL">Technical</option>
              <option value="CULTURAL">Cultural</option>
              <option value="ACADEMIC">Academic</option>
              <option value="ENTREPRENEURSHIP">Entrepreneurship</option>
              <option value="SPORTS">Sports</option>
              <option value="SOCIAL">Social</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-xl bg-subtle animate-pulse" />
            ))}
          </div>
        ) : discoverResults.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
            <Building2 className="w-7 h-7 text-mutedSlate mx-auto" />
            <p className="font-heading text-sm font-bold text-ink">No matching organizations found</p>
            <p className="text-xs text-mutedSlate">
              {campus
                ? 'Be the first to launch your club or society workspace on ClubRelay.'
                : 'Try entering a direct join code above or create an independent workspace.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoverResults.map((org) => (
              <div
                key={org._id}
                className="rounded-xl border border-border bg-canvas/50 p-4 flex flex-col justify-between space-y-3 hover:border-brand-300 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-sm font-bold text-ink">{org.name}</h3>
                    <Badge variant="planning" size="sm">{org.code}</Badge>
                  </div>
                  <p className="text-xs text-mutedSlate line-clamp-2">
                    {org.mission || org.description || `${org.category} student organization`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="inline-flex items-center gap-1 text-xs text-mutedSlate">
                    <Users className="w-3.5 h-3.5" />
                    <span>{org.memberCount} members</span>
                  </span>

                  {org.alreadyMember ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        switchClub(org);
                        navigate(`/clubs/${org._id}`);
                      }}
                    >
                      Open
                    </Button>
                  ) : org.pendingRequest ? (
                    <Badge variant="proposed">Request Pending</Badge>
                  ) : org.joinPolicy === 'OPEN' ? (
                    <Button
                      size="sm"
                      disabled={submittingAction}
                      onClick={() => handleSubmitJoin(org)}
                    >
                      Join Now
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedJoinClub(org)}
                    >
                      Request to Join
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {myRequests.length > 0 && (
          <div className="pt-3 border-t border-border flex flex-wrap items-center gap-2 text-xs text-mutedSlate">
            <span className="font-semibold text-ink">Your join requests:</span>
            {myRequests.map((req) => (
              <Badge
                key={req._id}
                variant={
                  req.status === 'APPROVED'
                    ? 'approved'
                    : req.status === 'REJECTED'
                    ? 'urgent'
                    : 'proposed'
                }
              >
                {req.clubId?.name || 'Organization'}: {req.status}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Join Request Note Modal */}
      <Modal
        isOpen={Boolean(selectedJoinClub)}
        onClose={() => setSelectedJoinClub(null)}
        title={`Request to Join ${selectedJoinClub?.name || ''}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-mutedSlate">
            Add a short note introducing your background or teams you are excited to collaborate with.
          </p>
          <Textarea
            label="Introduction Note (Optional)"
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            placeholder="Hi team, I'd love to contribute to workshops and design..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelectedJoinClub(null)}>
              Cancel
            </Button>
            <Button
              disabled={submittingAction}
              onClick={() => handleSubmitJoin(selectedJoinClub, joinMessage)}
            >
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Campus Setup Request Modal (Scenario E) */}
      <Modal
        isOpen={showCampusRequestModal}
        onClose={() => setShowCampusRequestModal(false)}
        title="Request Campus Workspace Onboarding"
      >
        <form onSubmit={handleSubmitCampusRequest} className="space-y-4">
          <Input
            label="University or Institution Name"
            value={campusReqForm.universityName}
            onChange={(e) => setCampusReqForm((prev) => ({ ...prev, universityName: e.target.value }))}
            required
            placeholder="e.g. Horizon State University"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Official Email Domain"
              value={campusReqForm.domain}
              onChange={(e) => setCampusReqForm((prev) => ({ ...prev, domain: e.target.value }))}
              required
              placeholder="university.edu"
            />
            <Input
              label="City / Location"
              value={campusReqForm.city}
              onChange={(e) => setCampusReqForm((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="City, Country"
            />
          </div>
          <Textarea
            label="Additional Context (Optional)"
            value={campusReqForm.notes}
            onChange={(e) => setCampusReqForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Student council contact or clubs planning to onboard..."
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowCampusRequestModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingAction}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>Submit Campus Request</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

