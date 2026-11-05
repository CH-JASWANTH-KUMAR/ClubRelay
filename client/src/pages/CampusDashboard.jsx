import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  Building2,
  Calendar,
  FileCheck2,
  ArrowRightLeft,
  Users,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export function CampusDashboard() {
  const { user, campus, switchClub } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClubModal, setShowAddClubModal] = useState(false);

  const [newClub, setNewClub] = useState({
    name: '',
    code: '',
    category: 'TECHNICAL',
    description: '',
  });

  const cardsRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.metric-card, .club-card'), {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 350,
        delay: (el, i) => i * 30,
        ease: 'easeOutQuad',
      });
    },
    [loading]
  );

  const fetchCampusData = async () => {
    try {
      setLoading(true);
      const campusId = campus?._id || user?.campusId?._id;
      if (!campusId) return;

      const res = await fetch(`/api/v1/campuses/${campusId}/stats`);
      if (res.ok) {
        const json = await res.json();
        setStats(json.data.stats);
        setClubs(json.data.clubs);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load campus statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampusData();
  }, [campus, user]);

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClub),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to create club');

      addToast(`Club "${json.data.club.name}" created!`, 'success');
      setShowAddClubModal(false);
      setNewClub({ name: '', code: '', category: 'TECHNICAL', description: '' });
      fetchCampusData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div ref={cardsRef} className="space-y-6">
      <PageHeader
        title={`${user?.campusId?.name || 'Campus'} Operations`}
        subtitle="University-wide governance, compliance oversight, and organization management"
        actions={
          user?.campusRole === 'CAMPUS_ADMIN' && (
            <Button onClick={() => setShowAddClubModal(true)} size="sm">
              <Plus className="w-4 h-4" /> Register New Club
            </Button>
          )
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="metric-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Clubs</span>
            <Building2 className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {loading ? '—' : stats?.activeClubsCount || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Recognized student societies</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Events Conducted</span>
            <Calendar className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {loading ? '—' : stats?.totalEvents || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Across 2025-2026 academic term</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Faculty Approvals</span>
            <FileCheck2 className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {loading ? '—' : stats?.pendingApprovalsCount || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Requiring advisor evaluation</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Transitions</span>
            <ArrowRightLeft className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {loading ? '—' : stats?.activeHandoversCount || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Handover packages in progress</p>
        </Card>
      </div>

      {/* Clubs Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-charcoal-900">Registered Student Organizations</h3>
          <span className="text-xs text-charcoal-500">{clubs.length} Clubs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <Card key={club._id} hover className="club-card flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-forest-50 border border-forest-100 flex items-center justify-center font-bold text-forest-800 text-sm">
                      {club.code}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-charcoal-900 leading-tight">{club.name}</h4>
                      <Badge variant="approved" size="sm" className="mt-1">
                        {club.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-charcoal-600 line-clamp-2 mt-2 mb-3">
                  {club.description || 'No description provided.'}
                </p>

                {club.facultyCoordinatorId && (
                  <div className="text-[11px] text-charcoal-500 border-t border-border pt-2">
                    <span className="text-charcoal-400 font-medium">Advisor: </span>
                    <span className="text-charcoal-800 font-medium">{club.facultyCoordinatorId.fullName}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-forest-700 font-medium">Active Workspace</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    switchClub(club);
                    navigate(`/clubs/${club._id}`);
                  }}
                >
                  Enter Workspace <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Register Club Modal */}
      <Modal
        isOpen={showAddClubModal}
        onClose={() => setShowAddClubModal(false)}
        title="Register New Student Organization"
      >
        <form onSubmit={handleCreateClub} className="space-y-4">
          <Input
            label="Club Official Name"
            value={newClub.name}
            onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
            placeholder="e.g. Google Developer Group"
            required
          />
          <Input
            label="Acronym / Short Code"
            value={newClub.code}
            onChange={(e) => setNewClub({ ...newClub, code: e.target.value.toUpperCase() })}
            placeholder="e.g. GDG"
            required
          />
          <Select
            label="Organization Category"
            value={newClub.category}
            onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
            options={[
              { label: 'Technical', value: 'TECHNICAL' },
              { label: 'Cultural', value: 'CULTURAL' },
              { label: 'Academic', value: 'ACADEMIC' },
              { label: 'Entrepreneurship', value: 'ENTREPRENEURSHIP' },
              { label: 'Social Good', value: 'SOCIAL' },
            ]}
          />
          <Input
            label="Mission / Description"
            value={newClub.description}
            onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
            placeholder="Brief mission and scope of the club"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowAddClubModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Organization</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
