import os
import subprocess

IMG_DIR = os.path.abspath('client/public/assets/images')
os.makedirs(IMG_DIR, exist_ok=True)

# 1. Hero Editorial Visual: Student Engineering Flight Deck
HERO_VISUAL_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" fill="none">
  <defs>
    <linearGradient id="heroCardBg" x1="0" y1="0" x2="800" y2="560" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCFDFD" />
      <stop offset="100%" stop-color="#F7F8F4" />
    </linearGradient>
    <linearGradient id="laptopScreen" x1="0" y1="0" x2="480" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#192B42" />
      <stop offset="100%" stop-color="#0F1C2D" />
    </linearGradient>
    <linearGradient id="blueAccent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5D8BEE" />
      <stop offset="100%" stop-color="#315BDB" />
    </linearGradient>
    <linearGradient id="mintAccent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#52C9B0" />
      <stop offset="100%" stop-color="#2CBF9B" />
    </linearGradient>
    <linearGradient id="coralAccent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF9B85" />
      <stop offset="100%" stop-color="#FF886B" />
    </linearGradient>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#192B42" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Clean Canvas Table Surface -->
  <rect x="20" y="20" width="760" height="520" rx="24" fill="url(#heroCardBg)" stroke="#E5E9E8" stroke-width="1.5" />

  <!-- Grid Blueprint Accents on Table -->
  <line x1="20" y1="120" x2="780" y2="120" stroke="#E5E9E8" stroke-dasharray="4 4" stroke-width="1" />
  <line x1="20" y1="420" x2="780" y2="420" stroke="#E5E9E8" stroke-dasharray="4 4" stroke-width="1" />
  <line x1="240" y1="20" x2="240" y2="540" stroke="#E5E9E8" stroke-dasharray="4 4" stroke-width="1" />
  <line x1="560" y1="20" x2="560" y2="540" stroke="#E5E9E8" stroke-dasharray="4 4" stroke-width="1" />

  <!-- Main Student Laptop Mockup (Center Stage) -->
  <g transform="translate(160, 70)" filter="url(#cardShadow)">
    <!-- Laptop Lid -->
    <rect width="480" height="310" rx="16" fill="#243B53" stroke="#334E68" stroke-width="2" />
    <!-- Screen Bezel -->
    <rect x="12" y="12" width="456" height="286" rx="8" fill="url(#laptopScreen)" />
    
    <!-- Screen Header Bar -->
    <rect x="12" y="12" width="456" height="32" fill="#132338" />
    <circle cx="30" cy="28" r="4.5" fill="#FF886B" />
    <circle cx="44" cy="28" r="4.5" fill="#F6C85F" />
    <circle cx="58" cy="28" r="4.5" fill="#2CBF9B" />
    <text x="80" y="32" font-family="'DM Sans', sans-serif" font-size="11" font-weight="600" fill="#9FB3C8">Club Workspace · Pacific Coast University</text>

    <!-- Inside Screen UI: Multi-Tab Operational Cockpit -->
    <!-- Left Navigation Mini Rail -->
    <rect x="20" y="54" width="90" height="234" rx="6" fill="#192B42" />
    <rect x="26" y="64" width="78" height="20" rx="4" fill="rgba(49, 91, 219, 0.25)" />
    <text x="36" y="78" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" fill="#5D8BEE">Dashboard</text>
    <text x="36" y="104" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#829AB1">Events (3)</text>
    <text x="36" y="128" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#829AB1">Playbooks</text>
    <text x="36" y="152" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#829AB1">Handovers</text>

    <!-- Main Workspace Area inside screen -->
    <rect x="120" y="54" width="338" height="74" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
    <text x="136" y="80" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">Google Developer Group</text>
    <text x="136" y="98" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#BDCFF8">Active Term: Spring 2026 · 24 Verified Members</text>
    <rect x="370" y="72" width="76" height="22" rx="11" fill="rgba(44, 191, 155, 0.2)" />
    <text x="382" y="87" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" fill="#2CBF9B">APPROVED</text>

    <!-- Event Cards Grid inside screen -->
    <rect x="120" y="140" width="162" height="148" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
    <text x="132" y="162" font-family="'Outfit', sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">DevFest 2026 Summit</text>
    <text x="132" y="178" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#829AB1">Oct 24 · CS Main Hall</text>
    <rect x="132" y="190" width="138" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
    <rect x="132" y="190" width="115" height="6" rx="3" fill="#315BDB" />
    <text x="132" y="214" font-family="'DM Sans', sans-serif" font-size="10" font-weight="600" fill="#BDCFF8">Tasks: 18 / 20 Done</text>
    <rect x="132" y="244" width="74" height="20" rx="4" fill="#315BDB" />
    <text x="144" y="258" font-family="'DM Sans', sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">Open Cockpit</text>

    <!-- Succession Health Widget inside screen -->
    <rect x="294" y="140" width="164" height="148" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
    <text x="306" y="162" font-family="'Outfit', sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">Handover Readiness</text>
    <text x="306" y="178" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#2CBF9B">7 of 7 Sections Verified</text>
    <circle cx="376" cy="225" r="32" stroke="rgba(255,255,255,0.1)" stroke-width="6" fill="none" />
    <circle cx="376" cy="225" r="32" stroke="#2CBF9B" stroke-width="6" stroke-dasharray="160 200" fill="none" />
    <text x="364" y="230" font-family="'Outfit', sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">88%</text>

    <!-- Laptop Base -->
    <path d="M -30 310 L 510 310 L 490 324 L -10 324 Z" fill="#192B42" />
    <rect x="190" y="310" width="100" height="6" rx="3" fill="#334E68" />
  </g>

  <!-- Left Side: Real Student Engineering Artifacts -->
  <!-- Microcontroller Board with Jumper Wires -->
  <g transform="translate(45, 180)" filter="url(#cardShadow)">
    <rect width="100" height="130" rx="8" fill="#1F8A70" stroke="#155C4A" stroke-width="1.5" />
    <!-- Chip -->
    <rect x="30" y="45" width="40" height="40" rx="4" fill="#192B42" />
    <text x="37" y="68" font-family="'Courier New', monospace" font-size="8" font-weight="700" fill="#52C9B0">ARM32</text>
    <!-- Pins & LEDs -->
    <circle cx="20" cy="20" r="3" fill="#F6C85F" />
    <circle cx="30" cy="20" r="3" fill="#2CBF9B" />
    <circle cx="40" cy="20" r="3" fill="#FF886B" />
    <!-- Wires curving toward laptop -->
    <path d="M 90 35 C 130 35, 120 120, 160 120" stroke="#315BDB" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 90 55 C 130 55, 120 135, 160 135" stroke="#F6C85F" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M 90 75 C 130 75, 120 150, 160 150" stroke="#FF886B" stroke-width="3" fill="none" stroke-linecap="round" />
  </g>

  <!-- Student Hackathon ID Badge -->
  <g transform="translate(50, 345)" filter="url(#cardShadow)">
    <!-- Lanyard Strap -->
    <path d="M 45 0 C 45 -40, 10 -40, 10 -70" stroke="#315BDB" stroke-width="6" fill="none" />
    <!-- Badge Card -->
    <rect width="95" height="135" rx="10" fill="#FFFFFF" stroke="#E5E9E8" stroke-width="1.5" />
    <rect x="8" y="8" width="79" height="28" rx="4" fill="#315BDB" />
    <text x="18" y="26" font-family="'Outfit', sans-serif" font-size="10" font-weight="800" fill="#FFFFFF">LEAD ORGANIZER</text>
    <circle cx="47" cy="65" r="18" fill="#EEF2FD" />
    <circle cx="47" cy="60" r="8" fill="#315BDB" />
    <path d="M 35 77 C 35 71, 41 68, 47 68 C 53 68, 59 71, 59 77 Z" fill="#315BDB" />
    <text x="22" y="102" font-family="'Outfit', sans-serif" font-size="11" font-weight="700" fill="#192B42">Maya Chen</text>
    <text x="20" y="116" font-family="'DM Sans', sans-serif" font-size="8" font-weight="600" fill="#68788B">President '26</text>
  </g>

  <!-- Right Side: Handover Dossier & Playbook Binder -->
  <g transform="translate(635, 140)" filter="url(#cardShadow)">
    <!-- Document Stack -->
    <rect x="8" y="8" width="120" height="160" rx="8" fill="#F1F3EE" stroke="#E5E9E8" />
    <rect width="120" height="160" rx="8" fill="#FFFFFF" stroke="#E5E9E8" stroke-width="1.5" />
    
    <!-- Header Ribbon -->
    <rect x="12" y="16" width="96" height="16" rx="4" fill="#EAF8F5" />
    <text x="18" y="28" font-family="'DM Sans', sans-serif" font-size="8" font-weight="700" fill="#1F8A70">✓ 7-SECTION DOSSIER</text>
    
    <line x1="16" y1="46" x2="104" y2="46" stroke="#E5E9E8" stroke-width="3" stroke-linecap="round" />
    <line x1="16" y1="58" x2="88" y2="58" stroke="#E5E9E8" stroke-width="3" stroke-linecap="round" />
    <line x1="16" y1="70" x2="98" y2="70" stroke="#E5E9E8" stroke-width="3" stroke-linecap="round" />
    <line x1="16" y1="82" x2="78" y2="82" stroke="#E5E9E8" stroke-width="3" stroke-linecap="round" />

    <!-- Approved Seal Stamp -->
    <circle cx="60" cy="120" r="22" fill="none" stroke="#2CBF9B" stroke-width="2" stroke-dasharray="4 2" />
    <text x="44" y="123" font-family="'Outfit', sans-serif" font-size="8" font-weight="800" fill="#2CBF9B">FACULTY</text>
    <text x="43" y="131" font-family="'Outfit', sans-serif" font-size="7" font-weight="700" fill="#1F8A70">VERIFIED</text>
  </g>

  <!-- Sticky Note: "Pass to incoming team" -->
  <g transform="translate(645, 330) rotate(-4)" filter="url(#cardShadow)">
    <rect width="105" height="105" rx="6" fill="#FDF1D2" stroke="#F6C85F" stroke-width="1" />
    <text x="12" y="28" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" fill="#967118">Succession Notes:</text>
    <text x="12" y="46" font-family="'DM Sans', sans-serif" font-size="9" font-weight="500" fill="#B88D22">• CS Lab 301 Hold</text>
    <text x="12" y="60" font-family="'DM Sans', sans-serif" font-size="9" font-weight="500" fill="#B88D22">• AWS Sponsor POC</text>
    <text x="12" y="74" font-family="'DM Sans', sans-serif" font-size="9" font-weight="500" fill="#B88D22">• Git keys transferred</text>
    <rect x="12" y="86" width="60" height="12" rx="3" fill="#F6C85F" />
    <text x="18" y="95" font-family="'DM Sans', sans-serif" font-size="7" font-weight="700" fill="#7A5A12">READY TO RELAY</text>
  </g>
</svg>
"""

# 2. Semester Continuity & Handover Transition Visual
CONTINUITY_VISUAL_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" fill="none">
  <defs>
    <linearGradient id="bridgeGrad" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#315BDB" />
      <stop offset="50%" stop-color="#2CBF9B" />
      <stop offset="100%" stop-color="#315BDB" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F7F8F4" />
    </linearGradient>
    <filter id="floatShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#192B42" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Clean Background Container -->
  <rect x="20" y="20" width="760" height="440" rx="20" fill="url(#cardGrad)" stroke="#E5E9E8" stroke-width="1.5" />

  <!-- The Continuity Bridge Ribbon across semesters -->
  <path d="M 80 240 C 220 160, 340 320, 480 240 C 580 180, 660 220, 720 240"
        stroke="url(#bridgeGrad)" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.85" />
  <path d="M 80 240 C 220 160, 340 320, 480 240 C 580 180, 660 220, 720 240"
        stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 8" fill="none" opacity="0.6" />

  <!-- Outgoing Board Station (Left) -->
  <g transform="translate(60, 150)" filter="url(#floatShadow)">
    <rect width="180" height="180" rx="16" fill="#FFFFFF" stroke="#E5E9E8" stroke-width="1.5" />
    <rect x="16" y="16" width="90" height="22" rx="6" fill="#EEF2FD" />
    <text x="24" y="31" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" fill="#315BDB">FALL 2025 TERM</text>
    
    <circle cx="50" cy="74" r="22" fill="#DCE5FB" />
    <text x="41" y="80" font-family="'Outfit', sans-serif" font-size="14" font-weight="800" fill="#1F3EA8">SL</text>
    <text x="82" y="72" font-family="'Outfit', sans-serif" font-size="13" font-weight="700" fill="#192B42">Outgoing Lead</text>
    <text x="82" y="86" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#68788B">Graduating Senior</text>

    <line x1="16" y1="110" x2="164" y2="110" stroke="#E5E9E8" />
    <text x="16" y="132" font-family="'DM Sans', sans-serif" font-size="11" font-weight="600" fill="#192B42">Playbooks compiled</text>
    <text x="16" y="148" font-family="'DM Sans', sans-serif" font-size="11" font-weight="600" fill="#192B42">Sponsor contacts mapped</text>
    <rect x="16" y="156" width="148" height="6" rx="3" fill="#2CBF9B" />
  </g>

  <!-- Handover Baton Pass Nexus (Center Stage) -->
  <g transform="translate(320, 120)" filter="url(#floatShadow)">
    <!-- Glowing Relay Baton Container -->
    <rect width="160" height="240" rx="20" fill="#192B42" stroke="#315BDB" stroke-width="2" />
    
    <!-- Transfer Badge -->
    <rect x="20" y="20" width="120" height="24" rx="6" fill="rgba(44, 191, 155, 0.2)" />
    <text x="32" y="36" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" fill="#2CBF9B">ATOMIC HANDOVER</text>

    <!-- Passing Baton Illustration -->
    <g transform="translate(48, 60)">
      <rect x="24" y="0" width="16" height="70" rx="8" fill="#315BDB" />
      <rect x="24" y="25" width="16" height="25" rx="4" fill="#2CBF9B" />
      <circle cx="32" cy="37" r="5" fill="#FF886B" />
      <circle cx="32" cy="37" r="2.5" fill="#FFFFFF" />
    </g>

    <text x="24" y="158" font-family="'Outfit', sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">7-Section Dossier</text>
    <text x="24" y="174" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#BDCFF8">Zero Lost Passwords</text>
    <text x="24" y="188" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#BDCFF8">Verified Faculty Sign-Off</text>
    <rect x="24" y="202" width="112" height="22" rx="6" fill="#315BDB" />
    <text x="34" y="217" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" fill="#FFFFFF">TRANSFERRED ✓</text>
  </g>

  <!-- Incoming Board Station (Right) -->
  <g transform="translate(560, 150)" filter="url(#floatShadow)">
    <rect width="180" height="180" rx="16" fill="#FFFFFF" stroke="#E5E9E8" stroke-width="1.5" />
    <rect x="16" y="16" width="105" height="22" rx="6" fill="#EAF8F5" />
    <text x="24" y="31" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" fill="#1F8A70">SPRING 2026 TERM</text>

    <circle cx="50" cy="74" r="22" fill="#D5F2EC" />
    <text x="41" y="80" font-family="'Outfit', sans-serif" font-size="14" font-weight="800" fill="#1F8A70">AL</text>
    <text x="82" y="72" font-family="'Outfit', sans-serif" font-size="13" font-weight="700" fill="#192B42">Incoming Lead</text>
    <text x="82" y="86" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#68788B">Sophomore Lead</text>

    <line x1="16" y1="110" x2="164" y2="110" stroke="#E5E9E8" />
    <text x="16" y="132" font-family="'DM Sans', sans-serif" font-size="11" font-weight="600" fill="#1F8A70">Day 1 Execution Ready</text>
    <text x="16" y="148" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#68788B">Starts ahead, not from zero</text>
    <rect x="16" y="156" width="148" height="6" rx="3" fill="#315BDB" />
  </g>
</svg>
"""

# 3. Technical Communities Workbench Visual
COMMUNITIES_VISUAL_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" fill="none">
  <defs>
    <linearGradient id="commBg" x1="0" y1="0" x2="800" y2="480" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FCFDFD" />
      <stop offset="100%" stop-color="#F7F8F4" />
    </linearGradient>
    <filter id="commShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#192B42" flood-opacity="0.06" />
    </filter>
  </defs>

  <rect x="20" y="20" width="760" height="440" rx="20" fill="url(#commBg)" stroke="#E5E9E8" stroke-width="1.5" />

  <!-- 4 Dynamic Sector Quadrants representing diverse campus societies -->
  
  <!-- Quadrant 1: Developer & Open Source Guilds (Top-Left) -->
  <g transform="translate(50, 50)" filter="url(#commShadow)">
    <rect width="335" height="180" rx="16" fill="#FFFFFF" stroke="#E5E9E8" stroke-width="1.5" />
    <rect x="20" y="20" width="36" height="36" rx="8" fill="#EEF2FD" />
    <!-- Terminal Icon -->
    <path d="M 28 32 L 34 38 L 28 44 M 38 44 L 46 44" stroke="#315BDB" stroke-width="2" stroke-linecap="round" />
    <text x="68" y="38" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" fill="#192B42">Developer Collectives</text>
    <text x="68" y="52" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#68788B">GDG, ACM, Open Source &amp; Hackathons</text>
    
    <!-- Code Snippet preview -->
    <rect x="20" y="74" width="295" height="86" rx="8" fill="#192B42" />
    <text x="32" y="96" font-family="'Courier New', monospace" font-size="10" fill="#52C9B0">git checkout -b spring-2026-relay</text>
    <text x="32" y="116" font-family="'Courier New', monospace" font-size="10" fill="#5D8BEE">clubrelay deploy --env campus-prod</text>
    <text x="32" y="136" font-family="'Courier New', monospace" font-size="10" fill="#F6C85F">✓ 14 micro-services active</text>
  </g>

  <!-- Quadrant 2: Engineering, Robotics & Aero (Top-Right) -->
  <g transform="translate(415, 50)" filter="url(#commShadow)">
    <rect width="335" height="180" rx="16" fill="#FFFFFF" stroke="#E5E9E8" stroke-width="1.5" />
    <rect x="20" y="20" width="36" height="36" rx="8" fill="#EAF8F5" />
    <!-- Gear Icon -->
    <circle cx="38" cy="38" r="8" stroke="#1F8A70" stroke-width="2" fill="none" />
    <path d="M 38 26 L 38 30 M 38 46 L 38 50 M 26 38 L 30 38 M 46 38 L 50 38" stroke="#1F8A70" stroke-width="2" stroke-linecap="round" />
    <text x="68" y="38" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" fill="#192B42">Robotics &amp; Hardware Chapters</text>
    <text x="68" y="52" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#68788B">IEEE, Formula Student, Hardware Hackers</text>
    
    <!-- Equipment Hold Tracker -->
    <rect x="20" y="74" width="295" height="86" rx="8" fill="#F7F8F4" stroke="#E5E9E8" />
    <text x="32" y="98" font-family="'DM Sans', sans-serif" font-size="11" font-weight="700" fill="#192B42">Robotics Lab Equipment Custody:</text>
    <text x="32" y="118" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#68788B">• 3D Printers: 4 Active · Filament Inventory OK</text>
    <text x="32" y="136" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#68788B">• Soldering Stations: Safety Protocol Signed</text>
  </g>

  <!-- Quadrant 3: E-Cells, Venture & Demo Days (Bottom-Left) -->
  <g transform="translate(50, 250)" filter="url(#commShadow)">
    <rect width="335" height="180" rx="16" fill="#FFFFFF" stroke="#E5E9E8" stroke-width="1.5" />
    <rect x="20" y="20" width="36" height="36" rx="8" fill="#FEF8EB" />
    <!-- Spark Icon -->
    <polygon points="38,26 42,34 50,38 42,42 38,50 34,42 26,38 34,34" fill="#B88D22" />
    <text x="68" y="38" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" fill="#192B42">Entrepreneurship Cells</text>
    <text x="68" y="52" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#68788B">Pitch Decks, Angel Sessions, Demo Days</text>

    <!-- Pitch Deck & Sponsor Network -->
    <rect x="20" y="74" width="295" height="86" rx="8" fill="#F7F8F4" stroke="#E5E9E8" />
    <text x="32" y="98" font-family="'DM Sans', sans-serif" font-size="11" font-weight="700" fill="#192B42">Annual Demo Day Pipeline:</text>
    <text x="32" y="118" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#68788B">• 12 Student Startups Pitching</text>
    <text x="32" y="136" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#B88D22">• $25,000 Seed Grants Distributed</text>
  </g>

  <!-- Quadrant 4: Campus Governance & Councils (Bottom-Right) -->
  <g transform="translate(415, 250)" filter="url(#commShadow)">
    <rect width="335" height="180" rx="16" fill="#FFFFFF" stroke="#E5E9E8" stroke-width="1.5" />
    <rect x="20" y="20" width="36" height="36" rx="8" fill="#FFF3F0" />
    <!-- Shield / Balance Icon -->
    <path d="M 38 28 L 48 32 L 48 42 C 48 48 38 52 38 52 C 38 52 28 48 28 42 L 28 32 Z" fill="#D95E41" />
    <text x="68" y="38" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" fill="#192B42">Student Councils &amp; Societies</text>
    <text x="68" y="52" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#68788B">Cross-Club Policy, Budgets &amp; Faculty Audits</text>

    <!-- Governance Audit Card -->
    <rect x="20" y="74" width="295" height="86" rx="8" fill="#F7F8F4" stroke="#E5E9E8" />
    <text x="32" y="98" font-family="'DM Sans', sans-serif" font-size="11" font-weight="700" fill="#192B42">Campus Operations Health:</text>
    <text x="32" y="118" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#68788B">• 14 Registered Societies Synchronized</text>
    <text x="32" y="136" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#1F8A70">• 100% Budget Approvals Accounted</text>
  </g>
</svg>
"""

# Write all SVGs
visuals = {
    'hero-editorial-visual.svg': HERO_VISUAL_SVG,
    'continuity-relay-visual.svg': CONTINUITY_VISUAL_SVG,
    'tech-communities-visual.svg': COMMUNITIES_VISUAL_SVG,
}

for fname, content in visuals.items():
    path = os.path.join(IMG_DIR, fname)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Wrote Illustration SVG: {path}")

# Render WebP & PNG versions
for name, width, height in [
    ('hero-editorial-visual', 800, 560),
    ('continuity-relay-visual', 800, 480),
    ('tech-communities-visual', 800, 480),
]:
    svg_p = os.path.join(IMG_DIR, f"{name}.svg")
    png_p = os.path.join(IMG_DIR, f"{name}.png")
    webp_p = os.path.join(IMG_DIR, f"{name}.webp")

    # Render PNG
    subprocess.run(['magick', '-density', '200', '-background', 'none', svg_p, '-resize', f'{width}x{height}!', png_p], check=True)
    # Render WebP
    subprocess.run(['magick', png_p, '-quality', '92', webp_p], check=True)
    print(f"Rendered PNG and WebP for: {name}")

print("Custom visual assets generated successfully.")

