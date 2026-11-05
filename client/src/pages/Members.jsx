import React, { useState, useEffect } from 'react';
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
import { Users, UserPlus, Mail, Shield, Trash2 } from 'lucide-react';

export function Members() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    clubRole: 'CORE_TEAM',
    title: '',
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
    [members.length]
  );

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/clubs/${clubId}/members`);
      if (res.ok) {
        const json = await res.json();
        setMembers(json.data.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) fetchMembers();
  }, [clubId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to add member');

      addToast(`Added member successfully!`, 'success');
      setShowAddModal(false);
      setFormData({ email: '', clubRole: 'CORE_TEAM', title: '' });
      fetchMembers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Roster & Roles"
        subtitle="Manage leadership tenure, sub-team leads, and access permissions"
        actions={
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4" /> Add / Invite Member
          </Button>
        }
      />

      <Card>
        <CardHeader
          title={`Active Organization Roster (${members.length})`}
          subtitle="All students officially holding active tenure in 2025-2026"
        />

        <div ref={listRef} className="overflow-x-auto">
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
              {members.map((m) => (
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
    </div>
  );
}

