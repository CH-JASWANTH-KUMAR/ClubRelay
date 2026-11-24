/**
 * heroGeometry.js
 * Single coordinate system for the ClubRelay Hero "Scattered to Handed Over" visual.
 * 
 * Stage dimensions: viewBox 640 x 400 (aspect ratio 16:10).
 * Main horizontal axis: y = 200.
 * Outgoing Lead node center: (72, 200).
 * Core center: (320, 200).
 * Incoming Lead node center: (568, 200).
 * Node radius = 28px (diameter = 56px).
 * Ribbons connect Outgoing node edge (x=100) to Incoming node edge (x=540).
 */

export const STAGE_WIDTH = 640;
export const STAGE_HEIGHT = 400;
export const MAIN_AXIS_Y = 200;

export const NODE_RADIUS = 28; // 56px circle
export const PACKET_RADIUS = 20; // 40px circle

export const OUTGOING_NODE = {
  x: 72,
  y: 200,
  r: NODE_RADIUS,
  edgeX: 72 + NODE_RADIUS, // 100
  label: 'Outgoing lead',
  sub: 'Term 2025-26',
};

export const CORE_CENTER = {
  x: 320,
  y: 200,
  r: 40,
};

export const INCOMING_NODE = {
  x: 568,
  y: 200,
  r: NODE_RADIUS,
  edgeX: 568 - NODE_RADIUS, // 540
  label: 'Incoming lead',
  sub: 'Term 2026-27',
};

// Ribbon paths starting at Outgoing edge (100, 200) and ending at Incoming edge (540, 200)
export const RIBBON_PATHS = {
  A: 'M 100,200 C 180,90 250,90 320,200 S 460,310 540,200',
  B: 'M 100,200 C 180,310 250,310 320,200 S 460,90 540,200',
};

// Motion paths for each chip from its rest position into the core (320, 200)
// Designed to seamlessly merge with Ribbon A or B
export const CHIP_SLOTS = [
  {
    id: 'chat',
    label: 'Group chat',
    xPct: 22,
    yPct: 12,
    rot: -5,
    w: 120,
    h: 34,
    dotColor: '#2563EB',
    ribbon: 'A',
    motionPath: 'M 140.8,48 C 180,50 250,90 320,200',
  },
  {
    id: 'notes',
    label: 'Notes app',
    xPct: 13,
    yPct: 84,
    rot: -4,
    w: 115,
    h: 34,
    dotColor: '#6366F1',
    ribbon: 'B',
    motionPath: 'M 83.2,336 C 140,336 220,310 320,200',
  },
  {
    id: 'drive',
    label: 'Personal Drive',
    xPct: 50,
    yPct: 9,
    rot: 4,
    w: 140,
    h: 34,
    dotColor: '#64748B',
    ribbon: 'A',
    motionPath: 'M 320,36 C 300,90 310,150 320,200',
  },
  {
    id: 'email',
    label: 'Old email',
    xPct: 35,
    yPct: 68,
    rot: 5,
    w: 110,
    h: 34,
    isAccent: true, // Warm Copper
    dotColor: '#EA580C',
    ribbon: 'B',
    motionPath: 'M 224,272 C 250,290 280,260 320,200',
  },
  {
    id: 'sheet',
    label: 'Spreadsheet',
    xPct: 9,
    yPct: 28,
    rot: -6,
    w: 130,
    h: 34,
    dotColor: '#10B981',
    ribbon: 'A',
    motionPath: 'M 57.6,112 C 100,90 220,90 320,200',
  },
  {
    id: 'repo',
    label: 'Repo',
    xPct: 47,
    yPct: 89,
    rot: 6,
    w: 90,
    h: 34,
    dotColor: '#06B6D4',
    ribbon: 'B',
    motionPath: 'M 300.8,356 C 290,300 310,250 320,200',
  },
];

export const BEATS = [
  {
    index: 1,
    title: 'Scattered across six places',
    sub: 'Loose context across group chats, personal drives, and scattered inboxes.',
  },
  {
    index: 2,
    title: 'Gathered in one workspace',
    sub: 'Active tasks, files, and project decisions unified in the ClubRelay core.',
  },
  {
    index: 3,
    title: 'Handed to the next team',
    sub: 'Complete 8-section successor dossier transferred with verified role custody.',
  },
];

/**
 * Dev-only layout validation check.
 * Warns if chip bounding boxes intersect or are closer than 16px to each other,
 * or within 70px of nodes, core, or label blocks.
 */
export function validateChipLayout() {
  if (process.env.NODE_ENV === 'production') return;

  const resolvedChips = CHIP_SLOTS.map((c) => ({
    ...c,
    x: (c.xPct / 100) * STAGE_WIDTH,
    y: (c.yPct / 100) * STAGE_HEIGHT,
  }));

  const obstacles = [
    { name: 'Outgoing Node', x: OUTGOING_NODE.x, y: OUTGOING_NODE.y },
    { name: 'Outgoing Label', x: OUTGOING_NODE.x, y: 245 },
    { name: 'Core', x: CORE_CENTER.x, y: CORE_CENTER.y },
    { name: 'Incoming Node', x: INCOMING_NODE.x, y: INCOMING_NODE.y },
    { name: 'Incoming Label', x: INCOMING_NODE.x, y: 245 },
  ];

  // Check obstacle distances
  resolvedChips.forEach((c) => {
    obstacles.forEach((o) => {
      const d = Math.hypot(c.x - o.x, c.y - o.y);
      if (d < 70) {
        console.warn(`[heroGeometry] ${c.id} center is ${d.toFixed(1)}px from ${o.name} (< 70px)`);
      }
    });
  });

  // Check pairwise gaps between chip bounding boxes
  for (let i = 0; i < resolvedChips.length; i++) {
    for (let j = i + 1; j < resolvedChips.length; j++) {
      const c1 = resolvedChips[i];
      const c2 = resolvedChips[j];
      const dx = Math.abs(c1.x - c2.x) - (c1.w / 2 + c2.w / 2);
      const dy = Math.abs(c1.y - c2.y) - (c1.h / 2 + c2.h / 2);
      const gap = Math.max(dx, dy);
      if (gap < 16) {
        console.warn(`[heroGeometry] Gap between ${c1.id} and ${c2.id} is ${gap.toFixed(1)}px (< 16px)`);
      }
    }
  }
}
