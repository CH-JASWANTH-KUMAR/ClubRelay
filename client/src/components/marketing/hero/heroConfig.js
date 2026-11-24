/**
 * heroConfig: Shared configuration, tokens, chip definitions, and handover modules
 * for the "Scattered to Handed Over" hero scene.
 */

export const CHIP_ITEMS = [
  { id: 'chat', label: 'Group chat', color: '#192B42', bg: '#FFFFFF', isAccent: false },
  { id: 'drive', label: 'Personal Drive', color: '#192B42', bg: '#FFFFFF', isAccent: false },
  { id: 'sheet', label: 'Spreadsheet', color: '#192B42', bg: '#FFFFFF', isAccent: false },
  { id: 'email', label: 'Old email', color: '#FFFFFF', bg: '#FF886B', isAccent: true }, // The lost important thing (Coral)
  { id: 'notes', label: 'Notes app', color: '#192B42', bg: '#FFFFFF', isAccent: false },
  { id: 'repo', label: 'Repo', color: '#192B42', bg: '#FFFFFF', isAccent: false },
];

export const HANDOVER_SECTIONS = [
  'Role responsibilities',
  'Outstanding tasks',
  'Pending commitments',
  'Future schedules',
  'Key documents',
  'Contact network',
  'Playbooks',
  'Lessons learned',
];

export const STORY_BEATS = [
  {
    phase: 0,
    timeRange: [0, 2.5],
    badge: 'Beat 1: Scattered',
    caption: 'Scattered across six places',
    subcaption: 'Group chats, individual drives, and personal notes lose context when officers graduate.',
  },
  {
    phase: 1,
    timeRange: [2.5, 5.0],
    badge: 'Beat 2: Gathered',
    caption: 'Gathered in one workspace',
    subcaption: 'Active tasks, approved budgets, and code repositories converge into the ClubRelay core.',
  },
  {
    phase: 2,
    timeRange: [5.0, 8.0],
    badge: 'Beat 3: Handed Over',
    caption: 'Handed to the next team',
    subcaption: 'An 8-section verified handover dossier passes securely to incoming leadership.',
  },
];

export const COLOR_TOKENS = {
  canvas: '#F7F8F4',
  surface: '#FFFFFF',
  ink: '#192B42',
  brand: '#315BDB',
  brandHover: '#284DC4',
  mint: '#2CBF9B',
  coral: '#FF886B',
  sunshine: '#F6C85F',
  border: '#E5E9E8',
};
