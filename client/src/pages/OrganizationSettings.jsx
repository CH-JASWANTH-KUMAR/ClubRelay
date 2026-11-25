import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Calendar, ShieldAlert, Save, Plus, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

export function OrganizationSettings() {
  const { clubId } = useParams();
  const { hasClubCapability, refreshUser } = useAuth();
  const { addToast } = useToast();

  const canManageSettings = hasClubCapability('club.manage_settings', clubId);
  const canTransferOwnership = hasClubCapability('club.transfer_ownership', clubId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [terms, setTerms] = useState([]);

  const [form, setForm] = useState({
    name: '',
    shortName: '',
    mission: '',
    description: '',
    visibility: 'PUBLIC_CAMPUS',
    joinPolicy: 'REQUEST_APPROVAL',
    joinCode: '',
    website: '',
    contactEmail: '',
    activeTermId: '',
  });

  const [newTerm, setNewTerm] = useState({ name: '', startDate: '', endDate: '' });
  const [newOwnerId, setNewOwnerId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [clubRes, structRes, memRes] = await Promise.all([
        fetch(`/api/v1/clubs/${clubId}`, { credentials: 'include' }),
        fetch(`/api/v1/clubs/${clubId}/structure`, { credentials: 'include' }),
        fetch(`/api/v1/clubs/${clubId}/members`, { credentials: 'include' }),
      ]);

      if (clubRes.ok) {
        const json = await clubRes.json();
        const c = json.data.club;
        setClub(c);
        setForm({
          name: c.name || '',
          shortName: c.shortName || '',
          mission: c.mission || '',
          description: c.description || '',
          visibility: c.visibility || 'PUBLIC_CAMPUS',
          joinPolicy: c.joinPolicy || 'REQUEST_APPROVAL',
          joinCode: c.joinCode || '',
          website: c.website || '',
          contactEmail: c.contactEmail || '',
          activeTermId: c.activeTermId?._id || c.activeTermId || '',
        });
      }

      if (structRes.ok) {
        const sJson = await structRes.json();
        setTerms(sJson.data.terms || []);
      }

      if (memRes.ok) {
        const mJson = await memRes.json();
        setMembers(mJson.data.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) loadData();
  }, [clubId]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          activeTermId: form.activeTermId || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Could not update settings.');
      addToast('Organization settings updated.', 'success');
      await refreshUser();
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    if (!newTerm.name.trim() || !newTerm.startDate || !newTerm.endDate) return;
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/terms`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTerm, setActive: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create term.');
      addToast(`Created term "${json.data.term.name}" and set active.`, 'success');
      setNewTerm({ name: '', startDate: '', endDate: '' });
      await refreshUser();
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleTransferOwnership = async () => {
    if (!newOwnerId) return;
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/transfer-ownership`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newOwnerId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Transfer failed.');
      addToast('Primary workspace ownership transferred.', 'success');
      await refreshUser();
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-subtle animate-pulse" />;
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <PageHeader
        title="Organization Settings"
        subtitle="Manage profile visibility, membership join rules, academic terms, and primary workspace ownership."
        badge={club?.status ? <Badge variant="approved">{club.status}</Badge> : null}
      />

      <form onSubmit={handleSaveSettings} className="rounded-2xl bg-surface border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-heading font-bold text-ink">
          <Settings className="w-4 h-4 text-brand-600" />
          <span>Identity, Visibility & Onboarding Rules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Organization Name"
            value={form.name}
            disabled={!canManageSettings}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Short Name"
            value={form.shortName}
            disabled={!canManageSettings}
            onChange={(e) => setForm((p) => ({ ...p, shortName: e.target.value }))}
          />
        </div>

        <Textarea
          label="Mission"
          value={form.mission}
          disabled={!canManageSettings}
          onChange={(e) => setForm((p) => ({ ...p, mission: e.target.value }))}
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Visibility"
            value={form.visibility}
            disabled={!canManageSettings}
            onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))}
            options={[
              { value: 'PUBLIC_CAMPUS', label: 'Campus Directory' },
              { value: 'INVITE_ONLY', label: 'Code or Invite Only' },
              { value: 'PRIVATE', label: 'Private Workspace' },
            ]}
          />
          <Select
            label="Join Policy"
            value={form.joinPolicy}
            disabled={!canManageSettings}
            onChange={(e) => setForm((p) => ({ ...p, joinPolicy: e.target.value }))}
            options={[
              { value: 'REQUEST_APPROVAL', label: 'Require Approval' },
              { value: 'OPEN', label: 'Open Self-Join' },
              { value: 'INVITE_ONLY', label: 'Invite Only' },
            ]}
          />
          <Input
            label="Join Code"
            value={form.joinCode}
            disabled={!canManageSettings}
            onChange={(e) => setForm((p) => ({ ...p, joinCode: e.target.value.toUpperCase() }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Active Academic Term"
            value={form.activeTermId}
            disabled={!canManageSettings}
            onChange={(e) => setForm((p) => ({ ...p, activeTermId: e.target.value }))}
            options={[
              { value: '', label: 'Select active term...' },
              ...terms.map((t) => ({ value: t._id, label: t.name })),
            ]}
          />
          <Input
            label="Website"
            value={form.website}
            disabled={!canManageSettings}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
          />
        </div>

        {canManageSettings && (
          <div className="flex justify-end pt-2 border-t border-border">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-1.5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </Button>
          </div>
        )}
      </form>

      {/* Academic Terms Builder */}
      {canManageSettings && (
        <form onSubmit={handleCreateTerm} className="rounded-2xl bg-surface border border-border p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-heading font-bold text-ink">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Create New Academic Term</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <Input
              label="Term Label"
              value={newTerm.name}
              onChange={(e) => setNewTerm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. 2026-2027"
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={newTerm.startDate}
              onChange={(e) => setNewTerm((p) => ({ ...p, startDate: e.target.value }))}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={newTerm.endDate}
              onChange={(e) => setNewTerm((p) => ({ ...p, endDate: e.target.value }))}
              required
            />
            <Button type="submit" variant="secondary">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add & Activate</span>
            </Button>
          </div>
        </form>
      )}

      {/* Workspace Ownership Transfer */}
      <div className="rounded-2xl bg-surface border border-coral-200 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-sm font-bold text-ink flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-coral-600" />
              <span>Primary Workspace Ownership</span>
            </h3>
            <p className="text-xs text-mutedSlate mt-1">
              Current Workspace Owner:{' '}
              <strong className="text-ink">
                {club?.workspaceOwnerId?.fullName || 'Assigned Steward'}
              </strong>
              . Transferring ownership delegates platform billing and full recovery privileges.
            </p>
          </div>
        </div>

        {canTransferOwnership && (
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Select
                label="Transfer Ownership To Active Member"
                value={newOwnerId}
                onChange={(e) => setNewOwnerId(e.target.value)}
                options={[
                  { value: '', label: 'Choose active member...' },
                  ...members
                    .filter((m) => m.status === 'ACTIVE' && m.userId?._id)
                    .map((m) => ({
                      value: m.userId._id,
                      label: `${m.userId.fullName} (${m.title || 'Member'})`,
                    })),
                ]}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={!newOwnerId}
              onClick={handleTransferOwnership}
            >
              <ArrowRightLeft className="w-4 h-4 mr-1.5" />
              <span>Transfer Ownership</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

