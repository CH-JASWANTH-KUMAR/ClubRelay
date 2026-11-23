import subprocess
import os
from PIL import Image

OUT_DIR = os.path.abspath('client/public/brand')
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Full-Color Standalone Symbol SVG
# The Relay Node: Two interlocking dynamic energy tracks (Electric Blue & Fresh Mint)
# forming a forward-momentum relay loop with a Warm Coral baton spark in the nexus.
SYMBOL_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <defs>
    <linearGradient id="crBlueGrad" x1="20" y1="20" x2="108" y2="108" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#315BDB" />
      <stop offset="100%" stop-color="#1F3EA8" />
    </linearGradient>
    <linearGradient id="crMintGrad" x1="108" y1="108" x2="20" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2CBF9B" />
      <stop offset="100%" stop-color="#1F8A70" />
    </linearGradient>
    <linearGradient id="crCoralGrad" x1="60" y1="40" x2="84" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF886B" />
      <stop offset="100%" stop-color="#D95E41" />
    </linearGradient>
    <filter id="crSubtleShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#192B42" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Track 1: Outgoing Momentum (Electric Blue Arc sweeping from top-left over to center) -->
  <path d="M 32 64 C 32 38 48 24 72 24 C 92 24 104 36 104 52 C 104 68 88 80 64 80 L 40 80"
        stroke="url(#crBlueGrad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"
        filter="url(#crSubtleShadow)" />

  <!-- Track 2: Incoming Continuity (Fresh Mint Arc looping from bottom-right up through center) -->
  <path d="M 96 64 C 96 90 80 104 56 104 C 36 104 24 92 24 76 C 24 60 40 48 64 48 L 88 48"
        stroke="url(#crMintGrad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"
        filter="url(#crSubtleShadow)" />

  <!-- Handover Nexus Spark: Passing the baton / institutional memory spark -->
  <circle cx="64" cy="64" r="7.5" fill="url(#crCoralGrad)" />
  <circle cx="64" cy="64" r="3.5" fill="#FFFFFF" />
</svg>
"""

# 2. Dark Variant Symbol (White & Mint for Dark Backgrounds)
SYMBOL_DARK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <defs>
    <linearGradient id="crDarkBlue" x1="20" y1="20" x2="108" y2="108" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#5D8BEE" />
      <stop offset="100%" stop-color="#315BDB" />
    </linearGradient>
    <linearGradient id="crDarkMint" x1="108" y1="108" x2="20" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#52C9B0" />
      <stop offset="100%" stop-color="#2CBF9B" />
    </linearGradient>
  </defs>
  <path d="M 32 64 C 32 38 48 24 72 24 C 92 24 104 36 104 52 C 104 68 88 80 64 80 L 40 80"
        stroke="url(#crDarkBlue)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 96 64 C 96 90 80 104 56 104 C 36 104 24 92 24 76 C 24 60 40 48 64 48 L 88 48"
        stroke="url(#crDarkMint)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="64" cy="64" r="7.5" fill="#FF886B" />
  <circle cx="64" cy="64" r="3.5" fill="#FFFFFF" />
</svg>
"""

# 3. Light / Monochrome White Variant
SYMBOL_LIGHT_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <path d="M 32 64 C 32 38 48 24 72 24 C 92 24 104 36 104 52 C 104 68 88 80 64 80 L 40 80"
        stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 96 64 C 96 90 80 104 56 104 C 36 104 24 92 24 76 C 24 60 40 48 64 48 L 88 48"
        stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="64" cy="64" r="6.5" fill="#FFFFFF" />
</svg>
"""

# 4. Wordmark SVG: "ClubRelay" set in bold geometric Outfit typography with custom kerning
WORDMARK_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" fill="none">
  <text x="0" y="58" font-family="'Outfit', 'DM Sans', -apple-system, sans-serif" font-size="52" font-weight="800" letter-spacing="-1.2">
    <tspan fill="#192B42">Club</tspan><tspan fill="#315BDB">Relay</tspan>
  </text>
  <circle cx="274" cy="22" r="5" fill="#2CBF9B" />
</svg>
"""

# 5. Horizontal Lockup SVG: Symbol + Wordmark
HORIZONTAL_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 110" fill="none">
  <defs>
    <linearGradient id="crHBlue" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#315BDB" />
      <stop offset="100%" stop-color="#1F3EA8" />
    </linearGradient>
    <linearGradient id="crHMint" x1="85" y1="85" x2="15" y2="15" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2CBF9B" />
      <stop offset="100%" stop-color="#1F8A70" />
    </linearGradient>
  </defs>

  <!-- Symbol scaled and positioned left -->
  <g transform="translate(10, 5) scale(0.78)">
    <path d="M 32 64 C 32 38 48 24 72 24 C 92 24 104 36 104 52 C 104 68 88 80 64 80 L 40 80"
          stroke="url(#crHBlue)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 96 64 C 96 90 80 104 56 104 C 36 104 24 92 24 76 C 24 60 40 48 64 48 L 88 48"
          stroke="url(#crHMint)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="64" cy="64" r="7.5" fill="#FF886B" />
    <circle cx="64" cy="64" r="3.5" fill="#FFFFFF" />
  </g>

  <!-- Typography -->
  <text x="124" y="68" font-family="'Outfit', 'DM Sans', -apple-system, sans-serif" font-size="44" font-weight="800" letter-spacing="-1">
    <tspan fill="#192B42">Club</tspan><tspan fill="#315BDB">Relay</tspan>
  </text>
  <circle cx="362" cy="38" r="4.5" fill="#2CBF9B" />
</svg>
"""

# 6. App Icon SVG: Deep Ink Navy rounded squircle with subtle radial glow and centered symbol
APP_ICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#192B42" />
      <stop offset="100%" stop-color="#0F1C2D" />
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="rgba(49, 91, 219, 0.35)" />
      <stop offset="100%" stop-color="rgba(49, 91, 219, 0)" />
    </radialGradient>
    <linearGradient id="iconBlue" x1="120" y1="120" x2="392" y2="392" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#5D8BEE" />
      <stop offset="100%" stop-color="#315BDB" />
    </linearGradient>
    <linearGradient id="iconMint" x1="392" y1="392" x2="120" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#52C9B0" />
      <stop offset="100%" stop-color="#2CBF9B" />
    </linearGradient>
  </defs>

  <!-- Rounded Squircle Base -->
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)" />
  <rect width="512" height="512" rx="115" fill="url(#glowGrad)" />
  <rect x="1" y="1" width="510" height="510" rx="114" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

  <!-- Scaled Centered Symbol -->
  <g transform="translate(256, 256) scale(2.5) translate(-64, -64)">
    <path d="M 32 64 C 32 38 48 24 72 24 C 92 24 104 36 104 52 C 104 68 88 80 64 80 L 40 80"
          stroke="url(#iconBlue)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 96 64 C 96 90 80 104 56 104 C 36 104 24 92 24 76 C 24 60 40 48 64 48 L 88 48"
          stroke="url(#iconMint)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="64" cy="64" r="8" fill="#FF886B" />
    <circle cx="64" cy="64" r="3.5" fill="#FFFFFF" />
  </g>
</svg>
"""

# 7. Open Graph 1200x630 Branded Card SVG
OG_IMAGE_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none">
  <defs>
    <linearGradient id="ogBg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#192B42" />
      <stop offset="50%" stop-color="#132338" />
      <stop offset="100%" stop-color="#0A1422" />
    </linearGradient>
    <radialGradient id="ogGlow" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="rgba(49, 91, 219, 0.4)" />
      <stop offset="100%" stop-color="rgba(49, 91, 219, 0)" />
    </radialGradient>
    <linearGradient id="ogBlue" x1="50" y1="50" x2="250" y2="250" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#5D8BEE" />
      <stop offset="100%" stop-color="#315BDB" />
    </linearGradient>
    <linearGradient id="ogMint" x1="250" y1="250" x2="50" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#52C9B0" />
      <stop offset="100%" stop-color="#2CBF9B" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#ogBg)" />
  <rect width="1200" height="630" fill="url(#ogGlow)" />

  <!-- Subtle Blueprint Tech Grid Lines -->
  <line x1="100" y1="0" x2="100" y2="630" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
  <line x1="300" y1="0" x2="300" y2="630" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
  <line x1="600" y1="0" x2="600" y2="630" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
  <line x1="900" y1="0" x2="900" y2="630" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
  <line x1="0" y1="160" x2="1200" y2="160" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
  <line x1="0" y1="360" x2="1200" y2="360" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
  <line x1="0" y1="520" x2="1200" y2="520" stroke="rgba(255,255,255,0.04)" stroke-width="1" />

  <!-- Logo Mark on Left -->
  <g transform="translate(100, 110)">
    <g transform="scale(1.2)">
      <path d="M 32 64 C 32 38 48 24 72 24 C 92 24 104 36 104 52 C 104 68 88 80 64 80 L 40 80"
            stroke="url(#ogBlue)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 96 64 C 96 90 80 104 56 104 C 36 104 24 92 24 76 C 24 60 40 48 64 48 L 88 48"
            stroke="url(#ogMint)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="64" cy="64" r="7.5" fill="#FF886B" />
      <circle cx="64" cy="64" r="3.5" fill="#FFFFFF" />
    </g>

    <!-- Wordmark -->
    <text x="145" y="85" font-family="'Outfit', 'DM Sans', -apple-system, sans-serif" font-size="64" font-weight="800" letter-spacing="-1.5">
      <tspan fill="#FFFFFF">Club</tspan><tspan fill="#5D8BEE">Relay</tspan>
    </text>
    <circle cx="485" cy="46" r="6" fill="#2CBF9B" />
  </g>

  <!-- Editorial Category Tag -->
  <rect x="100" y="270" width="220" height="36" rx="18" fill="rgba(49, 91, 219, 0.2)" stroke="rgba(93, 139, 238, 0.4)" stroke-width="1" />
  <text x="120" y="293" font-family="'DM Sans', sans-serif" font-size="13" font-weight="700" fill="#BDCFF8">
    CAMPUS OPERATIONS
  </text>

  <!-- Main Headline -->
  <text x="100" y="375" font-family="'Outfit', sans-serif" font-size="62" font-weight="800" fill="#FFFFFF" letter-spacing="-1.5">
    Build the club.
  </text>
  <text x="100" y="445" font-family="'Outfit', sans-serif" font-size="62" font-weight="800" fill="#2CBF9B" letter-spacing="-1.5">
    Keep the momentum.
  </text>

  <!-- Description -->
  <text x="100" y="505" font-family="'DM Sans', sans-serif" font-size="22" font-weight="500" fill="#9FB3C8">
    The operations &amp; continuity platform for collegiate organizations.
  </text>

  <!-- Right Visual Feature Mockup Card -->
  <g transform="translate(730, 140)">
    <rect width="370" height="370" rx="24" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1.5" />
    
    <!-- Mini UI Inside Card -->
    <rect x="24" y="24" width="322" height="60" rx="12" fill="rgba(255,255,255,0.06)" />
    <circle cx="54" cy="54" r="16" fill="#315BDB" />
    <rect x="85" y="42" width="120" height="10" rx="5" fill="#FFFFFF" />
    <rect x="85" y="58" width="80" height="8" rx="4" fill="#9FB3C8" />
    <rect x="250" y="44" width="76" height="20" rx="10" fill="rgba(44, 191, 155, 0.2)" />
    <text x="264" y="58" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" fill="#2CBF9B">ACTIVE</text>

    <!-- Stat Pills -->
    <rect x="24" y="100" width="154" height="100" rx="16" fill="rgba(255,255,255,0.05)" />
    <text x="44" y="132" font-family="'DM Sans', sans-serif" font-size="12" font-weight="600" fill="#9FB3C8">Succession Health</text>
    <text x="44" y="172" font-family="'Outfit', sans-serif" font-size="32" font-weight="800" fill="#2CBF9B">100%</text>

    <rect x="192" y="100" width="154" height="100" rx="16" fill="rgba(255,255,255,0.05)" />
    <text x="212" y="132" font-family="'DM Sans', sans-serif" font-size="12" font-weight="600" fill="#9FB3C8">Playbooks Saved</text>
    <text x="212" y="172" font-family="'Outfit', sans-serif" font-size="32" font-weight="800" fill="#5D8BEE">24</text>

    <!-- Handover Transition Bar -->
    <rect x="24" y="220" width="322" height="110" rx="16" fill="rgba(49, 91, 219, 0.12)" stroke="rgba(93, 139, 238, 0.2)" />
    <text x="44" y="254" font-family="'DM Sans', sans-serif" font-size="13" font-weight="700" fill="#FFFFFF">Leadership Relay Active</text>
    <text x="44" y="278" font-family="'DM Sans', sans-serif" font-size="11" font-weight="500" fill="#BDCFF8">Outgoing President → Incoming President</text>
    <rect x="44" y="296" width="282" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
    <rect x="44" y="296" width="240" height="8" rx="4" fill="#2CBF9B" />
  </g>
</svg>
"""

# Write all SVGs
files = {
    'clubrelay-symbol.svg': SYMBOL_SVG,
    'clubrelay-symbol-dark.svg': SYMBOL_DARK_SVG,
    'clubrelay-symbol-light.svg': SYMBOL_LIGHT_SVG,
    'clubrelay-wordmark.svg': WORDMARK_SVG,
    'clubrelay-horizontal.svg': HORIZONTAL_SVG,
    'clubrelay-app-icon.svg': APP_ICON_SVG,
    'clubrelay-og-image.svg': OG_IMAGE_SVG,
}

for fname, content in files.items():
    path = os.path.join(OUT_DIR, fname)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Wrote SVG: {path}")

# Function to render SVG to PNG with ImageMagick
def render_png(svg_name, png_name, width, height, density=300):
    svg_path = os.path.join(OUT_DIR, svg_name)
    png_path = os.path.join(OUT_DIR, png_name)
    cmd = [
        'magick',
        '-density', str(density),
        '-background', 'none',
        svg_path,
        '-resize', f'{width}x{height}!',
        png_path
    ]
    subprocess.run(cmd, check=True)
    print(f"Rendered PNG: {png_path} ({width}x{height})")

# Render all required PNG formats
render_png('clubrelay-symbol.svg', 'clubrelay-symbol.png', 1024, 1024, density=400)
render_png('clubrelay-symbol-dark.svg', 'clubrelay-symbol-dark.png', 1024, 1024, density=400)
render_png('clubrelay-symbol-light.svg', 'clubrelay-symbol-light.png', 1024, 1024, density=400)
render_png('clubrelay-horizontal.svg', 'clubrelay-horizontal.png', 1600, 382, density=400)
render_png('clubrelay-app-icon.svg', 'clubrelay-app-icon.png', 512, 512, density=300)
render_png('clubrelay-app-icon.svg', 'apple-touch-icon.png', 180, 180, density=300)
render_png('clubrelay-symbol.svg', 'favicon-32.png', 32, 32, density=200)
render_png('clubrelay-symbol.svg', 'favicon-16.png', 16, 16, density=200)
render_png('clubrelay-og-image.svg', 'clubrelay-og-image.png', 1200, 630, density=200)

# Create multi-resolution favicon.ico
fav16 = Image.open(os.path.join(OUT_DIR, 'favicon-16.png')).convert('RGBA')
fav32 = Image.open(os.path.join(OUT_DIR, 'favicon-32.png')).convert('RGBA')
fav48 = fav32.resize((48, 48), Image.Resampling.LANCZOS)
ico_path = os.path.join(OUT_DIR, 'favicon.ico')
fav48.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print(f"Generated favicon.ico with 16, 32, 48px sizes: {ico_path}")

# Also copy favicon.ico and apple-touch-icon.png to client/public root for standard browser fallback
import shutil
shutil.copy(os.path.join(OUT_DIR, 'favicon.ico'), os.path.abspath('client/public/favicon.ico'))
shutil.copy(os.path.join(OUT_DIR, 'apple-touch-icon.png'), os.path.abspath('client/public/apple-touch-icon.png'))
print("Copied root favicons to client/public/")

