import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  Users,
  BookOpen,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react';

export function AnnualReports() {
  const { clubId } = useParams();
  const { addToast } = useToast();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const containerRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.report-stat-card'), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 350,
        delay: (el, i) => i * 35,
        ease: 'easeOutQuad',
      });
    },
    [loading]
  );

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/clubs/${clubId}/reports/annual`);
        if (res.ok) {
          const json = await res.json();
          setReportData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (clubId) fetchReport();
  }, [clubId]);

  const handleDownloadCsv = () => {
    window.open(`/api/v1/clubs/${clubId}/reports/export/csv`, '_blank');
    addToast('Downloading annual events CSV data...', 'info');
  };

  const summary = reportData?.summary;
  const club = reportData?.club;
  const events = reportData?.events || [];

  const chartData = events.map((e) => ({
    name: e.title.length > 18 ? e.title.substring(0, 16) + '...' : e.title,
    Expected: e.expectedAttendance || 0,
    Actual: e.actualAttendance || 0,
  }));

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader
        title={`Annual Organization Performance Report`}
        subtitle={`Official institutional audit for ${club?.name || 'Club'} · Academic Term 2025-2026`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadCsv}>
              <Download className="w-3.5 h-3.5" /> Export CSV Data
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" /> Print Audit Dossier
            </Button>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="report-stat-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-1">
            <span className="text-xs font-semibold text-charcoal-700">Events Executed</span>
            <Calendar className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {summary?.eventsCompleted || 0} / {summary?.totalEventsPlanned || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Conducted vs Scheduled</p>
        </Card>

        <Card className="report-stat-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-1">
            <span className="text-xs font-semibold text-charcoal-700">Total Attendees</span>
            <Users className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {summary?.totalAttendeesReached || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">Verified attendance across term</p>
        </Card>

        <Card className="report-stat-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-1">
            <span className="text-xs font-semibold text-charcoal-700">Budget Spent</span>
            <DollarSign className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            ${summary?.totalActualBudget || 0}
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">
            Allocated: ${summary?.totalAllocatedBudget || 0}
          </p>
        </Card>

        <Card className="report-stat-card">
          <div className="flex items-center justify-between text-charcoal-500 mb-1">
            <span className="text-xs font-semibold text-charcoal-700">Handover Readiness</span>
            <ArrowRightLeft className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-bold text-charcoal-900">
            {summary?.handoverCompletionPercentage || 0}%
          </div>
          <p className="text-[11px] text-charcoal-400 mt-1">
            Status: {summary?.handoverStatus?.replace('_', ' ') || 'Pending'}
          </p>
        </Card>
      </div>

      {/* Attendance Reach Chart */}
      {chartData.length > 0 && (
        <Card className="p-5">
          <CardHeader
            title="Event Attendance Performance (Expected vs Actual)"
            subtitle="Participation analytics across conducted university initiatives"
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E0D8" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5F6662' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5F6662' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--cr-bg-surface)',
                    border: '1px solid var(--cr-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Expected" fill="#B7E4C7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#1B4332" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Event Audit Register Table */}
      <Card>
        <CardHeader
          title="Events Conducted & Operational Register"
          subtitle="Full academic term log for student affairs accreditation"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal-700">
            <thead className="bg-subtle text-charcoal-600 text-xs font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3">Event Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((e) => (
                <tr key={e._id} className="hover:bg-subtle/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-charcoal-900">{e.title}</td>
                  <td className="py-2.5 px-3">{e.eventType}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={e.status === 'COMPLETED' ? 'approved' : 'default'} size="sm">
                      {e.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3">{new Date(e.startDate).toLocaleDateString()}</td>
                  <td className="py-2.5 px-3">
                    {e.actualAttendance || e.expectedAttendance || 0} attendees
                  </td>
                  <td className="py-2.5 px-3">
                    ${e.actualBudget || e.estimatedBudget || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

