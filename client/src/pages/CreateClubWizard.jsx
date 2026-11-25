import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Shield,
  Users,
  Calendar,
  Mail,
  Rocket,
  Copy,
  Layers,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PermissionMatrixEditor } from '../components/structure/PermissionMatrixEditor';
import { OrgChartCanvas } from '../components/structure/OrgChartCanvas';
import { clsx } from 'clsx';

const WIZARD_STEPS = [
  { id: 1, title: 'Basic Details', short: 'Details' },
  { id: 2, title: 'Governance', short: 'Governance' },
  { id: 3, title: 'Template', short: 'Template' },
  { id: 4, title: 'Structure Builder', short: 'Structure' },
  { id: 5, title: 'Permissions', short: 'Permissions' },
  { id: 6, title: 'Academic Term', short: 'Term' },
  { id: 7, title: 'Invitations', short: 'Invites' },
  { id: 8, title: 'Review & Launch', short: 'Launch' },
];

export function CreateClubWizard() {
  const { clubId: paramClubId } = useParams();
  const navigate = useNavigate();
  const { campus, user, refreshUser, switchClub } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [clubId, setClubId] = useState(paramClubId || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Reference metadata from /onboarding/summary
  const [templates, setTemplates] = useState([]);
  const [permissionsCatalogue, setPermissionsCatalogue] = useState([]);
  const [facultyCoordinators, setFacultyCoordinators] = useState([]);
  const [campusPolicy, setCampusPolicy] = useState({});
  const [terms, setTerms] = useState([]);

  // Step 1 & 2 Form State
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    code: '',
    category: 'TECHNICAL',
    customCategory: '',
    mission: '',
    description: '',
    website: '',
    contactEmail: '',
    visibility: campus ? 'PUBLIC_CAMPUS' : 'PRIVATE',
    joinPolicy: 'REQUEST_APPROVAL',
    joinCode: '',
    facultyCoordinatorId: '',
    governance: {
      requireFacultyAdvisor: false,
      requireApprovalForEvents: Boolean(campus),
      allowPublicJoinRequests: true,
      allowSelfSignupWithCode: true,
    },
  });

  // Step 3-5 Structure State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('tech_club');
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedPositionId, setSelectedPositionId] = useState(null);

  const [newDeptForm, setNewDeptForm] = useState({ name: '', color: '#315BDB' });
  const [newPosForm, setNewPosForm] = useState({
    name: '',
    description: '',
    departmentId: '',
    parentPositionId: '',
    isLeadership: false,
    maxHolders: '',
  });

  // Step 6 & 7 State
  const [termMode, setTermMode] = useState('existing'); // 'existing' | 'new'
  const [selectedTermId, setSelectedTermId] = useState('');
  const [newTermForm, setNewTermForm] = useState({
    name: '2025-2026',
    startDate: '2025-08-01',
    endDate: '2026-05-31',
  });
  const [creatorPositionIds, setCreatorPositionIds] = useState([]);
  const [stagedInvites, setStagedInvites] = useState([]);
  const [inviteDraft, setInviteDraft] = useState({
    email: '',
    positionId: '',
    message: '',
  });
  const [activationResult, setActivationResult] = useState(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const sumRes = await fetch('/api/v1/onboarding/summary', { credentials: 'include' });
        if (sumRes.ok) {
          const sumJson = await sumRes.json();
          setTemplates(sumJson.data.templates || []);
          setPermissionsCatalogue(sumJson.data.permissionsCatalogue || []);
          setFacultyCoordinators(sumJson.data.facultyCoordinators || []);
          setCampusPolicy(sumJson.data.campusPolicy || {});
        }

        const campusId = campus?._id || user?.campusId?._id || user?.campusId;
        if (campusId) {
          const termsRes = await fetch(`/api/v1/campuses/${campusId}/terms`, {
            credentials: 'include',
          });
          if (termsRes.ok) {
            const termsJson = await termsRes.json();
            const loadedTerms = termsJson.data?.terms || [];
            setTerms(loadedTerms);
            const current = loadedTerms.find((t) => t.isCurrent) || loadedTerms[0];
            if (current) setSelectedTermId(current._id);
            if (loadedTerms.length === 0) setTermMode('new');
          }
        } else {
          setTermMode('new');
        }

        if (paramClubId) {
          const [clubRes, structRes] = await Promise.all([
            fetch(`/api/v1/clubs/${paramClubId}`, { credentials: 'include' }),
            fetch(`/api/v1/clubs/${paramClubId}/structure`, { credentials: 'include' }),
          ]);
          if (clubRes.ok) {
            const clubJson = await clubRes.json();
            const c = clubJson.data.club;
            setClubId(c._id);
            setForm({
              name: c.name || '',
              shortName: c.shortName || '',
              code: c.code || '',
              category: c.category || 'TECHNICAL',
              customCategory: c.customCategory || '',
              mission: c.mission || '',
              description: c.description || '',
              website: c.website || '',
              contactEmail: c.contactEmail || '',
              visibility: c.visibility || 'PUBLIC_CAMPUS',
              joinPolicy: c.joinPolicy || 'REQUEST_APPROVAL',
              joinCode: c.joinCode || '',
              facultyCoordinatorId: c.facultyCoordinatorId?._id || c.facultyCoordinatorId || '',
              governance: c.governance || {
                requireFacultyAdvisor: false,
                requireApprovalForEvents: true,
                allowPublicJoinRequests: true,
                allowSelfSignupWithCode: true,
              },
            });
            setSelectedTemplateKey(c.templateKey || 'custom');
            if (c.activeTermId?._id || c.activeTermId) {
              setSelectedTermId(c.activeTermId?._id || c.activeTermId);
            }
            if (c.setupStep && c.setupStep >= 1 && c.setupStep <= 8) {
              setStep(c.setupStep);
            }
          }
          if (structRes.ok) {
            const sJson = await structRes.json();
            setDepartments(sJson.data.departments || []);
            const loadedPos = sJson.data.positions || [];
            setPositions(loadedPos);
            if (loadedPos[0]) setSelectedPositionId(loadedPos[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
        addToast('Failed to load organization setup data.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [paramClubId]);

  const selectedPosition = useMemo(
    () => positions.find((p) => p._id === selectedPositionId) || positions[0] || null,
    [positions, selectedPositionId]
  );

  const ensureDraftSaved = async (nextStep) => {
    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      facultyCoordinatorId: form.facultyCoordinatorId || null,
      setupStep: nextStep,
      templateKey: selectedTemplateKey,
    };

    if (!clubId) {
      const res = await fetch('/api/v1/clubs/wizard/draft', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Could not create organization draft.');
      setClubId(json.data.club._id);
      return json.data.club._id;
    }

    const res = await fetch(`/api/v1/clubs/${clubId}/wizard/draft`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Could not update draft.');
    return clubId;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (form.name.trim().length < 2 || form.code.trim().length < 2) {
        addToast('Please provide an organization name and short code (min 2 chars).', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const activeId = await ensureDraftSaved(Math.min(8, step + 1));

      // When leaving Step 3, apply the chosen starter template cleanly if needed
      if (step === 3 && activeId) {
        const res = await fetch(`/api/v1/clubs/${activeId}/wizard/apply-template`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateKey: selectedTemplateKey,
            replaceExisting: true,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message || 'Could not apply starter template.');
        setDepartments(json.data.departments || []);
        const newPositions = json.data.positions || [];
        setPositions(newPositions);
        setSelectedPositionId(newPositions[0]?._id || null);
      }

      setStep((prev) => Math.min(8, prev + 1));
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptForm.name.trim() || !clubId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/departments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeptForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Could not add department.');
      setDepartments((prev) => [...prev, json.data.department]);
      setNewDeptForm({ name: '', color: '#315BDB' });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPosition = async (e) => {
    e.preventDefault();
    if (!newPosForm.name.trim() || !clubId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/positions`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPosForm.name.trim(),
          description: newPosForm.description.trim(),
          departmentId: newPosForm.departmentId || null,
          parentPositionId: newPosForm.parentPositionId || null,
          isLeadership: Boolean(newPosForm.isLeadership),
          maxHolders: newPosForm.maxHolders ? Number(newPosForm.maxHolders) : null,
          permissions: ['club.view_overview', 'events.view', 'projects.view'],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Could not create position.');
      const created = json.data.position;
      setPositions((prev) => [...prev, created]);
      setSelectedPositionId(created._id);
      setNewPosForm({
        name: '',
        description: '',
        departmentId: '',
        parentPositionId: '',
        isLeadership: false,
        maxHolders: '',
      });
      addToast(`Added position "${created.name}".`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePosition = async (posId) => {
    if (!clubId) return;
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/positions/${posId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Could not remove position.');
      setPositions((prev) => prev.filter((p) => p._id !== posId));
      if (selectedPositionId === posId) {
        setSelectedPositionId(null);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdatePositionPermissions = async (posId, nextPermissions) => {
    if (!clubId) return;
    setPositions((prev) =>
      prev.map((p) => (p._id === posId ? { ...p, permissions: nextPermissions } : p))
    );
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/positions/${posId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: nextPermissions }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || 'Failed to save position permissions.');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleStageInvite = (e) => {
    e.preventDefault();
    const email = inviteDraft.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      addToast('Enter a valid recipient email address.', 'error');
      return;
    }
    setStagedInvites((prev) => [
      ...prev,
      {
        email,
        intendedPositionIds: inviteDraft.positionId ? [inviteDraft.positionId] : [],
        message: inviteDraft.message.trim(),
      },
    ]);
    setInviteDraft({ email: '', positionId: '', message: '' });
  };

  const handleActivate = async () => {
    if (!clubId) return;
    setSaving(true);
    try {
      await ensureDraftSaved(8);
      const body = {
        creatorPositionIds,
        invitations: stagedInvites,
      };
      if (termMode === 'existing' && selectedTermId) {
        body.termId = selectedTermId;
      } else if (newTermForm.name.trim()) {
        body.newTermName = newTermForm.name.trim();
        body.newTermStartDate = newTermForm.startDate;
        body.newTermEndDate = newTermForm.endDate;
      }

      const res = await fetch(`/api/v1/clubs/${clubId}/wizard/activate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to activate organization.');

      addToast(json.message || 'Organization activated!', 'success');
      switchClub(json.data.club);
      await refreshUser();

      if (json.data.createdInvitations?.length > 0) {
        setActivationResult(json.data);
      } else {
        navigate(`/clubs/${clubId}`);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-sm text-mutedSlate">
        Loading Organization Setup Wizard...
      </div>
    );
  }

  if (activationResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="rounded-2xl bg-surface border border-border shadow-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-mint-50 text-mint-700 flex items-center justify-center">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-extrabold text-ink">
                {activationResult.club.name} is Ready
              </h1>
              <p className="text-xs text-mutedSlate">
                Copy your single-use invitation links below before entering the workspace.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {activationResult.createdInvitations.map((inv) => (
              <div
                key={inv._id}
                className="p-3 rounded-xl bg-canvas border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink">{inv.email}</p>
                  <p className="text-[11px] font-mono text-mutedSlate truncate">{inv.inviteUrl}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(`${window.location.origin}${inv.inviteUrl}`);
                    addToast(`Copied invite link for ${inv.email}`, 'success');
                  }}
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy Link</span>
                </Button>
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={() => navigate(`/clubs/${activationResult.club._id}`)}>
            <span>Enter Organization Workspace</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-mutedSlate hover:text-brand-600 mb-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Onboarding Hub</span>
          </Link>
          <h1 className="font-heading text-2xl font-extrabold text-ink tracking-tight">
            {clubId ? `Setup: ${form.name || 'Draft Organization'}` : 'Create a New Organization'}
          </h1>
          <p className="text-xs text-mutedSlate mt-0.5">
            Configure identity, governance, custom hierarchy, explicit permissions, and launching term.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {clubId && (
            <Badge variant="proposed">Draft Saved</Badge>
          )}
          <Badge variant="planning">Step {step} of 8</Badge>
        </div>
      </div>

      {/* Horizontal Step Bar */}
      <div className="rounded-xl bg-surface border border-border p-3 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[640px] gap-1">
          {WIZARD_STEPS.map((item) => {
            const done = item.id < step;
            const current = item.id === step;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.id > step && !clubId}
                onClick={() => {
                  if (item.id <= step || clubId) setStep(item.id);
                }}
                className={clsx(
                  'flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer disabled:opacity-50',
                  current
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : done
                    ? 'text-mint-700 hover:bg-subtle'
                    : 'text-mutedSlate hover:bg-subtle'
                )}
              >
                <span
                  className={clsx(
                    'w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0',
                    current
                      ? 'bg-brand-600 text-white'
                      : done
                      ? 'bg-mint-600 text-white'
                      : 'bg-subtle text-mutedSlate'
                  )}
                >
                  {done ? <Check className="w-3 h-3" /> : item.id}
                </span>
                <span className="text-xs font-semibold truncate">{item.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Surface */}
      <div className="rounded-2xl bg-surface border border-border shadow-card p-6 sm:p-8 space-y-6">
        {/* STEP 1: Basic Organization Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">Step 1: Basic Organization Details</h2>
              <p className="text-xs text-mutedSlate mt-0.5">
                Set how members discover and recognize your student organization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Organization Name *"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Open Design Collective"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Short Name"
                  value={form.shortName}
                  onChange={(e) => setForm((p) => ({ ...p, shortName: e.target.value }))}
                  placeholder="e.g. ODC"
                />
                <Input
                  label="Organization Code *"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. CRAFT"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                options={[
                  { value: 'TECHNICAL', label: 'Technical & Engineering' },
                  { value: 'CULTURAL', label: 'Cultural & Arts' },
                  { value: 'ACADEMIC', label: 'Academic & Research' },
                  { value: 'ENTREPRENEURSHIP', label: 'Entrepreneurship' },
                  { value: 'SPORTS', label: 'Sports & Athletics' },
                  { value: 'SOCIAL', label: 'Social & Community' },
                  { value: 'CUSTOM', label: 'Custom Category' },
                ]}
              />
              {form.category === 'CUSTOM' && (
                <Input
                  label="Custom Category Name"
                  value={form.customCategory}
                  onChange={(e) => setForm((p) => ({ ...p, customCategory: e.target.value }))}
                  placeholder="e.g. Debate & Policy"
                />
              )}
              <Select
                label="Workspace Visibility"
                value={form.visibility}
                onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}
                options={
                  campus
                    ? [
                        { value: 'PUBLIC_CAMPUS', label: 'Visible across campus directory' },
                        { value: 'INVITE_ONLY', label: 'Hidden (join by code or invitation)' },
                        { value: 'PRIVATE', label: 'Private workspace' },
                      ]
                    : [
                        { value: 'PRIVATE', label: 'Private workspace' },
                        { value: 'INVITE_ONLY', label: 'Invite or join code only' },
                      ]
                }
              />
              <Select
                label="Join Policy"
                value={form.joinPolicy}
                onChange={(e) => setForm((p) => ({ ...p, joinPolicy: e.target.value }))}
                options={[
                  { value: 'REQUEST_APPROVAL', label: 'Request & Review Approval' },
                  { value: 'OPEN', label: 'Open Self-Join (Instant)' },
                  { value: 'INVITE_ONLY', label: 'Invitation Only' },
                ]}
              />
            </div>

            <Textarea
              label="Mission Statement"
              value={form.mission}
              onChange={(e) => setForm((p) => ({ ...p, mission: e.target.value }))}
              placeholder="What purpose brings your members together across academic years?"
              rows={2}
            />

            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Share activities, recurring programs, and onboarding highlights..."
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Optional Join Code"
                value={form.joinCode}
                onChange={(e) => setForm((p) => ({ ...p, joinCode: e.target.value.toUpperCase() }))}
                placeholder="e.g. DESIGN26"
                helperText="Allow peers to find and join quickly at orientations"
              />
              <Input
                label="Website (Optional)"
                value={form.website}
                onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://club.university.edu"
              />
              <Input
                label="Public Contact Email (Optional)"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                placeholder="hello@club.edu"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Governance & Campus Policy */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">Step 2: Governance & Campus Alignment</h2>
              <p className="text-xs text-mutedSlate mt-0.5">
                Configure advisor oversight, event submission defaults, and campus policy requirements.
              </p>
            </div>

            {campusPolicy?.requireFacultyApprovalForNewClubs && (
              <div className="p-3.5 rounded-xl bg-sunshine-50 border border-sunshine-200 flex items-start gap-2.5 text-xs text-ink-700">
                <AlertCircle className="w-4 h-4 text-sunshine-700 shrink-0 mt-0.5" />
                <span>
                  Your campus requires faculty or administrator sign-off before student-created organizations become publicly active. Completing setup submits it for review.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultyCoordinators.length > 0 && (
                <Select
                  label={
                    campusPolicy?.requireFacultyAdvisorOnClubs
                      ? 'Faculty Advisor * (Required by Campus)'
                      : 'Faculty Advisor (Optional)'
                  }
                  value={form.facultyCoordinatorId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, facultyCoordinatorId: e.target.value }))
                  }
                  options={[
                    { value: '', label: 'Select a faculty advisor (optional)...' },
                    ...facultyCoordinators.map((f) => ({
                      value: f._id,
                      label: `${f.fullName} (${f.department || 'Faculty'})`,
                    })),
                  ]}
                />
              )}

              <div className="rounded-xl border border-border bg-canvas/70 p-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={form.governance.requireApprovalForEvents}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        governance: { ...p.governance, requireApprovalForEvents: e.target.checked },
                      }))
                    }
                    className="mt-0.5 rounded border-border text-brand-600"
                  />
                  <div>
                    <p className="font-semibold text-ink">Require Faculty Approval for Events</p>
                    <p className="text-mutedSlate">Route formal event proposals through your assigned campus reviewer.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={form.governance.allowPublicJoinRequests}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        governance: { ...p.governance, allowPublicJoinRequests: e.target.checked },
                      }))
                    }
                    className="mt-0.5 rounded border-border text-brand-600"
                  />
                  <div>
                    <p className="font-semibold text-ink">Allow Membership Requests</p>
                    <p className="text-mutedSlate">Prospective students can submit join requests from the campus directory.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Starter Template Selection */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">Step 3: Choose a Starting Structure</h2>
              <p className="text-xs text-mutedSlate mt-0.5">
                Pick a template to jumpstart your teams and positions, or start completely blank. Every title and permission stays 100% editable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {templates.map((tpl) => {
                const isSelected = selectedTemplateKey === tpl.key;
                return (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => setSelectedTemplateKey(tpl.key)}
                    className={clsx(
                      'p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer',
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                        : 'border-border bg-white hover:border-brand-300'
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading text-sm font-bold text-ink">{tpl.name}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-mutedSlate leading-snug">{tpl.tagline}</p>
                    </div>

                    <div className="text-[11px] font-semibold text-brand-700 pt-2 border-t border-border/60">
                      {tpl.positions.length === 0
                        ? '0 preset positions (Blank canvas)'
                        : `${tpl.positions.length} customizable roles · ${tpl.departments.length} teams`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Structure Builder */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-heading text-lg font-bold text-ink">Step 4: Customize Positions & Teams</h2>
                <p className="text-xs text-mutedSlate mt-0.5">
                  Create multiple top-level leaders, flat peers, or nested coordinators. No rank is mandatory.
                </p>
              </div>
              <Badge variant="planning">{positions.length} Positions · {departments.length} Departments</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Quick Add Forms */}
              <div className="space-y-4">
                <form onSubmit={handleAddDepartment} className="rounded-xl border border-border bg-canvas/50 p-4 space-y-3">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-mutedSlate flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-brand-600" />
                    <span>Optional Teams / Departments</span>
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDeptForm.name}
                      onChange={(e) => setNewDeptForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Design Studio"
                      className="flex-1 h-9 rounded-lg border border-border bg-white px-3 text-xs text-ink"
                    />
                    <input
                      type="color"
                      value={newDeptForm.color}
                      onChange={(e) => setNewDeptForm((p) => ({ ...p, color: e.target.value }))}
                      className="w-9 h-9 rounded border border-border bg-white cursor-pointer"
                      aria-label="Department accent color"
                    />
                    <Button type="submit" size="sm" variant="secondary" disabled={!newDeptForm.name.trim()}>
                      Add Team
                    </Button>
                  </div>
                  {departments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {departments.map((d) => (
                        <span
                          key={d._id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-border text-xs font-medium text-ink"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span>{d.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </form>

                <form onSubmit={handleAddPosition} className="rounded-xl border border-border bg-canvas/50 p-4 space-y-3">
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-mutedSlate flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-brand-600" />
                    <span>Add Custom Position</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Input
                      label="Position Title"
                      value={newPosForm.name}
                      onChange={(e) => setNewPosForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Guild Steward"
                    />
                    <Input
                      label="Max Holders (Blank = Unlimited)"
                      type="number"
                      min="1"
                      value={newPosForm.maxHolders}
                      onChange={(e) => setNewPosForm((p) => ({ ...p, maxHolders: e.target.value }))}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Select
                      label="Team / Department"
                      value={newPosForm.departmentId}
                      onChange={(e) => setNewPosForm((p) => ({ ...p, departmentId: e.target.value }))}
                      options={[
                        { value: '', label: 'None (Org-wide)' },
                        ...departments.map((d) => ({ value: d._id, label: d.name })),
                      ]}
                    />
                    <Select
                      label="Reports To (Org Chart)"
                      value={newPosForm.parentPositionId}
                      onChange={(e) => setNewPosForm((p) => ({ ...p, parentPositionId: e.target.value }))}
                      options={[
                        { value: '', label: 'Top-level root position' },
                        ...positions.map((p) => ({ value: p._id, label: p.name })),
                      ]}
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-ink cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPosForm.isLeadership}
                      onChange={(e) => setNewPosForm((p) => ({ ...p, isLeadership: e.target.checked }))}
                      className="rounded border-border text-brand-600"
                    />
                    <span>Highlight on Organization Overview as Leadership</span>
                  </label>
                  <div>
                    <Button type="submit" size="sm" disabled={!newPosForm.name.trim() || saving}>
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Add Position</span>
                    </Button>
                  </div>
                </form>
              </div>

              {/* Position List */}
              <div className="space-y-2.5">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-mutedSlate">
                  Defined Positions ({positions.length})
                </h3>
                {positions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-mutedSlate">
                    No positions yet. Use the form on the left to add positions tailored to your group.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {positions.map((pos) => (
                      <div
                        key={pos._id}
                        className="rounded-xl border border-border bg-white p-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-sm font-bold text-ink">{pos.name}</span>
                            {pos.isLeadership && <Badge variant="planning" size="sm">Leadership</Badge>}
                          </div>
                          <p className="text-xs text-mutedSlate">
                            {pos.permissions?.length || 0} capabilities ·{' '}
                            {pos.maxHolders ? `Max ${pos.maxHolders} holder(s)` : 'Unlimited holders'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeletePosition(pos._id)}
                          aria-label={`Remove ${pos.name}`}
                          className="p-1.5 rounded-lg text-mutedSlate hover:text-coral-700 hover:bg-coral-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {positions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-mutedSlate">
                  Live Organization Chart Preview
                </h3>
                <OrgChartCanvas positions={positions} departments={departments} />
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Permissions Configuration */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">Step 5: Configure Position Capabilities</h2>
              <p className="text-xs text-mutedSlate mt-0.5">
                Select any position on the left to inspect or customize its exact permissions.
              </p>
            </div>

            {positions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
                <Shield className="w-7 h-7 text-mutedSlate mx-auto" />
                <p className="font-heading text-sm font-bold text-ink">No custom positions created</p>
                <p className="text-xs text-mutedSlate">
                  As Workspace Owner, you still retain full setup authority and can add positions anytime in Structure & Roles.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-4 space-y-2">
                  {positions.map((pos) => (
                    <button
                      key={pos._id}
                      type="button"
                      onClick={() => setSelectedPositionId(pos._id)}
                      className={clsx(
                        'w-full text-left rounded-xl border p-3 transition-colors cursor-pointer',
                        selectedPosition?._id === pos._id
                          ? 'border-brand-600 bg-brand-50/70'
                          : 'border-border bg-white hover:bg-subtle/60'
                      )}
                    >
                      <div className="font-heading text-sm font-bold text-ink">{pos.name}</div>
                      <div className="text-xs text-mutedSlate mt-0.5">
                        {pos.permissions?.length || 0} permissions configured
                      </div>
                    </button>
                  ))}
                </div>
                <div className="lg:col-span-8">
                  {selectedPosition && (
                    <PermissionMatrixEditor
                      modules={permissionsCatalogue}
                      selectedPermissions={selectedPosition.permissions || []}
                      onChange={(next) => handleUpdatePositionPermissions(selectedPosition._id, next)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: Academic Term & Creator Initial Position */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">Step 6: Academic Term & Your Initial Role</h2>
              <p className="text-xs text-mutedSlate mt-0.5">
                Tenures and position continuity handovers are organized around academic terms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-border bg-canvas/50 p-4 space-y-4">
                <h3 className="font-heading text-sm font-bold text-ink flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <span>Active Academic Term</span>
                </h3>

                {terms.length > 0 && (
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setTermMode('existing')}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg font-semibold cursor-pointer border',
                        termMode === 'existing'
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-ink border-border'
                      )}
                    >
                      Use Campus Term
                    </button>
                    <button
                      type="button"
                      onClick={() => setTermMode('new')}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg font-semibold cursor-pointer border',
                        termMode === 'new'
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-ink border-border'
                      )}
                    >
                      Create New Term
                    </button>
                  </div>
                )}

                {termMode === 'existing' && terms.length > 0 ? (
                  <Select
                    label="Select Active Term"
                    value={selectedTermId}
                    onChange={(e) => setSelectedTermId(e.target.value)}
                    options={terms.map((t) => ({
                      value: t._id,
                      label: `${t.name}${t.isCurrent ? ' (Current)' : ''}`,
                    }))}
                  />
                ) : (
                  <div className="space-y-3">
                    <Input
                      label="Term Label"
                      value={newTermForm.name}
                      onChange={(e) => setNewTermForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. 2025-2026"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Start Date"
                        type="date"
                        value={newTermForm.startDate}
                        onChange={(e) => setNewTermForm((p) => ({ ...p, startDate: e.target.value }))}
                      />
                      <Input
                        label="End Date"
                        type="date"
                        value={newTermForm.endDate}
                        onChange={(e) => setNewTermForm((p) => ({ ...p, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-canvas/50 p-4 space-y-3">
                <h3 className="font-heading text-sm font-bold text-ink flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-600" />
                  <span>Your Starting Position(s)</span>
                </h3>
                <p className="text-xs text-mutedSlate">
                  As Workspace Owner ({user?.fullName}), you may optionally claim initial position(s) right away.
                </p>

                {positions.length === 0 ? (
                  <p className="text-xs text-mutedSlate italic">No custom positions defined yet.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {positions.map((pos) => {
                      const checked = creatorPositionIds.includes(pos._id);
                      return (
                        <label
                          key={pos._id}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-white cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setCreatorPositionIds((prev) =>
                                prev.includes(pos._id)
                                  ? prev.filter((id) => id !== pos._id)
                                  : [...prev, pos._id]
                              );
                            }}
                            className="rounded border-border text-brand-600"
                          />
                          <span className="font-semibold text-ink">{pos.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Founding Invitations */}
        {step === 7 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">Step 7: Invite Initial Teammates (Optional)</h2>
              <p className="text-xs text-mutedSlate mt-0.5">
                Generate secure single-use invitation links for your founding members and pre-assign positions.
              </p>
            </div>

            <form onSubmit={handleStageInvite} className="rounded-xl border border-border bg-canvas/50 p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <Input
                  label="Member Email"
                  type="email"
                  value={inviteDraft.email}
                  onChange={(e) => setInviteDraft((p) => ({ ...p, email: e.target.value }))}
                  placeholder="teammate@university.edu"
                />
              </div>
              <div className="md:col-span-4">
                <Select
                  label="Intended Position (Optional)"
                  value={inviteDraft.positionId}
                  onChange={(e) => setInviteDraft((p) => ({ ...p, positionId: e.target.value }))}
                  options={[
                    { value: '', label: 'General Member (no specific role)' },
                    ...positions.map((p) => ({ value: p._id, label: p.name })),
                  ]}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Note"
                  value={inviteDraft.message}
                  onChange={(e) => setInviteDraft((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Join us!"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full" variant="secondary">
                  Add Invite
                </Button>
              </div>
            </form>

            {stagedInvites.length > 0 ? (
              <div className="space-y-2">
                {stagedInvites.map((inv, idx) => {
                  const posObj = positions.find((p) => p._id === inv.intendedPositionIds?.[0]);
                  return (
                    <div
                      key={`${inv.email}-${idx}`}
                      className="rounded-xl border border-border bg-white px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-brand-600" />
                        <div>
                          <p className="text-xs font-bold text-ink">{inv.email}</p>
                          <p className="text-[11px] text-mutedSlate">
                            {posObj ? `Assigned position: ${posObj.name}` : 'General Membership'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStagedInvites((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-xs font-semibold text-coral-700 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-mutedSlate">
                No invitations staged yet. You can also send invites anytime after launching from the Members directory.
              </p>
            )}
          </div>
        )}

        {/* STEP 8: Review & Activate */}
        {step === 8 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-ink">Step 8: Review & Activate Workspace</h2>
                <p className="text-xs text-mutedSlate">
                  Verify your setup details before launching your organization workspace.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-canvas/50 p-4 space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-mutedSlate">Organization</div>
                <div className="font-heading text-base font-bold text-ink">{form.name}</div>
                <div className="text-xs text-mutedSlate">
                  {form.code} · {form.category === 'CUSTOM' ? form.customCategory || 'Custom' : form.category}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-canvas/50 p-4 space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-mutedSlate">Structure</div>
                <div className="font-heading text-base font-bold text-ink">
                  {positions.length} Positions · {departments.length} Teams
                </div>
                <div className="text-xs text-mutedSlate">Template: {selectedTemplateKey}</div>
              </div>
              <div className="rounded-xl border border-border bg-canvas/50 p-4 space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-mutedSlate">Onboarding & Term</div>
                <div className="font-heading text-base font-bold text-ink">
                  {termMode === 'existing'
                    ? terms.find((t) => t._id === selectedTermId)?.name || 'Current Term'
                    : newTermForm.name}
                </div>
                <div className="text-xs text-mutedSlate">{stagedInvites.length} queued invitation(s)</div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-subtle/40 p-4 text-xs text-mutedSlate flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                Primary Workspace Owner: <strong className="text-ink">{user?.fullName}</strong> ({user?.email}). Ownership can be delegated anytime in Organization Settings.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-5 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 1 || saving}
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Previous</span>
          </Button>

          {step < 8 ? (
            <Button type="button" onClick={handleNextStep} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Save & Continue'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button type="button" onClick={handleActivate} disabled={saving}>
              <Rocket className="w-4 h-4 mr-1.5" />
              <span>{saving ? 'Activating...' : 'Activate Workspace'}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
