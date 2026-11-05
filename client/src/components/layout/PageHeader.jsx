import React from 'react';

export function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-charcoal-900 tracking-tight">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-charcoal-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
