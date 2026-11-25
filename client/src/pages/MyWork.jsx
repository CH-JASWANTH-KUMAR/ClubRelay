import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/layout/PageHeader';
import { useAnimeScope } from '../hooks/useAnimeScope';
import {
  Clock,
  CheckCircle2,
  Filter,
  Kanban,
  List as ListIcon,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';

const STATUS_COLUMNS = [
  { key: 'TODO', label: 'To Do', color: 'border-charcoal-200' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-400' },
  { key: 'REVIEW', label: 'In Review', color: 'border-purple-400' },
  { key: 'BLOCKED', label: 'Blocked', color: 'border-red-400' },
  { key: 'DONE', label: 'Done', color: 'border-forest-600' },
];

export function MyWork() {
  const { user, memberships } = useAuth();
  const { addToast } = useToast();

  if (user && user.campusRole === 'STUDENT' && (!memberships || memberships.length === 0)) {
    return <Navigate to="/onboarding" replace />;
  }

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    dueToday: 0,
    upcoming: 0,
    overdue: 0,
    blocked: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [activeView, setActiveView] = useState('kanban'); // 'kanban' | 'list' | 'calendar'
  const [selectedClubId, setSelectedClubId] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Selected Task Drawer / Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const containerRef = useAnimeScope(
    ({ root, animate }) => {
      animate(root.querySelectorAll('.task-item-card'), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 300,
        delay: (el, i) => i * 25,
        ease: 'easeOutQuad',
      });
    },
    [activeView, selectedClubId, selectedPriority, selectedStatus, tasks.length]
  );

  const fetchMyWork = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedClubId !== 'ALL') params.set('clubId', selectedClubId);
      if (selectedPriority !== 'ALL') params.set('priority', selectedPriority);
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/v1/tasks/my-work${qs}`);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data?.tasks || []);
        if (json.data?.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load personal tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyWork();
  }, [selectedClubId, selectedPriority, selectedStatus]);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to update task');

      addToast('Task status updated successfully', 'success');
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
      fetchMyWork();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks;
  }, [tasks]);

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader
        title="My Work"
        subtitle="Unified task cockpit across all your active campus student organizations"
        badge={
          <Badge variant="planning" size="md">
            {stats.total} Assigned Tasks
          </Badge>
        }
        actions={
          <div className="flex items-center rounded-lg border border-border bg-subtle p-0.5">
            <button
              onClick={() => setActiveView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeView === 'kanban'
                  ? 'bg-surface text-forest-800 shadow-subtle'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeView === 'list'
                  ? 'bg-surface text-forest-800 shadow-subtle'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeView === 'calendar'
                  ? 'bg-surface text-forest-800 shadow-subtle'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
        }
      />

      {/* Quick Personal KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3 text-center">
          <span className="text-[11px] font-semibold text-charcoal-500 block">Total Workload</span>
          <span className="text-xl font-bold text-charcoal-900 mt-0.5 block">{stats.total}</span>
        </Card>

        <Card className="p-3 text-center">
          <span className="text-[11px] font-semibold text-amberGold-800 block">Due Today</span>
          <span className="text-xl font-bold text-amberGold-900 mt-0.5 block">{stats.dueToday}</span>
        </Card>

        <Card className="p-3 text-center">
          <span className="text-[11px] font-semibold text-blue-700 block">Upcoming</span>
          <span className="text-xl font-bold text-blue-900 mt-0.5 block">{stats.upcoming}</span>
        </Card>

        <Card className="p-3 text-center">
          <span className="text-[11px] font-semibold text-red-700 block">Overdue</span>
          <span className="text-xl font-bold text-red-900 mt-0.5 block">{stats.overdue}</span>
        </Card>

        <Card className="p-3 text-center">
          <span className="text-[11px] font-semibold text-amberGold-700 block">Blocked</span>
          <span className="text-xl font-bold text-amberGold-900 mt-0.5 block">{stats.blocked}</span>
        </Card>

        <Card className="p-3 text-center">
          <span className="text-[11px] font-semibold text-forest-700 block">Completed</span>
          <span className="text-xl font-bold text-forest-900 mt-0.5 block">{stats.completed}</span>
        </Card>
      </div>

      {/* Filter Row */}
      <Card className="p-3 bg-surface border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
            <Filter className="w-3.5 h-3.5 text-forest-700" />
            <span className="font-medium">Club:</span>
            <select
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              className="text-xs rounded border border-border bg-subtle px-2.5 py-1 text-charcoal-800 focus:outline-none focus:border-forest-700"
            >
              <option value="ALL">All Authorized Clubs</option>
              {memberships.map((m) => (
                <option key={m.clubId?._id} value={m.clubId?._id}>
                  {m.clubId?.name} ({m.clubId?.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
            <span className="font-medium">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs rounded border border-border bg-subtle px-2.5 py-1 text-charcoal-800 focus:outline-none focus:border-forest-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
            <span className="font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded border border-border bg-subtle px-2.5 py-1 text-charcoal-800 focus:outline-none focus:border-forest-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">In Review</option>
              <option value="BLOCKED">Blocked</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-charcoal-500 font-medium">
          Showing {filteredTasks.length} tasks
        </span>
      </Card>

      {/* Main View Area */}
      {loading ? (
        <Card className="text-center py-12 text-xs text-charcoal-500 font-medium">
          Loading assigned tasks…
        </Card>
      ) : filteredTasks.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle2 className="w-10 h-10 text-forest-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-charcoal-900">All tasks completed or none assigned</h4>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
            You are fully caught up across all your active student organization assignments!
          </p>
        </Card>
      ) : activeView === 'kanban' ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="flex flex-col h-full bg-subtle/50 rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
                  <span className="text-xs font-bold text-charcoal-800">{col.label}</span>
                  <span className="text-[10px] bg-surface font-semibold px-2 py-0.5 rounded-full border border-border text-charcoal-600">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto min-h-[300px]">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-charcoal-400">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="task-item-card p-3 rounded-lg bg-surface border border-border hover:border-forest-600 hover:shadow-subtle transition-colors cursor-pointer space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-semibold text-charcoal-900 leading-snug">
                            {task.title}
                          </h5>
                          <Badge
                            variant={
                              task.priority === 'URGENT'
                                ? 'urgent'
                                : task.priority === 'HIGH'
                                ? 'high'
                                : task.priority === 'MEDIUM'
                                ? 'medium'
                                : 'low'
                            }
                            size="sm"
                          >
                            {task.priority}
                          </Badge>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-charcoal-600 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-charcoal-400">
                          <span className="font-semibold text-forest-800 truncate max-w-[100px]">
                            {task.clubId?.code || 'Club'}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-charcoal-500">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : activeView === 'list' ? (
        /* LIST VIEW */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-subtle text-charcoal-600 text-xs font-semibold border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Task Title</th>
                  <th className="py-2.5 px-3">Organization</th>
                  <th className="py-2.5 px-3">Associated Event</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => setSelectedTask(t)}
                    className="task-item-card hover:bg-subtle/50 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-semibold text-charcoal-900">
                      {t.title}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-forest-800">
                        {t.clubId?.name} ({t.clubId?.code})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-charcoal-600">
                      {t.eventId?.title || 'General Club Operations'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          t.priority === 'URGENT'
                            ? 'urgent'
                            : t.priority === 'HIGH'
                            ? 'high'
                            : t.priority === 'MEDIUM'
                            ? 'medium'
                            : 'low'
                        }
                        size="sm"
                      >
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-charcoal-600">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No Deadline'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          t.status === 'DONE'
                            ? 'approved'
                            : t.status === 'BLOCKED'
                            ? 'urgent'
                            : t.status === 'IN_PROGRESS'
                            ? 'inProgress'
                            : 'default'
                        }
                        size="sm"
                      >
                        {t.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* CALENDAR VIEW */
        <Card className="p-4 space-y-4">
          <CardHeader
            title="Scheduled Task Milestones"
            subtitle="Chronological deadlines across all your active committees"
          />
          <div className="space-y-3">
            {filteredTasks
              .filter((t) => t.dueDate)
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTask(t)}
                  className="p-3 rounded-lg border border-border bg-surface hover:border-forest-600 transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-subtle border border-border flex flex-col items-center justify-center text-charcoal-800 flex-shrink-0">
                      <span className="text-[10px] font-bold text-forest-700">
                        {new Date(t.dueDate).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-sm font-bold leading-none">
                        {new Date(t.dueDate).getDate()}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-charcoal-900">{t.title}</h5>
                      <span className="text-[11px] text-charcoal-500 block">
                        {t.clubId?.name} · {t.eventId?.title || 'General Task'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        t.priority === 'URGENT'
                          ? 'urgent'
                          : t.priority === 'HIGH'
                          ? 'high'
                          : 'medium'
                      }
                      size="sm"
                    >
                      {t.priority}
                    </Badge>
                    <Badge
                      variant={t.status === 'DONE' ? 'approved' : 'default'}
                      size="sm"
                    >
                      {t.status}
                    </Badge>
                    <ArrowRight className="w-3.5 h-3.5 text-charcoal-400" />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Task Details & Status Update Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Overview & Status"
      >
        {selectedTask && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-xs font-bold text-forest-800 block">
                {selectedTask.clubId?.name} ({selectedTask.clubId?.code})
              </span>
              <h4 className="text-sm font-bold text-charcoal-900 mt-0.5">{selectedTask.title}</h4>
            </div>

            {selectedTask.description && (
              <div className="p-3 rounded bg-subtle border border-border text-charcoal-700 leading-relaxed whitespace-pre-wrap">
                {selectedTask.description}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 bg-surface p-3 rounded border border-border">
              <div>
                <span className="text-charcoal-400 block text-[11px]">Due Date:</span>
                <span className="font-semibold text-charcoal-900">
                  {selectedTask.dueDate
                    ? new Date(selectedTask.dueDate).toLocaleDateString()
                    : 'None specified'}
                </span>
              </div>
              <div>
                <span className="text-charcoal-400 block text-[11px]">Priority:</span>
                <Badge
                  variant={
                    selectedTask.priority === 'URGENT'
                      ? 'urgent'
                      : selectedTask.priority === 'HIGH'
                      ? 'high'
                      : 'medium'
                  }
                  size="sm"
                  className="mt-0.5"
                >
                  {selectedTask.priority}
                </Badge>
              </div>
            </div>

            {selectedTask.eventId && (
              <div className="text-[11px] text-charcoal-500">
                <span className="font-medium text-charcoal-700">Parent Event: </span>
                <span>{selectedTask.eventId.title}</span>
              </div>
            )}

            <div className="pt-3 border-t border-border">
              <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
                Update Task Status:
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {STATUS_COLUMNS.map((col) => (
                  <button
                    key={col.key}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateTaskStatus(selectedTask._id, col.key)}
                    className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition-colors ${
                      selectedTask.status === col.key
                        ? 'bg-forest-700 text-white border-forest-700'
                        : 'bg-surface text-charcoal-700 border-border hover:bg-subtle'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
