import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
  UserPlus,
  Search,
  Calendar,
  Mail,
  Copy,
  CheckCircle2,
  XCircle,
  Shield,
  Ban,
  RotateCcw,
  Plus,
  Clock,
  Inbox,
  Users,
} from 'lucide-react';
import { clsx } from 'clsx';

export function Members() {
  const { clubId } = useParams();
  const { user, hasClubCapability } = useAuth();
  const { addToast } = useToast();

  const canInvite = hasClubCapability('members.invite', clubId);
  const canApproveRequests = hasClubCapability('members.approve_requests', clubId);
  const canAssignPositions = hasClubCapability('members.assign_positions', clubId);
  const canManageMembers = hasClubCapability('members.manage', clubId);

  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'requests' | 'invitations'
  const [members, setMembers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [lastInviteUrl, setLastInviteUrl] = useState('');

  const [selectedTermId, setSelectedTermId] = useState('ALL');
  const [selectedPositionFilter, setSelectedPositionFilter] = useState('ALL');
  const [includeHistory, setIncludeHistory] = useState(false);
  const [includeSuspended, setIncludeSuspended] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetMember, setAssignTargetMember] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(null);
  const [approvePositionId, setApprovePositionId] = useState('');

  const [inviteForm, setInviteForm] = useState({
    email: '',
    positionId: '',
    message: '',
  });
  const [assignForm, setAssignForm] = useState({
    positionId: '',
    academicTermId: '',
  });

  const listRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.member-row'), {
        opacity: [0, 1],
        translateY: [4, 0],
        duration: 280,
        delay: (el, i) => i * 25,
        ease: 'easeOutQuad',
      });
    },
    [members.length, selectedTermId, selectedPositionFilter, activeTab]
  );

  const fetchTerms = async () => {
    try {
      const campusId = user?.campusId?._id || user?.campusId;
      if (!campusId) return;
      const res = await fetch(`/api/v1/campuses/${campusId}/terms`, { credentials: 'include' });
      if (res && res.ok) {
        const json = await res.json();
        const loaded = json.data?.terms || [];
        setTerms(loaded);
        const current = loaded.find((t) => t.isCurrent) || loaded[0];
        if (current) {
          setAssignForm((prev) => ({
            ...prev,
            academicTermId: prev.academicTermId || current._id,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedTermId !== 'ALL') params.set('academicTermId', selectedTermId);
      if (includeHistory) params.set('includeHistory', 'true');
      if (includeSuspended) params.set('includeAllStatus', 'true');
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`/api/v1/clubs/${clubId}/members${query}`, { credentials: 'include' });
      if (res && res.ok) {
        const json = await res.json();
        setMembers(json.data?.members || []);
        setPositions(json.data?.positions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinRequests = async () => {
    if (!canApproveRequests) return;
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/join-requests`, { credentials: 'include' });
      if (res && res.ok) {
        const json = await res.json();
        setJoinRequests(json.data?.joinRequests || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvitations = async () => {
    if (!canInvite) return;
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/invitations`, { credentials: 'include' });
      if (res && res.ok) {
        const json = await res.json();
        setInvitations(json.data?.invitations || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchTerms();
      fetchJoinRequests();
      fetchInvitations();
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) {
      fetchMembers();
    }
  }, [clubId, selectedTermId, includeHistory, includeSuspended]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/invitations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteForm.email.trim(),
          intendedPositionIds: inviteForm.positionId ? [inviteForm.positionId] : [],
          message: inviteForm.message.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create invitation.');

      setLastInviteUrl(`${window.location.origin}${json.data.inviteUrl}`);
      addToast(`Invitation issued for ${inviteForm.email.trim()}`, 'success');
      setInviteForm({ email: '', positionId: '', message: '' });
      fetchInvitations();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRevokeInvite = async (invId) => {
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/invitations/${invId}/revoke`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Could not revoke invitation.');
      addToast('Invitation revoked.', 'success');
      fetchInvitations();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleAssignPosition = async (e) => {
    e.preventDefault();
    if (!assignTargetMember || !assignForm.positionId) return;
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/assignments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: assignTargetMember.userId._id,
          positionId: assignForm.positionId,
          academicTermId: assignForm.academicTermId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to assign position.');
      addToast('Position assigned successfully.', 'success');
      setShowAssignModal(false);
      fetchMembers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleEndAssignment = async (assignmentId) => {
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/assignments/${assignmentId}/end`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Ended from member directory' }),
      });
      if (!res.ok) throw new Error('Could not end position tenure.');
      addToast('Tenure ended and archived to history.', 'success');
      fetchMembers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleSuspend = async (member) => {
    const uid = member.userId?._id;
    if (!uid) return;
    const isSuspended = member.status === 'SUSPENDED';
    try {
      const res = await fetch(
        `/api/v1/clubs/${clubId}/members/${uid}/${isSuspended ? 'reinstate' : 'suspend'}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Updated by member administrator' }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Action failed.');
      addToast(isSuspended ? 'Member reinstated.' : 'Member suspended.', 'success');
      fetchMembers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReviewJoinRequest = async (requestId, decision, assignIds = []) => {
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/join-requests/${requestId}/review`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          assignPositionIds: assignIds,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to review request.');
      addToast(`Request ${decision.toLowerCase()}.`, 'success');
      setShowApproveModal(null);
      setApprovePositionId('');
      fetchJoinRequests();
      fetchMembers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const activePosIds = (m.assignedPositions || [])
        .filter((a) => a.status === 'ACTIVE')
        .map((a) => a.positionId?._id || a.positionId);

      const matchesPos =
        selectedPositionFilter === 'ALL' ||
        activePosIds.includes(selectedPositionFilter) ||
        m.clubRole === selectedPositionFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.userId?.fullName?.toLowerCase().includes(q) ||
        m.userId?.email?.toLowerCase().includes(q) ||
        m.title?.toLowerCase().includes(q);

      return matchesPos && matchesSearch;
    });
  }, [members, selectedPositionFilter, searchQuery]);

  const pendingRequests = joinRequests.filter((r) => r.status === 'PENDING');
  const pendingInvites = invitations.filter((i) => i.status === 'PENDING');

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Member Directory & Onboarding"
        subtitle="Manage active members, custom position assignments, term history, invitations, and join requests."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {canApproveRequests && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab('requests')}
              >
                <Inbox className="w-4 h-4 mr-1" />
                <span>Join Requests ({pendingRequests.length})</span>
              </Button>
            )}
            {canInvite && (
              <Button
                size="sm"
                onClick={() => {
                  setLastInviteUrl('');
                  setShowInviteModal(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                <span>Invite Member</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Real Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={clsx(
            'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
            activeTab === 'roster'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-mutedSlate hover:text-ink'
          )}
        >
          <Users className="w-4 h-4" />
          <span>Roster ({members.length})</span>
        </button>

        {canApproveRequests && (
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
              activeTab === 'requests'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-mutedSlate hover:text-ink'
            )}
          >
            <Inbox className="w-4 h-4" />
            <span>Join Requests ({pendingRequests.length})</span>
          </button>
        )}

        {canInvite && (
          <button
            type="button"
            onClick={() => setActiveTab('invitations')}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
              activeTab === 'invitations'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-mutedSlate hover:text-ink'
            )}
          >
            <Mail className="w-4 h-4" />
            <span>Invitations ({pendingInvites.length})</span>
          </button>
        )}
      </div>

      {/* ROSTER TAB */}
      {activeTab === 'roster' && (
        <Card>
          <CardHeader
            title={`Organization Roster (${filteredMembers.length})`}
            subtitle="All active members with position tenures scoped to the selected academic term"
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or position..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-border bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
                <select
                  value={selectedTermId}
                  onChange={(e) => setSelectedTermId(e.target.value)}
                  aria-label="Filter by academic term"
                  className="text-xs rounded-lg border border-border bg-white px-2.5 py-1.5 focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="ALL">All Academic Terms</option>
                  {terms.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} {t.isCurrent ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedPositionFilter}
                onChange={(e) => setSelectedPositionFilter(e.target.value)}
                aria-label="Filter by position"
                className="text-xs rounded-lg border border-border bg-white px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
              >
                <option value="ALL">All Positions</option>
                {positions.map((pos) => (
                  <option key={pos._id} value={pos._id}>
                    {pos.name}
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-1.5 text-xs text-mutedSlate cursor-pointer px-2">
                <input
                  type="checkbox"
                  checked={includeHistory}
                  onChange={(e) => setIncludeHistory(e.target.checked)}
                  className="rounded border-border text-brand-600"
                />
                <span>Show Term History</span>
              </label>

              {canManageMembers && (
                <label className="inline-flex items-center gap-1.5 text-xs text-mutedSlate cursor-pointer px-2">
                  <input
                    type="checkbox"
                    checked={includeSuspended}
                    onChange={(e) => setIncludeSuspended(e.target.checked)}
                    className="rounded border-border text-brand-600"
                  />
                  <span>Include Suspended</span>
                </label>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-charcoal-400">Loading organization roster...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-xs text-charcoal-400 border border-dashed border-border rounded-lg">
              No members match the selected filters.
            </div>
          ) : (
            <div ref={listRef} className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3">Assigned Positions</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Status</th>
                    {(canAssignPositions || canManageMembers) && (
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredMembers.map((m) => {
                    const activeAssignments = (m.assignedPositions || []).filter((a) => a.status === 'ACTIVE');
                    const pastAssignments = (m.assignedPositions || []).filter((a) => a.status !== 'ACTIVE');

                    return (
                      <tr key={m._id} className="member-row hover:bg-subtle/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              name={m.userId?.fullName || 'Member'}
                              size="sm"
                              src={m.userId?.avatarUrl}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-ink">{m.userId?.fullName}</span>
                                {m.isWorkspaceOwner && (
                                  <Badge variant="proposed" size="sm">Owner</Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-mutedSlate">
                                {m.userId?.email} {m.userId?.department ? `· ${m.userId.department}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1.5">
                            {activeAssignments.length > 0 ? (
                              activeAssignments.map((a) => (
                                <span
                                  key={a._id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 text-[11px] font-semibold"
                                >
                                  <span>{a.positionId?.name || m.title}</span>
                                  {canAssignPositions && (
                                    <button
                                      type="button"
                                      onClick={() => handleEndAssignment(a._id)}
                                      title="End tenure"
                                      className="text-brand-600 hover:text-coral-700 ml-0.5 cursor-pointer"
                                    >
                                      &times;
                                    </button>
                                  )}
                                </span>
                              ))
                            ) : (
                              <Badge variant="default" size="sm">
                                {m.title || String(m.clubRole || 'Member').replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          {includeHistory && pastAssignments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {pastAssignments.map((a) => (
                                <span
                                  key={a._id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-subtle text-mutedSlate text-[10px]"
                                >
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>
                                    Past: {a.positionId?.name} ({a.academicTermId?.name || 'Prior term'})
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <Badge variant={m.status === 'ACTIVE' ? 'approved' : 'urgent'} size="sm">
                            {m.status}
                          </Badge>
                        </td>
                        {(canAssignPositions || canManageMembers) && (
                          <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                            {canAssignPositions && positions.length > 0 && m.status === 'ACTIVE' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setAssignTargetMember(m);
                                  setAssignForm((prev) => ({
                                    ...prev,
                                    positionId: positions[0]?._id || '',
                                  }));
                                  setShowAssignModal(true);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                <span>Assign Position</span>
                              </Button>
                            )}
                            {canManageMembers && !m.isWorkspaceOwner && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleSuspend(m)}
                                title={m.status === 'SUSPENDED' ? 'Reinstate member' : 'Suspend member'}
                              >
                                {m.status === 'SUSPENDED' ? (
                                  <RotateCcw className="w-3.5 h-3.5 text-mint-700" />
                                ) : (
                                  <Ban className="w-3.5 h-3.5 text-coral-700" />
                                )}
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* JOIN REQUESTS TAB */}
      {activeTab === 'requests' && canApproveRequests && (
        <Card>
          <CardHeader
            title={`Incoming Join Requests (${joinRequests.length})`}
            subtitle="Review prospective members requesting to join this organization"
          />
          {joinRequests.length === 0 ? (
            <div className="py-10 text-center text-xs text-mutedSlate border border-dashed border-border rounded-xl">
              No join requests received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {joinRequests.map((reqItem) => (
                <div
                  key={reqItem._id}
                  className="p-4 rounded-xl border border-border bg-canvas/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-bold text-ink">
                        {reqItem.userId?.fullName}
                      </span>
                      <Badge
                        variant={
                          reqItem.status === 'APPROVED'
                            ? 'approved'
                            : reqItem.status === 'REJECTED'
                            ? 'urgent'
                            : 'proposed'
                        }
                        size="sm"
                      >
                        {reqItem.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-mutedSlate">
                      {reqItem.userId?.email} {reqItem.userId?.department ? `· ${reqItem.userId.department}` : ''}
                    </p>
                    {reqItem.message && (
                      <p className="text-xs text-ink bg-white border border-border rounded-lg px-3 py-1.5 mt-1">
                        {reqItem.message}
                      </p>
                    )}
                  </div>

                  {reqItem.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReviewJoinRequest(reqItem._id, 'REJECTED')}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1 text-coral-700" />
                        <span>Decline</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (positions.length > 0) {
                            setShowApproveModal(reqItem);
                          } else {
                            handleReviewJoinRequest(reqItem._id, 'APPROVED');
                          }
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Approve</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* INVITATIONS TAB */}
      {activeTab === 'invitations' && canInvite && (
        <Card>
          <CardHeader
            title={`Member Invitations (${invitations.length})`}
            subtitle="Track single-use expiring invite links issued by organization stewards"
            action={
              <Button
                size="sm"
                onClick={() => {
                  setLastInviteUrl('');
                  setShowInviteModal(true);
                }}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                <span>New Invite</span>
              </Button>
            }
          />
          {invitations.length === 0 ? (
            <div className="py-10 text-center text-xs text-mutedSlate border border-dashed border-border rounded-xl">
              No invitations issued yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {invitations.map((inv) => (
                <div
                  key={inv._id}
                  className="p-3.5 rounded-xl border border-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink">{inv.email}</span>
                      <Badge
                        variant={
                          inv.status === 'ACCEPTED'
                            ? 'approved'
                            : inv.status === 'PENDING'
                            ? 'proposed'
                            : 'urgent'
                        }
                        size="sm"
                      >
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-mutedSlate mt-0.5">
                      Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      {inv.intendedPositionIds?.length > 0
                        ? ` · Roles: ${inv.intendedPositionIds.map((p) => p.name).join(', ')}`
                        : ''}
                    </p>
                  </div>
                  {inv.status === 'PENDING' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRevokeInvite(inv._id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Member by Email"
      >
        <div className="space-y-4">
          <form onSubmit={handleSendInvite} className="space-y-4">
            <Input
              label="Recipient Email *"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="teammate@university.edu"
              required
            />
            <Select
              label="Pre-assigned Position (Optional)"
              value={inviteForm.positionId}
              onChange={(e) => setInviteForm((p) => ({ ...p, positionId: e.target.value }))}
              options={[
                { value: '', label: 'General Member (default capabilities)' },
                ...positions.map((pos) => ({ value: pos._id, label: pos.name })),
              ]}
            />
            <Textarea
              label="Personal Welcome Message"
              value={inviteForm.message}
              onChange={(e) => setInviteForm((p) => ({ ...p, message: e.target.value }))}
              rows={2}
              placeholder="Excited to have you join the team!"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowInviteModal(false)}>
                Close
              </Button>
              <Button type="submit">Generate Secure Invite Link</Button>
            </div>
          </form>

          {lastInviteUrl && (
            <div className="p-3 rounded-xl bg-mint-50 border border-mint-200 space-y-2 text-xs">
              <div className="font-bold text-mint-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Single-Use Invite Link Ready (Share Securely)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={lastInviteUrl}
                  className="flex-1 bg-white border border-mint-200 rounded px-2 py-1 text-[11px] font-mono text-ink"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(lastInviteUrl);
                    addToast('Invite link copied!', 'success');
                  }}
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Assign Position Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign Position to ${assignTargetMember?.userId?.fullName || ''}`}
      >
        <form onSubmit={handleAssignPosition} className="space-y-4">
          <Select
            label="Custom Organization Position *"
            value={assignForm.positionId}
            onChange={(e) => setAssignForm((p) => ({ ...p, positionId: e.target.value }))}
            options={positions.map((p) => ({
              value: p._id,
              label: `${p.name}${p.maxHolders ? ` (Max ${p.maxHolders})` : ''}`,
            }))}
            required
          />
          {terms.length > 0 && (
            <Select
              label="Academic Term"
              value={assignForm.academicTermId}
              onChange={(e) => setAssignForm((p) => ({ ...p, academicTermId: e.target.value }))}
              options={terms.map((t) => ({
                value: t._id,
                label: `${t.name}${t.isCurrent ? ' (Current)' : ''}`,
              }))}
            />
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign Position</Button>
          </div>
        </form>
      </Modal>

      {/* Approve Join Request + Optional Position Modal */}
      <Modal
        isOpen={Boolean(showApproveModal)}
        onClose={() => setShowApproveModal(null)}
        title={`Approve ${showApproveModal?.userId?.fullName || ''}`}
      >
        <div className="space-y-4">
          <Select
            label="Assign Initial Position (Optional)"
            value={approvePositionId}
            onChange={(e) => setApprovePositionId(e.target.value)}
            options={[
              { value: '', label: 'Active Member (No specific role yet)' },
              ...positions.map((pos) => ({ value: pos._id, label: pos.name })),
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowApproveModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleReviewJoinRequest(
                  showApproveModal._id,
                  'APPROVED',
                  approvePositionId ? [approvePositionId] : []
                )
              }
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
