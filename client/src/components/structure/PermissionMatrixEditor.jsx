import React, { useState, useMemo } from 'react';
import { Search, Check, Shield, Info } from 'lucide-react';
import { clsx } from 'clsx';

export function PermissionMatrixEditor({
  modules = [],
  selectedPermissions = [],
  onChange,
  readOnly = false,
  compact = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const selectedSet = useMemo(() => new Set(selectedPermissions || []), [selectedPermissions]);

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return modules;
    return modules
      .map((mod) => ({
        ...mod,
        permissions: mod.permissions.filter(
          (p) =>
            p.label.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.key.toLowerCase().includes(q) ||
            mod.label.toLowerCase().includes(q)
        ),
      }))
      .filter((mod) => mod.permissions.length > 0);
  }, [modules, searchQuery]);

  const togglePermission = (key) => {
    if (readOnly) return;
    const next = new Set(selectedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(Array.from(next));
  };

  const toggleModuleAll = (mod) => {
    if (readOnly) return;
    const keys = mod.permissions.map((p) => p.key);
    const allSelected = keys.every((k) => selectedSet.has(k));
    const next = new Set(selectedSet);
    if (allSelected) {
      keys.forEach((k) => next.delete(k));
    } else {
      keys.forEach((k) => next.add(k));
    }
    onChange(Array.from(next));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-mutedSlate absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter capabilities (e.g. events, handover, members)..."
            aria-label="Filter capabilities"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm text-ink placeholder:text-mutedSlate/70 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-mutedSlate shrink-0">
          <Shield className="w-3.5 h-3.5 text-brand-600" />
          <span className="font-semibold text-ink">{selectedSet.size}</span>
          <span>capabilities enabled</span>
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-brand-50/70 border border-brand-200 text-xs text-ink-700">
        <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <span>
          Capabilities are granted explicitly per position. Reporting hierarchy in the organization chart is visual only and never automatically inherits parent permissions.
        </span>
      </div>

      <div className={clsx('space-y-3', compact ? 'max-h-[380px] overflow-y-auto pr-1' : '')}>
        {filteredModules.map((mod) => {
          const keys = mod.permissions.map((p) => p.key);
          const selectedCount = keys.filter((k) => selectedSet.has(k)).length;
          const allChecked = keys.length > 0 && selectedCount === keys.length;

          return (
            <div key={mod.key} className="rounded-xl border border-border bg-white overflow-hidden">
              <div className="px-4 py-2.5 bg-subtle/60 border-b border-border flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-heading text-sm font-bold text-ink">{mod.label}</h4>
                  {!compact && <p className="text-[11px] text-mutedSlate">{mod.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-mutedSlate">
                    {selectedCount}/{keys.length}
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => toggleModuleAll(mod)}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 px-2 py-1 rounded hover:bg-brand-50 transition-colors cursor-pointer"
                    >
                      {allChecked ? 'Clear' : 'Select all'}
                    </button>
                  )}
                </div>
              </div>

              <div className="divide-y divide-border/70">
                {mod.permissions.map((perm) => {
                  const checked = selectedSet.has(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={clsx(
                        'flex items-start gap-3 px-4 py-2.5 text-sm transition-colors',
                        readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-subtle/40'
                      )}
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        disabled={readOnly}
                        onClick={() => togglePermission(perm.key)}
                        className={clsx(
                          'mt-0.5 w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors',
                          checked
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'bg-white border-border text-transparent hover:border-brand-400'
                        )}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-ink text-xs sm:text-sm">{perm.label}</span>
                          <code className="text-[10px] px-1.5 py-0.5 rounded bg-subtle text-mutedSlate font-mono">
                            {perm.key}
                          </code>
                        </div>
                        <p className="text-xs text-mutedSlate mt-0.5">{perm.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="text-center py-8 text-xs text-mutedSlate border border-dashed border-border rounded-xl">
            No capabilities match &ldquo;{searchQuery}&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}

