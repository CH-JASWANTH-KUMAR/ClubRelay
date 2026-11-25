import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Users,
  ShieldCheck,
  Plus,
  Edit3,
  Network,
} from 'lucide-react';

function buildOrgTrees(positions = []) {
  const activePositions = positions.filter((p) => p.isActive !== false);
  const byId = new Map(activePositions.map((p) => [p._id, { ...p, children: [] }]));
  const roots = [];

  for (const node of byId.values()) {
    if (node.parentPositionId && byId.has(node.parentPositionId)) {
      byId.get(node.parentPositionId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function OrgNodeCard({
  node,
  deptMap,
  assignmentsByPosition,
  canEdit,
  onSelectPosition,
  onAddSubPosition,
}) {
  const holders = assignmentsByPosition[node._id] || [];
  const dept = node.departmentId ? deptMap.get(node.departmentId) : null;
  const maxLabel = node.maxHolders ? `${holders.length} / ${node.maxHolders}` : `${holders.length}`;

  return (
    <div
      className="min-w-[220px] max-w-[260px] rounded-xl border border-border bg-surface shadow-subtle hover:border-brand-300 transition-all text-left overflow-hidden"
      style={{
        borderTopWidth: '3px',
        borderTopColor: dept?.color || (node.isLeadership ? '#315BDB' : '#CBD5E1'),
      }}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-heading text-sm font-bold text-ink leading-tight truncate">
                {node.name}
              </h4>
            </div>
            {dept && (
              <span className="inline-block text-[10px] font-semibold text-mutedSlate mt-0.5">
                {dept.name}
              </span>
            )}
          </div>
          {node.isLeadership && (
            <span className="shrink-0 px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold">
              Lead
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-mutedSlate pt-1 border-t border-border/60">
          <span className="inline-flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Holders: {maxLabel}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-brand-600" />
            <span>{node.permissions?.length || 0}</span>
          </span>
        </div>

        {holders.length > 0 && (
          <div className="space-y-1 pt-1">
            {holders.slice(0, 3).map((h) => (
              <div key={h._id} className="text-[11px] font-medium text-ink truncate bg-subtle/70 rounded px-2 py-0.5">
                {h.user?.fullName || 'Assigned Member'}
              </div>
            ))}
            {holders.length > 3 && (
              <div className="text-[10px] text-mutedSlate px-1">+{holders.length - 3} more</div>
            )}
          </div>
        )}

        {canEdit && (
          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => onSelectPosition?.(node)}
              className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-ink hover:text-brand-600 py-1 rounded border border-border hover:bg-subtle transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => onAddSubPosition?.(node)}
              className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-50 px-2 py-1 rounded border border-brand-200 transition-colors cursor-pointer"
              title={`Add position reporting to ${node.name}`}
            >
              <Plus className="w-3 h-3" />
              <span>Sub-role</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DesktopBranch({
  node,
  deptMap,
  assignmentsByPosition,
  canEdit,
  onSelectPosition,
  onAddSubPosition,
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center">
        <OrgNodeCard
          node={node}
          deptMap={deptMap}
          assignmentsByPosition={assignmentsByPosition}
          canEdit={canEdit}
          onSelectPosition={onSelectPosition}
          onAddSubPosition={onAddSubPosition}
        />

        {hasChildren && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-label={expanded ? `Collapse reports under ${node.name}` : `Expand reports under ${node.name}`}
            className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-border text-[10px] font-semibold text-mutedSlate hover:text-ink shadow-sm cursor-pointer z-10"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span>{node.children.length}</span>
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col items-center">
          <div className="w-px h-5 bg-border" />
          <div className="relative flex items-start gap-6 pt-4">
            {node.children.length > 1 && (
              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-border" />
            )}
            {node.children.map((child) => (
              <div key={child._id} className="relative flex flex-col items-center">
                <div className="w-px h-4 bg-border -mt-4 mb-0" />
                <DesktopBranch
                  node={child}
                  deptMap={deptMap}
                  assignmentsByPosition={assignmentsByPosition}
                  canEdit={canEdit}
                  onSelectPosition={onSelectPosition}
                  onAddSubPosition={onAddSubPosition}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileTreeList({
  nodes,
  depth = 0,
  deptMap,
  assignmentsByPosition,
  canEdit,
  onSelectPosition,
  onAddSubPosition,
}) {
  return (
    <div className="space-y-2.5">
      {nodes.map((node) => {
        const dept = node.departmentId ? deptMap.get(node.departmentId) : null;
        const holders = assignmentsByPosition[node._id] || [];
        return (
          <div key={node._id} style={{ paddingLeft: `${Math.min(depth * 16, 48)}px` }}>
            <div
              className="rounded-xl border border-border bg-surface p-3 space-y-2"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: dept?.color || (node.isLeadership ? '#315BDB' : '#CBD5E1'),
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-sm font-bold text-ink">{node.name}</span>
                    {node.isLeadership && (
                      <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold">
                        Lead
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-mutedSlate mt-0.5">
                    {dept ? `${dept.name} · ` : ''}
                    {holders.length}{node.maxHolders ? ` / ${node.maxHolders}` : ''} holders · {node.permissions?.length || 0} permissions
                  </p>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectPosition?.(node)}
                      className="p-1.5 rounded border border-border text-ink hover:bg-subtle cursor-pointer"
                      aria-label={`Edit ${node.name}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddSubPosition?.(node)}
                      className="p-1.5 rounded border border-brand-200 text-brand-600 hover:bg-brand-50 cursor-pointer"
                      aria-label={`Add child position under ${node.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {holders.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {holders.map((h) => (
                    <span key={h._id} className="text-[11px] bg-subtle px-2 py-0.5 rounded text-ink font-medium">
                      {h.user?.fullName || 'Member'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {node.children?.length > 0 && (
              <div className="mt-2">
                <MobileTreeList
                  nodes={node.children}
                  depth={depth + 1}
                  deptMap={deptMap}
                  assignmentsByPosition={assignmentsByPosition}
                  canEdit={canEdit}
                  onSelectPosition={onSelectPosition}
                  onAddSubPosition={onAddSubPosition}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrgChartCanvas({
  positions = [],
  departments = [],
  assignmentsByPosition = {},
  canEdit = false,
  onSelectPosition,
  onAddSubPosition,
}) {
  const deptMap = useMemo(
    () => new Map(departments.map((d) => [d._id, d])),
    [departments]
  );

  const trees = useMemo(() => buildOrgTrees(positions), [positions]);

  if (trees.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center space-y-2">
        <Network className="w-8 h-8 text-mutedSlate mx-auto" />
        <h3 className="font-heading text-base font-bold text-ink">No positions defined yet</h3>
        <p className="text-xs text-mutedSlate max-w-md mx-auto">
          Add top-level or collaborative roles for your organization. Every team defines its own structure without rigid preset ranks.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Tree Canvas */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="flex flex-wrap justify-center gap-8 p-6 rounded-xl bg-canvas border border-border">
          {trees.map((rootNode) => (
            <DesktopBranch
              key={rootNode._id}
              node={rootNode}
              deptMap={deptMap}
              assignmentsByPosition={assignmentsByPosition}
              canEdit={canEdit}
              onSelectPosition={onSelectPosition}
              onAddSubPosition={onAddSubPosition}
            />
          ))}
        </div>
      </div>

      {/* Mobile Clean Hierarchical List Fallback */}
      <div className="md:hidden">
        <MobileTreeList
          nodes={trees}
          deptMap={deptMap}
          assignmentsByPosition={assignmentsByPosition}
          canEdit={canEdit}
          onSelectPosition={onSelectPosition}
          onAddSubPosition={onAddSubPosition}
        />
      </div>
    </div>
  );
}
