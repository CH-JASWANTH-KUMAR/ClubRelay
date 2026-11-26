/**
 * ClubRelay Capability-Based Permissions Catalogue
 *
 * Every organization defines its own custom positions and grants explicit
 * capabilities from this catalogue. Hierarchical parent positions do NOT
 * inherit or override capabilities unless explicitly configured.
 */

export const PERMISSION_MODULES = [
  {
    key: 'organization',
    label: 'Organization & Governance',
    description: 'Workspace settings, academic terms, hierarchy builder, and ownership controls.',
    permissions: [
      {
        key: 'club.view_overview',
        label: 'View Organization Overview',
        description: 'Access the main organization workspace dashboard and leadership summary.',
      },
      {
        key: 'club.manage_settings',
        label: 'Manage Organization Settings',
        description: 'Edit organization profile, visibility, join policies, and governance rules.',
      },
      {
        key: 'club.manage_structure',
        label: 'Manage Structure & Positions',
        description: 'Create, edit, archive, and organize departments, positions, and permission bundles.',
      },
      {
        key: 'club.manage_terms',
        label: 'Manage Academic Terms',
        description: 'Create and switch active academic terms and term transition windows.',
      },
      {
        key: 'club.transfer_ownership',
        label: 'Transfer Workspace Ownership',
        description: 'Delegate primary workspace ownership to another active organization member.',
      },
    ],
  },
  {
    key: 'members',
    label: 'Members & Onboarding',
    description: 'Directory visibility, invitations, join requests, and role assignments.',
    permissions: [
      {
        key: 'members.view',
        label: 'View Member Directory',
        description: 'Browse organization members and their assigned positions for the selected term.',
      },
      {
        key: 'members.view_sensitive',
        label: 'View Sensitive Member Contact Info',
        description: 'View phone numbers and extended contact details in member rosters.',
      },
      {
        key: 'members.invite',
        label: 'Send Invitations',
        description: 'Generate and revoke secure single-use invitation links for prospective members.',
      },
      {
        key: 'members.approve_requests',
        label: 'Review Join Requests',
        description: 'Approve or reject incoming student join requests.',
      },
      {
        key: 'members.manage',
        label: 'Manage Member Status',
        description: 'Suspend, reinstate, or remove members from the organization.',
      },
      {
        key: 'members.assign_positions',
        label: 'Assign & End Position Tenures',
        description: 'Assign custom positions to members and end active term tenures.',
      },
    ],
  },
  {
    key: 'events',
    label: 'Events & Programming',
    description: 'Event planning, editing, faculty approval submissions, and retrospectives.',
    permissions: [
      {
        key: 'events.view',
        label: 'View Events',
        description: 'See upcoming and past organization events and retrospectives.',
      },
      {
        key: 'events.create',
        label: 'Create Events',
        description: 'Draft new workshops, hackathons, meetups, and programs.',
      },
      {
        key: 'events.edit',
        label: 'Edit Events',
        description: 'Update event schedules, budgets, venues, and runbooks.',
      },
      {
        key: 'events.delete',
        label: 'Delete Draft Events',
        description: 'Remove draft or cancelled events.',
      },
      {
        key: 'events.submit_for_approval',
        label: 'Submit Events for Campus Approval',
        description: 'Route proposed events to faculty coordinators or campus administrators.',
      },
      {
        key: 'events.approve_internal',
        label: 'Internal Event Sign-Off',
        description: 'Review and mark event proposals as internally cleared.',
      },
    ],
  },
  {
    key: 'projects',
    label: 'Projects & Tasks',
    description: 'Action boards, task assignment, deadlines, and cross-team coordination.',
    permissions: [
      {
        key: 'projects.view',
        label: 'View Projects & Workstreams',
        description: 'Browse organization projects and shared operational boards.',
      },
      {
        key: 'projects.create',
        label: 'Create Projects & Tasks',
        description: 'Create new operational tasks and initiative workstreams.',
      },
      {
        key: 'projects.edit',
        label: 'Edit Any Task',
        description: 'Modify, reassign, or delete organization tasks.',
      },
      {
        key: 'projects.assign_tasks',
        label: 'Assign Tasks to Members',
        description: 'Delegate tasks and set priority deadlines for teammates.',
      },
      {
        key: 'tasks.view',
        label: 'View Task Board',
        description: 'Inspect organization task boards and checklists.',
      },
      {
        key: 'tasks.manage',
        label: 'Full Task Management',
        description: 'Create, reassign, block, and close any task across events.',
      },
      {
        key: 'tasks.update_own',
        label: 'Update Assigned Tasks',
        description: 'Update status and progress on tasks assigned directly to oneself.',
      },
    ],
  },
  {
    key: 'knowledge',
    label: 'Knowledge Base & Playbooks',
    description: 'Institutional guides, SOPs, templates, and post-event documentation.',
    permissions: [
      {
        key: 'knowledge.view',
        label: 'View Knowledge Base',
        description: 'Read playbooks, guides, and institutional documentation.',
      },
      {
        key: 'knowledge.create',
        label: 'Create Playbooks & Docs',
        description: 'Publish new documentation, SOPs, and templates.',
      },
      {
        key: 'knowledge.edit',
        label: 'Edit Documentation',
        description: 'Revise existing knowledge base articles and playbooks.',
      },
      {
        key: 'knowledge.delete',
        label: 'Delete Documentation',
        description: 'Archive or remove outdated knowledge items.',
      },
    ],
  },
  {
    key: 'contacts',
    label: 'Sponsors & External Contacts',
    description: 'Vendors, speakers, alumni mentors, and sponsor partners.',
    permissions: [
      {
        key: 'contacts.view',
        label: 'View Contact Directory',
        description: 'Access vendor, speaker, and partner profiles.',
      },
      {
        key: 'contacts.create',
        label: 'Add Contacts',
        description: 'Create new vendor, speaker, or sponsor entries.',
      },
      {
        key: 'contacts.edit',
        label: 'Edit Contacts',
        description: 'Update partner relationship notes and verification status.',
      },
    ],
  },
  {
    key: 'decisions',
    label: 'Decisions & Meeting Logs',
    description: 'Formal governance logs, consensus records, and policy minutes.',
    permissions: [
      {
        key: 'decisions.view',
        label: 'View Decision Log',
        description: 'Read recorded organizational decisions and rationale.',
      },
      {
        key: 'decisions.record',
        label: 'Record Decisions',
        description: 'Create immutable governance decision records.',
      },
    ],
  },
  {
    key: 'announcements',
    label: 'Announcements & Updates',
    description: 'Internal organization broadcasts and operational bulletins.',
    permissions: [
      {
        key: 'announcements.view',
        label: 'View Announcements',
        description: 'Read internal organization updates.',
      },
      {
        key: 'announcements.publish',
        label: 'Publish Announcements',
        description: 'Broadcast notices to organization members.',
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports & Analytics',
    description: 'Term performance summaries and CSV data exports.',
    permissions: [
      {
        key: 'reports.view',
        label: 'View Annual & Term Reports',
        description: 'Access event outcomes, participation summaries, and metrics.',
      },
      {
        key: 'reports.export',
        label: 'Export Reports (CSV)',
        description: 'Download structured report exports.',
      },
    ],
  },
  {
    key: 'handover',
    label: 'Leadership Handover & Continuity',
    description: 'Term-end position continuity packages and acknowledgements.',
    permissions: [
      {
        key: 'handover.view',
        label: 'View Handover Packages',
        description: 'View handover continuity packages relevant to assigned or team roles.',
      },
      {
        key: 'handover.manage_own',
        label: 'Prepare Own Position Handover',
        description: 'Author and submit continuity notes for your held positions.',
      },
      {
        key: 'handover.manage_all',
        label: 'Initiate & Oversee All Handovers',
        description: 'Create, inspect, and coordinate handovers across all organization positions.',
      },
      {
        key: 'handover.approve',
        label: 'Finalize & Complete Handovers',
        description: 'Execute final position transition and term rollover completion.',
      },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_MODULES.flatMap((mod) =>
  mod.permissions.map((p) => p.key)
);

export const PERMISSION_SET = new Set(ALL_PERMISSIONS);

export function isValidPermission(key) {
  return PERMISSION_SET.has(key);
}

export function normalizePermissions(list = []) {
  if (!Array.isArray(list)) return [];
  const unique = new Set();
  for (const item of list) {
    if (typeof item === 'string' && PERMISSION_SET.has(item.trim())) {
      unique.add(item.trim());
    }
  }
  return Array.from(unique);
}

/**
 * Backwards-compatible mapping from legacy fixed Membership.clubRole enums
 * to explicit capability bundles. Used ONLY for legacy Membership documents
 * that have not yet been migrated to custom ClubPositionAssignments.
 */
export const LEGACY_ROLE_PERMISSIONS = {
  PRESIDENT: [...ALL_PERMISSIONS],
  SECRETARY: [
    'club.view_overview',
    'club.manage_settings',
    'club.manage_structure',
    'club.manage_terms',
    'members.view',
    'members.view_sensitive',
    'members.invite',
    'members.approve_requests',
    'members.manage',
    'members.assign_positions',
    'events.view',
    'events.create',
    'events.edit',
    'events.delete',
    'events.submit_for_approval',
    'events.approve_internal',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.assign_tasks',
    'tasks.view',
    'tasks.manage',
    'tasks.update_own',
    'knowledge.view',
    'knowledge.create',
    'knowledge.edit',
    'contacts.view',
    'contacts.create',
    'contacts.edit',
    'decisions.view',
    'decisions.record',
    'announcements.view',
    'announcements.publish',
    'reports.view',
    'reports.export',
    'handover.view',
    'handover.manage_own',
  ],
  CORE_TEAM: [
    'club.view_overview',
    'members.view',
    'events.view',
    'events.create',
    'events.edit',
    'events.submit_for_approval',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.assign_tasks',
    'tasks.view',
    'tasks.manage',
    'tasks.update_own',
    'knowledge.view',
    'knowledge.create',
    'knowledge.edit',
    'contacts.view',
    'contacts.create',
    'contacts.edit',
    'decisions.view',
    'announcements.view',
    'reports.view',
    'handover.view',
    'handover.manage_own',
  ],
  GENERAL_MEMBER: [
    'club.view_overview',
    'members.view',
    'events.view',
    'projects.view',
    'tasks.view',
    'tasks.update_own',
    'knowledge.view',
    'contacts.view',
    'decisions.view',
    'announcements.view',
    'reports.view',
  ],
};

export const LEGACY_ROLE_DISPLAY = {
  PRESIDENT: {
    name: 'Executive Chair (Legacy President)',
    slug: 'legacy-president',
    description: 'Migrated from legacy President role.',
    isLeadership: true,
    maxHolders: 2,
    sortOrder: 1,
  },
  SECRETARY: {
    name: 'Operations Secretary (Legacy)',
    slug: 'legacy-secretary',
    description: 'Migrated from legacy Secretary role.',
    isLeadership: true,
    maxHolders: 2,
    sortOrder: 2,
  },
  CORE_TEAM: {
    name: 'Core Coordinator (Legacy Core Team)',
    slug: 'legacy-core-team',
    description: 'Migrated from legacy Core Team role.',
    isLeadership: true,
    maxHolders: null,
    sortOrder: 3,
  },
  GENERAL_MEMBER: {
    name: 'General Member',
    slug: 'legacy-general-member',
    description: 'Migrated from legacy General Member role.',
    isLeadership: false,
    maxHolders: null,
    sortOrder: 4,
  },
};
