import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
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
  Plus,
  ArrowRight,
  Search,
  BellRing,
  ShieldCheck,
} from 'lucide-react';

export function CampusDashboard() {
  const { user, campus, switchClub } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddClubModal, setShowAddClubModal] = useState(false);

  // Filters for club discovery
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

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
    [loading, categoryFilter]
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
        setClubs(json.data.clubs || []);
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

  const filteredClubs = useMemo(() => {
    return clubs.filter((c) => {
      const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [clubs, categoryFilter, searchQuery]);

  return (
    <div ref={cardsRef} className="space-y-6">
      <PageHeader
        title={`${user?.campusId?.name || 'Campus'} Operations`}
        subtitle="University-wide governance, compliance oversight, and organization management"
        actions={
          user?.campusRole === 'CAMPUS_ADMIN' && (
            <Button onClick={() => setShowAddClubModal(true)} size="sm">
              <Plus className="w-4 h-4" /> Register Club
            </Button>
          )
        }
      />

      {/* Governance Bulletin Announcement Banner */}
      <Card className="bg-gradient-to-r from-forest-50/80 via-subtle to-surface border-forest-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center flex-shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-forest-900">
                Annual Leadership Handover Window: 2025-2026 Academic Term
              </h4>
              <p className="text-[11px] text-charcoal-600">
                All outgoing student leadership boards must complete formal handover packages before the term boundary.
              </p>
            </div>
          </div>
          {(user?.campusRole === 'CAMPUS_ADMIN' || user?.campusRole === 'FACULTY_COORDINATOR') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/faculty/approvals')}
              className="flex-shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Review Approvals
            </Button>
          )}
        </div>
      </Card>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="metric-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-semibold text-charcoal-700">Active Clubs</span>
            <Building2 className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {loading ? '—' : stats?.activeClubsCount || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Recognized student societies</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-semibold text-charcoal-700">Events Conducted</span>
            <Calendar className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {loading ? '—' : stats?.totalEvents || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Across 2025-2026 academic term</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-semibold text-amberGold-800">Pending Approvals</span>
            <FileCheck2 className="w-4 h-4 text-amberGold-700" />
          </div>
          <div className="text-2xl font-bold text-amberGold-800">
            {loading ? '—' : stats?.pendingApprovalsCount || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Requiring advisor evaluation</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs font-semibold text-charcoal-700">Active Transitions</span>
            <ArrowRightLeft className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {loading ? '—' : stats?.activeHandoversCount || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Handover packages in progress</p>
        </Card>
      </div>

      {/* Clubs Discovery Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-charcoal-900">Registered Student Organizations</h3>
            <p className="text-xs text-charcoal-500">
              Browse campus clubs, access organizational memory, and inspect leadership succession
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clubs…"
                className="text-xs rounded border border-border bg-surface pl-8 pr-3 py-1.5 text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:border-forest-700 w-44"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs rounded border border-border bg-surface px-2.5 py-1.5 text-charcoal-800 focus:outline-none focus:border-forest-700 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="TECHNICAL">Technical</option>
              <option value="CULTURAL">Cultural</option>
              <option value="ACADEMIC">Academic</option>
              <option value="ENTREPRENEURSHIP">Entrepreneurship</option>
              <option value="SOCIAL">Social Good</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <Card className="col-span-full text-center py-12 text-xs text-charcoal-500 font-medium">
              Loading registered student organizations…
            </Card>
          ) : filteredClubs.length === 0 ? (
            <Card className="col-span-full text-center py-12 text-xs text-charcoal-400">
              No clubs match your selected filters.
            </Card>
          ) : (
            filteredClubs.map((club) => (
              <Card key={club._id} hover className="club-card flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-forest-50 border border-forest-100 flex items-center justify-center font-bold text-forest-800 text-sm flex-shrink-0">
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
                      <span className="text-charcoal-400 font-medium">Faculty Advisor: </span>
                      <span className="text-charcoal-800 font-medium">
                        {club.facultyCoordinatorId.fullName}
                      </span>
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
            ))
          )}
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
            <Button type="submit">Create Club</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
