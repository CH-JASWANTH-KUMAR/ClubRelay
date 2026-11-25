import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Network,
  Shield,
  Layers,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  Users,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { OrgChartCanvas } from '../components/structure/OrgChartCanvas';
import { PermissionMatrixEditor } from '../components/structure/PermissionMatrixEditor';
import { clsx } from 'clsx';

export function StructureBuilder() {
  const { clubId } = useParams();
  const { hasClubCapability } = useAuth();
  const { addToast } = useToast();

  const canManageStructure = hasClubCapability('club.manage_structure', clubId);

  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'positions' | 'departments'
  const [loading, setLoading] = useState(true);
  const [structure, setStructure] = useState({
    club: null,
    departments: [],
    positions: [],
    assignmentsByPosition: {},
    terms: [],
    activeTerm: null,
    permissionsCatalogue: [],
  });

  // Modals
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [posForm, setPosForm] = useState({
    name: '',
    description: '',
    departmentId: '',
    parentPositionId: '',
    isLeadership: false,
    maxHolders: '',
    permissions: ['club.view_overview', 'events.view'],
  });
  const [posError, setPosError] = useState('');

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', description: '', color: '#315BDB' });

  const loadStructure = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/clubs/${clubId}/structure`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setStructure(json.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load organization structure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) loadStructure();
  }, [clubId]);

  const deptMap = useMemo(
    () => new Map((structure.departments || []).map((d) => [d._id, d])),
    [structure.departments]
  );

  const openCreatePosition = (parentNode = null) => {
    setEditingPosition(null);
    setPosError('');
    setPosForm({
      name: '',
      description: '',
      departmentId: parentNode?.departmentId || '',
      parentPositionId: parentNode?._id || '',
      isLeadership: false,
      maxHolders: '',
      permissions: ['club.view_overview', 'events.view'],
    });
    setShowPositionModal(true);
  };

  const openEditPosition = (pos) => {
    setEditingPosition(pos);
    setPosError('');
    setPosForm({
      name: pos.name,
      description: pos.description || '',
      departmentId: pos.departmentId || '',
      parentPositionId: pos.parentPositionId || '',
      isLeadership: Boolean(pos.isLeadership),
      maxHolders: pos.maxHolders ? String(pos.maxHolders) : '',
      permissions: pos.permissions || [],
    });
    setShowPositionModal(true);
  };

  const handleSavePosition = async (e) => {
    e.preventDefault();
    setPosError('');
    try {
      const url = editingPosition
        ? `/api/v1/clubs/${clubId}/positions/${editingPosition._id}`
        : `/api/v1/clubs/${clubId}/positions`;
      const method = editingPosition ? 'PUT' : 'POST';

      const payload = {
        name: posForm.name.trim(),
        description: posForm.description.trim(),
        departmentId: posForm.departmentId || null,
        parentPositionId: posForm.parentPositionId || null,
        isLeadership: Boolean(posForm.isLeadership),
        maxHolders: posForm.maxHolders ? Number(posForm.maxHolders) : null,
        permissions: posForm.permissions,
      };

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setPosError(json.error?.message || 'Unable to save position.');
        return;
      }

      addToast(
        editingPosition ? `Updated "${posForm.name}"` : `Created "${posForm.name}"`,
        'success'
      );
      setShowPositionModal(false);
      loadStructure();
    } catch (err) {
      setPosError(err.message);
    }
  };

  const handleDeletePosition = async (pos) => {
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/positions/${pos._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Unable to delete position.');
      addToast(json.message || `Removed "${pos.name}"`, 'success');
      loadStructure();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    try {
      const url = editingDept
        ? `/api/v1/clubs/${clubId}/departments/${editingDept._id}`
        : `/api/v1/clubs/${clubId}/departments`;
      const method = editingDept ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Failed to save department.');
      addToast(editingDept ? 'Department updated.' : 'Department created.', 'success');
      setShowDeptModal(false);
      loadStructure();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteDepartment = async (dept) => {
    try {
      const res = await fetch(`/api/v1/clubs/${clubId}/departments/${dept._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Could not delete department.');
      addToast(`Deleted team "${dept.name}"`, 'success');
      loadStructure();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const activePositions = (structure.positions || []).filter((p) => p.isActive !== false);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Organization Structure & Roles"
        subtitle="Define your organization chart, custom positions, departments, and capability permissions."
        badge={
          structure.activeTerm ? (
            <Badge variant="planning" className="gap-1">
              <Calendar className="w-3 h-3" />
              <span>{structure.activeTerm.name}</span>
            </Badge>
          ) : null
        }
        actions={
          canManageStructure && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditingDept(null);
                  setDeptForm({ name: '', description: '', color: '#315BDB' });
                  setShowDeptModal(true);
                }}
              >
                <Layers className="w-4 h-4 mr-1.5" />
                <span>Add Department</span>
              </Button>
              <Button size="sm" onClick={() => openCreatePosition(null)}>
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Create Position</span>
              </Button>
            </div>
          )
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
        {[
          { key: 'chart', label: 'Organization Chart', icon: Network },
          { key: 'positions', label: `Positions & Permissions (${activePositions.length})`, icon: Shield },
          { key: 'departments', label: `Departments (${structure.departments?.length || 0})`, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer',
                active
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-mutedSlate hover:text-ink'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="h-64 rounded-2xl bg-subtle animate-pulse" />
      ) : (
        <>
          {activeTab === 'chart' && (
            <OrgChartCanvas
              positions={activePositions}
              departments={structure.departments}
              assignmentsByPosition={structure.assignmentsByPosition}
              canEdit={canManageStructure}
              onSelectPosition={openEditPosition}
              onAddSubPosition={(parent) => openCreatePosition(parent)}
            />
          )}

          {activeTab === 'positions' && (
            <div className="space-y-3">
              {activePositions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center space-y-2">
                  <Shield className="w-8 h-8 text-mutedSlate mx-auto" />
                  <h3 className="font-heading text-base font-bold text-ink">No positions configured</h3>
                  <p className="text-xs text-mutedSlate">
                    Create custom positions with explicit capabilities tailored to your club&apos;s workflow.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-surface overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-subtle/50 text-[11px] font-bold uppercase tracking-wider text-mutedSlate">
                        <th className="py-3 px-4">Position</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Reports To</th>
                        <th className="py-3 px-4">Holders</th>
                        <th className="py-3 px-4">Capabilities</th>
                        {canManageStructure && <th className="py-3 px-4 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {activePositions.map((pos) => {
                        const dept = pos.departmentId ? deptMap.get(pos.departmentId) : null;
                        const parent = pos.parentPositionId
                          ? activePositions.find((p) => p._id === pos.parentPositionId)
                          : null;
                        const holders = structure.assignmentsByPosition[pos._id] || [];

                        return (
                          <tr key={pos._id} className="hover:bg-subtle/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-heading font-bold text-ink">{pos.name}</span>
                                {pos.isLeadership && <Badge variant="planning" size="sm">Lead</Badge>}
                              </div>
                              {pos.description && (
                                <p className="text-xs text-mutedSlate line-clamp-1 mt-0.5">{pos.description}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs text-mutedSlate">
                              {dept ? (
                                <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                                  <span>{dept.name}</span>
                                </span>
                              ) : (
                                'Org-wide'
                              )}
                            </td>
                            <td className="py-3 px-4 text-xs text-mutedSlate">
                              {parent ? parent.name : 'Top-level root'}
                            </td>
                            <td className="py-3 px-4 text-xs">
                              <span className="inline-flex items-center gap-1 font-semibold text-ink">
                                <Users className="w-3.5 h-3.5 text-mutedSlate" />
                                <span>
                                  {holders.length}
                                  {pos.maxHolders ? ` / ${pos.maxHolders}` : ''}
                                </span>
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs">
                              <Badge variant="default" size="sm">
                                {pos.permissions?.length || 0} permissions
                              </Badge>
                            </td>
                            {canManageStructure && (
                              <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openEditPosition(pos)}
                                >
                                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                                  <span>Configure</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeletePosition(pos)}
                                  title={
                                    holders.length > 0
                                      ? 'End active holder tenures before deleting'
                                      : 'Delete position'
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-coral-700" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(structure.departments || []).map((dept) => {
                const count = activePositions.filter((p) => p.departmentId === dept._id).length;
                return (
                  <div
                    key={dept._id}
                    className="rounded-xl border border-border bg-surface p-5 space-y-3"
                    style={{ borderTopWidth: '4px', borderTopColor: dept.color || '#315BDB' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-heading text-base font-bold text-ink">{dept.name}</h3>
                        <p className="text-xs text-mutedSlate mt-0.5">
                          {dept.description || 'Functional team grouping'}
                        </p>
                      </div>
                      <Badge variant="default" size="sm">{count} roles</Badge>
                    </div>
                    {canManageStructure && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingDept(dept);
                            setDeptForm({
                              name: dept.name,
                              description: dept.description || '',
                              color: dept.color || '#315BDB',
                            });
                            setShowDeptModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDepartment(dept)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {(structure.departments || []).length === 0 && (
                <div className="md:col-span-3 rounded-xl border border-dashed border-border bg-surface p-8 text-center text-xs text-mutedSlate">
                  No optional departments added. Organizations can operate flat or group positions into teams.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Position Configuration & Capability Editor Modal */}
      <Modal
        isOpen={showPositionModal}
        onClose={() => setShowPositionModal(false)}
        title={editingPosition ? `Configure Position: ${editingPosition.name}` : 'Create Custom Position'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSavePosition} className="space-y-4">
          {posError && (
            <div className="p-3 rounded-lg bg-coral-50 border border-coral-200 flex items-start gap-2 text-xs text-coral-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{posError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Position Title *"
              value={posForm.name}
              onChange={(e) => setPosForm((p) => ({ ...p, name: e.target.value }))}
              required
              placeholder="e.g. Design Lead"
            />
            <Input
              label="Max Concurrent Holders"
              type="number"
              min="1"
              value={posForm.maxHolders}
              onChange={(e) => setPosForm((p) => ({ ...p, maxHolders: e.target.value }))}
              placeholder="Leave blank for unlimited"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Department (Optional)"
              value={posForm.departmentId}
              onChange={(e) => setPosForm((p) => ({ ...p, departmentId: e.target.value }))}
              options={[
                { value: '', label: 'None (Org-wide)' },
                ...(structure.departments || []).map((d) => ({ value: d._id, label: d.name })),
              ]}
            />
            <Select
              label="Reports To (Org Chart Hierarchy)"
              value={posForm.parentPositionId}
              onChange={(e) => setPosForm((p) => ({ ...p, parentPositionId: e.target.value }))}
              options={[
                { value: '', label: 'Top-level root position' },
                ...activePositions
                  .filter((p) => p._id !== editingPosition?._id)
                  .map((p) => ({ value: p._id, label: p.name })),
              ]}
            />
          </div>

          <Textarea
            label="Position Mandate / Description"
            value={posForm.description}
            onChange={(e) => setPosForm((p) => ({ ...p, description: e.target.value }))}
            rows={2}
            placeholder="Summarize scope and responsibilities for future handover clarity..."
          />

          <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={posForm.isLeadership}
              onChange={(e) => setPosForm((p) => ({ ...p, isLeadership: e.target.checked }))}
              className="rounded border-border text-brand-600"
            />
            <span>Feature in Overview Leadership Directory</span>
          </label>

          <PermissionMatrixEditor
            modules={structure.permissionsCatalogue || []}
            selectedPermissions={posForm.permissions}
            onChange={(perms) => setPosForm((p) => ({ ...p, permissions: perms }))}
            compact
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setShowPositionModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPosition ? 'Save Position Changes' : 'Create Position'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Department Modal */}
      <Modal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create Department'}
      >
        <form onSubmit={handleSaveDepartment} className="space-y-4">
          <Input
            label="Department / Team Name *"
            value={deptForm.name}
            onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
            required
            placeholder="e.g. Research & Workshops"
          />
          <Textarea
            label="Description"
            value={deptForm.description}
            onChange={(e) => setDeptForm((p) => ({ ...p, description: e.target.value }))}
            rows={2}
          />
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Accent Color</label>
            <input
              type="color"
              value={deptForm.color}
              onChange={(e) => setDeptForm((p) => ({ ...p, color: e.target.value }))}
              className="w-12 h-9 rounded border border-border bg-white cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setShowDeptModal(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingDept ? 'Save Changes' : 'Create Department'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

