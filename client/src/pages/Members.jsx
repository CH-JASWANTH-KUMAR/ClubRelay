import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Avatar } from '../components/ui/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  UserPlus,
  Search,
  Filter,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

export function Members() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [members, setMembers] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTermId, setSelectedTermId] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    clubRole: 'CORE_TEAM',
    title: '',
    academicTermId: '',
  });

  const listRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.member-row'), {
        opacity: [0, 1],
        translateY: [4, 0],
        duration: 300,
        delay: (el, i) => i * 30,
        ease: 'easeOutQuad',
      });
    },
    [members.length, selectedTermId, selectedRole]
  );

  const fetchTerms = async () => {
    try {
      const campusId = user?.campusId?._id || user?.campusId;
      if (!campusId) return;
      const res = await fetch(`/api/v1/campuses/${campusId}/terms`);
      if (res.ok) {
        const json = await res.json();
        const loaded = json.data?.terms || [];
        setTerms(loaded);
        const current = loaded.find((t) => t.isCurrent) || loaded[0];
        if (current) {
          setFormData((prev) => ({
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
      const query = selectedTermId !== 'ALL' ? `?academicTermId=${selectedTermId}` : '';
      const res = await fetch(`/api/v1/clubs/${clubId}/members${query}`);
      if (res.ok) {
        const json = await res.json();
        setMembers(json.data?.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchTerms();
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) {
      fetchMembers();
    }
  }, [clubId, selectedTermId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: formData.email.trim(),
        clubRole: formData.clubRole,
        title: formData.title.trim(),
      };
      if (formData.academicTermId) {
        payload.academicTermId = formData.academicTermId;
      }

      const res = await fetch(`/api/v1/clubs/${clubId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to add member');

      addToast(`Added member successfully!`, 'success');
      setShowAddModal(false);
      setFormData((prev) => ({ ...prev, email: '', title: '' }));
      fetchMembers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesRole = selectedRole === 'ALL' || m.clubRole === selectedRole;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.userId?.fullName?.toLowerCase().includes(q) ||
        m.userId?.email?.toLowerCase().includes(q) ||
        m.title?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [members, selectedRole, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Roster & Roles"
        subtitle="Manage leadership tenure, sub-team leads, and access permissions"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowRecruitmentModal(true)}>
              <Sparkles className="w-4 h-4" /> Recruitment Pipeline
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <UserPlus className="w-4 h-4" /> Add Member
            </Button>
          </div>
        }
      />

      {/* Recruitment & Talent Pipeline Entry Point Banner */}
      <Card className="bg-gradient-to-r from-forest-50/80 via-subtle to-surface border-forest-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <h4 className="font-heading text-sm font-bold text-brand-900">
                2026 Core Leadership & Talent Onboarding
              </h4>
            </div>
            <p className="text-xs text-mutedSlate max-w-2xl">
              Track active applicants, schedule screening interviews, and designate successor leads across
              engineering, marketing, and operations tracks.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button size="sm" variant="primary" onClick={() => setShowRecruitmentModal(true)}>
              Open Recruitment Pipeline
            </Button>
          </div>
        </div>
      </Card>

      {/* Roster Controls & Filters */}
      <Card>
        <CardHeader
          title={`Active Organization Roster (${filteredMembers.length})`}
          subtitle="All students officially holding active tenure in the organization"
        />

        <div className="p-4 border-b border-border bg-subtle/40 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or position..."
              className="w-full text-xs rounded border border-border bg-surface pl-9 pr-3 py-2 text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-forest-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
              <Calendar className="w-3.5 h-3.5 text-forest-700" />
              <span className="font-medium">Term:</span>
            </div>
            <select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="text-xs rounded border border-border bg-surface px-2.5 py-1.5 text-charcoal-800 focus:outline-none focus:border-forest-700 cursor-pointer"
            >
              <option value="ALL">All Academic Terms</option>
              {terms.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} {t.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-charcoal-600 ml-2">
              <Filter className="w-3.5 h-3.5 text-charcoal-500" />
              <span className="font-medium">Role:</span>
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs rounded border border-border bg-surface px-2.5 py-1.5 text-charcoal-800 focus:outline-none focus:border-forest-700 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="PRESIDENT">President</option>
              <option value="SECRETARY">Secretary</option>
              <option value="CORE_TEAM">Core Team</option>
              <option value="GENERAL_MEMBER">General Member</option>
            </select>
          </div>
        </div>

        {/* Member Table */}
        <div ref={listRef} className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-xs text-charcoal-500 font-medium">
              Loading member roster…
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 text-xs text-charcoal-400">
              No matching members found for the selected filters.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-subtle text-charcoal-600 text-xs font-semibold border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Role & Title</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Academic Term</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((m) => (
                  <tr key={m._id} className="member-row hover:bg-subtle/50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={m.userId?.fullName || 'Member'}
                          size="sm"
                          src={m.userId?.avatarUrl}
                        />
                        <div>
                          <span className="font-semibold text-charcoal-900 block">
                            {m.userId?.fullName}
                          </span>
                          <span className="text-[11px] text-charcoal-400">{m.userId?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-charcoal-800">
                        {m.title || m.clubRole.replace('_', ' ')}
                      </div>
                      <Badge variant="default" size="sm" className="mt-0.5">
                        {m.clubRole.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-charcoal-600">
                      {m.userId?.department || 'Undergraduate'}
                    </td>
                    <td className="py-2.5 px-3 text-charcoal-600">
                      {m.academicTermId?.name || '2025-2026'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={m.status === 'ACTIVE' ? 'approved' : 'default'} size="sm">
                        {m.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Add Member Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Assign Roster Member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Student University Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. maya.tech@pcu.edu"
            helperText="Student must have registered on the campus workspace"
            required
          />

          <Select
            label="Target Academic Term"
            value={formData.academicTermId}
            onChange={(e) => setFormData({ ...formData, academicTermId: e.target.value })}
            options={terms.map((t) => ({
              label: `${t.name}${t.isCurrent ? ' (Current Active Term)' : ''}`,
              value: t._id,
            }))}
            helperText="Select the academic tenure term for this membership"
            required
          />

          <Select
            label="Club Role"
            value={formData.clubRole}
            onChange={(e) => setFormData({ ...formData, clubRole: e.target.value })}
            options={[
              { label: 'Club President', value: 'PRESIDENT' },
              { label: 'General Secretary', value: 'SECRETARY' },
              { label: 'Core Team Lead', value: 'CORE_TEAM' },
              { label: 'General Member', value: 'GENERAL_MEMBER' },
            ]}
          />

          <Input
            label="Specific Title / Position"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Lead Technical Organizer, PR Coordinator"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign to Roster</Button>
          </div>
        </form>
      </Modal>

      {/* Recruitment Pipeline Drawer / Modal */}
      <Modal
        isOpen={showRecruitmentModal}
        onClose={() => setShowRecruitmentModal(false)}
        title="Recruitment & Talent Pipeline"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-charcoal-600 leading-relaxed">
            Manage incoming leadership cohorts, evaluate committee applicants, and facilitate transparent
            selection before the annual handover window.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded border border-border bg-subtle">
              <span className="text-charcoal-400 block text-[11px] font-medium">Stage 1</span>
              <span className="font-bold text-charcoal-900 block text-xs mt-0.5">Application Form</span>
              <span className="text-[11px] text-forest-700 mt-1 inline-flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> 18 Received
              </span>
            </div>

            <div className="p-3 rounded border border-border bg-subtle">
              <span className="text-charcoal-400 block text-[11px] font-medium">Stage 2</span>
              <span className="font-bold text-charcoal-900 block text-xs mt-0.5">Technical Screening</span>
              <span className="text-[11px] text-amberGold-700 mt-1 inline-flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" /> 6 In Review
              </span>
            </div>

            <div className="p-3 rounded border border-border bg-subtle">
              <span className="text-charcoal-400 block text-[11px] font-medium">Stage 3</span>
              <span className="font-bold text-charcoal-900 block text-xs mt-0.5">Final Interview</span>
              <span className="text-[11px] text-charcoal-500 mt-1 inline-flex items-center gap-1 font-medium">
                <Compass className="w-3 h-3" /> 4 Scheduled
              </span>
            </div>
          </div>

          <div className="border border-border rounded p-3 space-y-2 bg-surface">
            <h5 className="font-bold text-charcoal-900 text-xs">Recruitment Tracks (Fall 2026)</h5>
            <div className="space-y-1.5 text-charcoal-700">
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span>Technical & Workshop Operations</span>
                <Badge variant="approved" size="sm">8 Applicants</Badge>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span>Design, Branding & Visual Media</span>
                <Badge variant="planning" size="sm">4 Applicants</Badge>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border">
                <span>Sponsorship & Vendor Relations</span>
                <Badge variant="proposed" size="sm">6 Applicants</Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowRecruitmentModal(false)}>
              Close Pipeline
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
