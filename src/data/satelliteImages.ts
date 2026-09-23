// High-fidelity SVG satellite imagery data URLs for 100% offline, crystal-clear demo reliability

const svgToDataUrl = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
};

// 1. Port of Rotterdam - High Res Optical Maritime Imagery
export const SATELLITE_PORT_OPTICAL = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <pattern id="portGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1b2a32" stroke-width="0.5"/>
    </pattern>
    <linearGradient id="deepWater" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1926" />
      <stop offset="50%" stop-color="#0f2638" />
      <stop offset="100%" stop-color="#07131d" />
    </linearGradient>
    <linearGradient id="concretePier" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#424c55" />
      <stop offset="100%" stop-color="#2d353c" />
    </linearGradient>
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
      <feComposite in2="SourceGraphic" in="gl" operator="in" />
    </filter>
  </defs>

  <!-- Deep Harbor Water Basin -->
  <rect width="800" height="600" fill="url(#deepWater)"/>
  
  <!-- Water surface ripples & wakes -->
  <path d="M 50 180 Q 200 170 380 185 T 750 190" fill="none" stroke="#1e3d54" stroke-width="1.5" opacity="0.6"/>
  <path d="M 80 280 Q 220 275 420 290 T 780 280" fill="none" stroke="#1e3d54" stroke-width="1" opacity="0.4"/>
  <path d="M 120 420 Q 300 405 500 425 T 760 415" fill="none" stroke="#1e3d54" stroke-width="1.2" opacity="0.5"/>

  <!-- North Industrial Wharf Terminal -->
  <polygon points="0,0 800,0 800,120 480,120 450,150 180,150 150,120 0,120" fill="url(#concretePier)" stroke="#1a2228" stroke-width="2"/>
  
  <!-- South Docking Finger Pier -->
  <polygon points="0,480 220,480 260,510 540,510 580,480 800,480 800,600 0,600" fill="url(#concretePier)" stroke="#1a2228" stroke-width="2"/>

  <!-- Central Pier Jetty -->
  <rect x="0" y="240" width="320" height="90" fill="#363f47" stroke="#1d242a" stroke-width="2"/>
  <polygon points="320,240 360,285 320,330" fill="#2d353c" stroke="#1d242a" stroke-width="2"/>

  <!-- Container Stacks (Multi-colored logistics blocks) -->
  <!-- Yard A -->
  <g opacity="0.9">
    <rect x="30" y="20" width="80" height="35" fill="#c0392b" stroke="#78281f"/>
    <rect x="120" y="20" width="70" height="35" fill="#2980b9" stroke="#1b4f72"/>
    <rect x="200" y="20" width="90" height="35" fill="#27ae60" stroke="#196f3d"/>
    <rect x="300" y="20" width="60" height="35" fill="#f39c12" stroke="#b9770e"/>
    <rect x="30" y="65" width="110" height="35" fill="#e67e22" stroke="#af601a"/>
    <rect x="150" y="65" width="80" height="35" fill="#8e44ad" stroke="#5b2c6f"/>
    <rect x="240" y="65" width="120" height="35" fill="#34495e" stroke="#212f3d"/>
  </g>

  <!-- Central Pier Container Yard -->
  <g opacity="0.85">
    <rect x="20" y="255" width="90" height="25" fill="#2980b9"/>
    <rect x="120" y="255" width="75" height="25" fill="#c0392b"/>
    <rect x="205" y="255" width="80" height="25" fill="#27ae60"/>
    <rect x="20" y="290" width="110" height="25" fill="#f39c12"/>
    <rect x="140" y="290" width="95" height="25" fill="#34495e"/>
  </g>

  <!-- Gantry Cranes (Yellow rails & booms) -->
  <line x1="160" y1="145" x2="440" y2="145" stroke="#f1c40f" stroke-width="3" stroke-dasharray="8,6"/>
  <rect x="210" y="130" width="25" height="25" fill="#f1c40f" stroke="#7d6608"/>
  <line x1="222" y1="130" x2="222" y2="175" stroke="#d4ac0d" stroke-width="4"/>
  <rect x="330" y="130" width="25" height="25" fill="#f1c40f" stroke="#7d6608"/>
  <line x1="342" y1="130" x2="342" y2="175" stroke="#d4ac0d" stroke-width="4"/>

  <!-- Cargo Vessel 1 (Ultra Large Container Ship berthed north) -->
  <!-- Hull -->
  <polygon points="190,175 420,175 450,195 420,215 190,215 175,195" fill="#1c2833" stroke="#e74c3c" stroke-width="2"/>
  <!-- Container bays on ship -->
  <rect x="210" y="180" width="30" height="30" fill="#e74c3c"/>
  <rect x="245" y="180" width="30" height="30" fill="#3498db"/>
  <rect x="280" y="180" width="30" height="30" fill="#2ecc71"/>
  <rect x="315" y="180" width="30" height="30" fill="#f1c40f"/>
  <rect x="350" y="180" width="30" height="30" fill="#9b59b6"/>
  <rect x="385" y="180" width="25" height="30" fill="#e67e22"/>
  <!-- Bridge superstructure -->
  <rect x="195" y="185" width="12" height="20" fill="#ecf0f1" stroke="#7f8c8d"/>

  <!-- Cargo Vessel 2 (Oil Tanker berthed at South Pier) -->
  <polygon points="320,445 560,445 590,465 560,485 320,485 305,465" fill="#2c3e50" stroke="#34495e" stroke-width="2"/>
  <!-- Tanker manifold & deck piping -->
  <circle cx="360" cy="465" r="12" fill="#7f8c8d" stroke="#1a252f"/>
  <circle cx="410" cy="465" r="12" fill="#7f8c8d" stroke="#1a252f"/>
  <circle cx="460" cy="465" r="12" fill="#7f8c8d" stroke="#1a252f"/>
  <circle cx="510" cy="465" r="12" fill="#7f8c8d" stroke="#1a252f"/>
  <line x1="340" y1="465" x2="530" y2="465" stroke="#bdc3c7" stroke-width="2"/>

  <!-- Cargo Vessel 3 (Bulk Carrier in navigation channel) -->
  <polygon points="460,310 650,310 675,325 650,340 460,340 450,325" fill="#34495e" stroke="#2c3e50" stroke-width="1.5"/>
  <rect x="480" y="315" width="28" height="20" fill="#2c3e50" stroke="#1a252f"/>
  <rect x="520" y="315" width="28" height="20" fill="#2c3e50" stroke="#1a252f"/>
  <rect x="560" y="315" width="28" height="20" fill="#2c3e50" stroke="#1a252f"/>
  <rect x="600" y="315" width="28" height="20" fill="#2c3e50" stroke="#1a252f"/>

  <!-- Tugboats (Smaller vessels) -->
  <ellipse cx="685" cy="305" rx="14" ry="7" fill="#e74c3c" stroke="#c0392b"/>
  <ellipse cx="690" cy="345" rx="14" ry="7" fill="#e74c3c" stroke="#c0392b"/>

  <!-- Oil Storage Tanks on South Wharf -->
  <circle cx="660" cy="540" r="32" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="3"/>
  <circle cx="740" cy="540" r="32" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="3"/>
  <circle cx="660" cy="540" r="4" fill="#34495e"/>
  <circle cx="740" cy="540" r="4" fill="#34495e"/>

  <!-- Telemetry Overlay Grid & HUD marks -->
  <rect width="800" height="600" fill="url(#portGrid)" opacity="0.3"/>
  <text x="20" y="585" fill="#06B6D4" font-family="monospace" font-size="12" opacity="0.8">OPTICAL WV-3 / 0.31m GSD / 51.9542°N, 4.1287°E / ROTTERDAM MAASVLAKTE</text>
</svg>
`);

// 2. Solar Farm & Energy Infrastructure - High-Res Aerial Grounding
export const SATELLITE_SOLAR_GROUNDING = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <pattern id="solarCells" width="16" height="24" patternUnits="userSpaceOnUse">
      <rect width="14" height="22" fill="#0d233a" stroke="#1d4e78" stroke-width="0.8"/>
      <line x1="0" y1="11" x2="14" y2="11" stroke="#25649a" stroke-width="0.5"/>
    </pattern>
    <linearGradient id="desertBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3d352a" />
      <stop offset="50%" stop-color="#4a3f31" />
      <stop offset="100%" stop-color="#382e22" />
    </linearGradient>
  </defs>

  <!-- Arid Soil Ground Background -->
  <rect width="800" height="600" fill="url(#desertBg)"/>
  
  <!-- Soil texture & tracks -->
  <path d="M 0 150 Q 300 160 800 140" fill="none" stroke="#2a2219" stroke-width="12" opacity="0.6"/>
  <path d="M 0 450 Q 400 460 800 440" fill="none" stroke="#2a2219" stroke-width="12" opacity="0.6"/>
  <path d="M 400 0 L 400 600" fill="none" stroke="#2a2219" stroke-width="16" opacity="0.6"/>

  <!-- Array Block 1 (North-West Photovoltaic Field) -->
  <g transform="translate(60, 40)">
    <rect width="280" height="90" fill="url(#solarCells)"/>
    <rect x="-4" y="-4" width="288" height="98" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
  </g>

  <!-- Array Block 2 (North-East Photovoltaic Field) -->
  <g transform="translate(460, 40)">
    <rect width="280" height="90" fill="url(#solarCells)"/>
    <rect x="-4" y="-4" width="288" height="98" fill="none" stroke="#38bdf8" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
  </g>

  <!-- Array Block 3 (Mid-West Photovoltaic Field) -->
  <g transform="translate(60, 190)">
    <rect width="280" height="90" fill="url(#solarCells)"/>
  </g>

  <!-- Array Block 4 (Mid-East Photovoltaic Field) -->
  <g transform="translate(460, 190)">
    <rect width="280" height="90" fill="url(#solarCells)"/>
  </g>

  <!-- Array Block 5 (South-West Photovoltaic Field) -->
  <g transform="translate(60, 340)">
    <rect width="280" height="90" fill="url(#solarCells)"/>
  </g>

  <!-- Array Block 6 (South-East Photovoltaic Field) -->
  <g transform="translate(460, 340)">
    <rect width="280" height="90" fill="url(#solarCells)"/>
  </g>

  <!-- Central Substation & Step-up Transformer Area -->
  <rect x="340" y="240" width="120" height="120" fill="#2d3748" stroke="#cbd5e1" stroke-width="2"/>
  <!-- Security fence perimeter -->
  <rect x="330" y="230" width="140" height="140" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="6,3"/>
  <!-- High Voltage Transformers (3 Units) -->
  <rect x="350" y="250" width="25" height="40" fill="#475569" stroke="#94a3b8"/>
  <circle cx="362" cy="270" r="5" fill="#e2e8f0"/>
  <rect x="385" y="250" width="25" height="40" fill="#475569" stroke="#94a3b8"/>
  <circle cx="397" cy="270" r="5" fill="#e2e8f0"/>
  <rect x="420" y="250" width="25" height="40" fill="#475569" stroke="#94a3b8"/>
  <circle cx="432" cy="270" r="5" fill="#e2e8f0"/>
  <!-- Control Room Building -->
  <rect x="355" y="310" width="80" height="35" fill="#64748b" stroke="#cbd5e1"/>
  <text x="365" y="332" fill="#f8fafc" font-family="monospace" font-size="9" font-weight="bold">SCADA CTR</text>

  <!-- Inverter Sheds across Array alleys -->
  <rect x="180" y="140" width="20" height="15" fill="#94a3b8" stroke="#334155"/>
  <rect x="180" y="290" width="20" height="15" fill="#94a3b8" stroke="#334155"/>
  <rect x="580" y="140" width="20" height="15" fill="#94a3b8" stroke="#334155"/>
  <rect x="580" y="290" width="20" height="15" fill="#94a3b8" stroke="#334155"/>

  <!-- Battery Energy Storage System (BESS) Containers (South) -->
  <rect x="340" y="480" width="40" height="85" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
  <text x="348" y="525" fill="#0284c7" font-family="monospace" font-size="8" font-weight="bold" transform="rotate(-90 348,525)">BESS-01</text>
  <rect x="400" y="480" width="40" height="85" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
  <text x="408" y="525" fill="#0284c7" font-family="monospace" font-size="8" font-weight="bold" transform="rotate(-90 408,525)">BESS-02</text>

  <text x="20" y="585" fill="#38BDF8" font-family="monospace" font-size="12" opacity="0.8">AERIAL SURVEY / 0.15m GSD / 35.2144°N, 115.8921°W / MOJAVE SOLAR PARK</text>
</svg>
`);

// 3. Valencia Flood Pre-Event (T1: Oct 24, Normal State)
export const SATELLITE_VALENCIA_PRE = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="dryLand" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#47553c" />
      <stop offset="50%" stop-color="#3b4832" />
      <stop offset="100%" stop-color="#4f5f43" />
    </linearGradient>
  </defs>

  <!-- Agrarian & Rural Valley Basin -->
  <rect width="800" height="600" fill="url(#dryLand)"/>

  <!-- Agricultural parcels (normal green/tan crops) -->
  <rect x="40" y="40" width="180" height="120" fill="#586e45" stroke="#2d3a22" stroke-width="2"/>
  <rect x="230" y="40" width="220" height="120" fill="#6a7d52" stroke="#2d3a22" stroke-width="2"/>
  <rect x="40" y="170" width="140" height="180" fill="#4d5f39" stroke="#2d3a22" stroke-width="2"/>
  <rect x="190" y="170" width="180" height="110" fill="#75865a" stroke="#2d3a22" stroke-width="2"/>
  <rect x="50" y="420" width="240" height="140" fill="#5c7148" stroke="#2d3a22" stroke-width="2"/>
  <rect x="300" y="450" width="210" height="110" fill="#697f53" stroke="#2d3a22" stroke-width="2"/>

  <!-- Normal Dry / Shallow Ravine / Riverbed (Turia basin) -->
  <path d="M 400 0 C 430 150 490 280 520 400 S 650 550 720 600" fill="none" stroke="#2c3a2a" stroke-width="32"/>
  <path d="M 400 0 C 430 150 490 280 520 400 S 650 550 720 600" fill="none" stroke="#1c475e" stroke-width="12"/>

  <!-- Urban Settlement (Paiporta / Sedaví residential grid) -->
  <g transform="translate(520, 80)">
    <rect width="240" height="240" fill="#6b7280" opacity="0.6"/>
    <!-- Street network -->
    <path d="M 0 60 L 240 60 M 0 120 L 240 120 M 0 180 L 240 180" stroke="#1f2937" stroke-width="4"/>
    <path d="M 60 0 L 60 240 M 120 0 L 120 240 M 180 0 L 180 240" stroke="#1f2937" stroke-width="4"/>
    <!-- Residential building roofs -->
    <rect x="10" y="10" width="40" height="40" fill="#b45309"/>
    <rect x="70" y="10" width="40" height="40" fill="#d97706"/>
    <rect x="130" y="10" width="40" height="40" fill="#b45309"/>
    <rect x="10" y="70" width="40" height="40" fill="#d97706"/>
    <rect x="70" y="70" width="40" height="40" fill="#b45309"/>
    <rect x="130" y="70" width="40" height="40" fill="#d97706"/>
  </g>

  <!-- Highway & Bridge Over River -->
  <line x1="0" y1="360" x2="800" y2="360" stroke="#374151" stroke-width="14"/>
  <line x1="0" y1="360" x2="800" y2="360" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="10,10"/>
  <!-- Bridge pillars -->
  <rect x="470" y="350" width="20" height="20" fill="#9ca3af"/>
  <rect x="520" y="350" width="20" height="20" fill="#9ca3af"/>

  <text x="20" y="585" fill="#10B981" font-family="monospace" font-size="12" font-weight="bold">SENTINEL-2 MSI / T1 (OCT 24, PRE-FLOOD) / VALENCIA, SPAIN (39.421°N, 0.418°W)</text>
</svg>
`);

// 3b. Valencia Flood Post-Event (T2: Oct 30, Catastrophic Inundation)
export const SATELLITE_VALENCIA_POST = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="muddyFlood" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#45311e" />
      <stop offset="50%" stop-color="#3b2b1a" />
      <stop offset="100%" stop-color="#2c1e10" />
    </linearGradient>
  </defs>

  <!-- Inundated Background with severe silt/mud deposits -->
  <rect width="800" height="600" fill="#383025"/>

  <!-- Submerged agricultural parcels -->
  <rect x="40" y="40" width="180" height="120" fill="#3f3224" stroke="#2c1e10" stroke-width="2"/>
  <rect x="230" y="40" width="220" height="120" fill="#4d3b2a" stroke="#2c1e10" stroke-width="2"/>
  <rect x="40" y="170" width="140" height="180" fill="#35281a" stroke="#2c1e10" stroke-width="2"/>
  
  <!-- Massive Overflowed Ravine & Inundation Surge -->
  <!-- Floodwater envelope spreading 4x wider -->
  <path d="M 330 0 C 370 120 420 250 440 380 S 550 540 620 600 L 800 600 L 800 350 L 680 0 Z" fill="url(#muddyFlood)" opacity="0.95"/>
  <path d="M 380 0 C 420 140 470 270 490 390 S 610 540 680 600" fill="none" stroke="#1a1208" stroke-width="85" opacity="0.9"/>
  <!-- Torrential water current lines -->
  <path d="M 400 20 C 450 160 520 280 540 410 S 670 560 740 600" fill="none" stroke="#5a422d" stroke-width="8" opacity="0.7"/>

  <!-- Urban Settlement Submerged by flash flood -->
  <g transform="translate(520, 80)">
    <rect width="240" height="240" fill="#2b1f14" opacity="0.85"/>
    <!-- Street network submerged under 1.5m water -->
    <path d="M 0 60 L 240 60 M 0 120 L 240 120 M 0 180 L 240 180" stroke="#1d150e" stroke-width="8"/>
    <path d="M 60 0 L 60 240 M 120 0 L 120 240 M 180 0 L 180 240" stroke="#1d150e" stroke-width="8"/>
    <!-- Roofs protruding with silt accumulation -->
    <rect x="10" y="10" width="40" height="40" fill="#8c5835"/>
    <rect x="70" y="10" width="40" height="40" fill="#9e6741"/>
    <rect x="130" y="10" width="40" height="40" fill="#8c5835"/>
    <rect x="10" y="70" width="40" height="40" fill="#9e6741"/>
    <rect x="70" y="70" width="40" height="40" fill="#8c5835"/>
    <rect x="130" y="70" width="40" height="40" fill="#9e6741"/>
  </g>

  <!-- Highway Cut-Off / Bridge Washout Section -->
  <line x1="0" y1="360" x2="430" y2="360" stroke="#374151" stroke-width="14"/>
  <!-- Broken submerged section -->
  <line x1="430" y1="360" x2="620" y2="360" stroke="#1f1811" stroke-width="18" stroke-dasharray="6,8"/>
  <line x1="620" y1="360" x2="800" y2="360" stroke="#374151" stroke-width="14"/>

  <!-- Red Alert Warning Overlay Indicators -->
  <circle cx="480" cy="360" r="16" fill="#ef4444" opacity="0.4"/>
  <circle cx="480" cy="360" r="8" fill="#ef4444"/>
  <circle cx="620" cy="220" r="22" fill="#ef4444" opacity="0.3"/>
  <circle cx="620" cy="220" r="10" fill="#ef4444"/>

  <text x="20" y="585" fill="#EF4444" font-family="monospace" font-size="12" font-weight="bold">SENTINEL-2 MSI / T2 (OCT 30, POST-FLOOD DANA) / CRITICAL INUNDATION DETECTED</text>
</svg>
`);

// 4a. Amazon Basin Optical (Heavily Cloud Obscured)
export const SATELLITE_AMAZON_OPTICAL = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="rainforest" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#143b18" />
      <stop offset="50%" stop-color="#0f2e13" />
      <stop offset="100%" stop-color="#19451e" />
    </linearGradient>
    <filter id="cloudBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
  </defs>

  <!-- Dense Amazonian Rainforest Canopy -->
  <rect width="800" height="600" fill="url(#rainforest)"/>

  <!-- Amazon Meandering River (Visible sections) -->
  <path d="M 0 320 C 180 340 260 210 440 230 S 660 380 800 340" fill="none" stroke="#254a4f" stroke-width="52"/>
  <path d="M 0 320 C 180 340 260 210 440 230 S 660 380 800 340" fill="none" stroke="#193337" stroke-width="26"/>

  <!-- Partially visible clearings (deforestation "fishbone" roads) -->
  <line x1="80" y1="80" x2="80" y2="240" stroke="#785d3f" stroke-width="8"/>
  <line x1="40" y1="120" x2="140" y2="120" stroke="#785d3f" stroke-width="4"/>
  <line x1="40" y1="160" x2="140" y2="160" stroke="#785d3f" stroke-width="4"/>

  <!-- Dense Monsoon Cumulus & Cirrus Clouds (58% Occlusion over South & East) -->
  <g filter="url(#cloudBlur)">
    <!-- Cloud Cluster 1 -->
    <ellipse cx="580" cy="380" rx="220" ry="140" fill="#ffffff" opacity="0.92"/>
    <ellipse cx="680" cy="450" rx="190" ry="120" fill="#f1f5f9" opacity="0.95"/>
    <ellipse cx="460" cy="420" rx="160" ry="110" fill="#ffffff" opacity="0.88"/>
    <!-- Cloud Cluster 2 -->
    <ellipse cx="280" cy="480" rx="180" ry="100" fill="#ffffff" opacity="0.82"/>
    <!-- Cloud Shadows on ground -->
    <ellipse cx="610" cy="410" rx="190" ry="90" fill="#051008" opacity="0.55"/>
  </g>

  <!-- Crisp Cloud Edges -->
  <circle cx="560" cy="360" r="90" fill="#ffffff" opacity="0.4"/>
  <circle cx="640" cy="400" r="110" fill="#f8fafc" opacity="0.5"/>

  <text x="20" y="585" fill="#CBD5E1" font-family="monospace" font-size="12" font-weight="bold">OPTICAL RGB / SENTINEL-2 (B4-B3-B2) / 58% CLOUD OCCLUSION / RONDÔNIA, BRAZIL</text>
</svg>
`);

// 4b. Amazon Basin Synthetic Aperture Radar (SAR C-Band VV/VH Backscatter)
export const SATELLITE_AMAZON_SAR = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <pattern id="sarSpeckle" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="2" height="2" fill="#38bdf8" opacity="0.15"/>
      <rect x="2" y="2" width="2" height="2" fill="#0284c7" opacity="0.1"/>
    </pattern>
    <linearGradient id="sarBackscatter" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1720" />
      <stop offset="50%" stop-color="#142634" />
      <stop offset="100%" stop-color="#0e1d28" />
    </linearGradient>
  </defs>

  <!-- SAR Radar Reflectance Ground -->
  <rect width="800" height="600" fill="url(#sarBackscatter)"/>

  <!-- High-Backscatter Canopy Texture (Volume Scattering - Bright Cyan/Teal) -->
  <rect width="800" height="600" fill="#0f3443" opacity="0.6"/>
  <rect width="800" height="600" fill="url(#sarSpeckle)"/>

  <!-- River Surface (Specular Reflection = No signal bounced back = Pure Black in SAR) -->
  <!-- Note: Penetrates 100% through the cloud layer! -->
  <path d="M 0 320 C 180 340 260 210 440 230 S 660 380 800 340" fill="none" stroke="#020609" stroke-width="56"/>
  <path d="M 0 320 C 180 340 260 210 440 230 S 660 380 800 340" fill="none" stroke="#000000" stroke-width="32"/>

  <!-- Hidden Inundation & Logging Detected Under Optical Clouds -->
  <!-- Corner reflector clear-cuts (High radar dielectric backscatter) -->
  <g stroke="#38bdf8" stroke-width="3" opacity="0.95">
    <line x1="80" y1="80" x2="80" y2="240"/>
    <line x1="40" y1="120" x2="140" y2="120"/>
    <line x1="40" y1="160" x2="140" y2="160"/>
    
    <!-- Secret deforestation corridors hidden under clouds on South Bank -->
    <line x1="560" y1="360" x2="560" y2="540" stroke="#f43f5e" stroke-width="4"/>
    <line x1="510" y1="400" x2="630" y2="400" stroke="#f43f5e" stroke-width="3"/>
    <line x1="490" y1="450" x2="640" y2="450" stroke="#f43f5e" stroke-width="3"/>
    <line x1="520" y1="500" x2="610" y2="500" stroke="#f43f5e" stroke-width="3"/>
    <rect x="520" y="410" width="70" height="35" fill="#f43f5e" opacity="0.35"/>
  </g>

  <!-- Wet Soil / Inundated Forest Perimeter (Double bounce scattering) -->
  <path d="M 460 260 C 520 280 580 300 620 290" fill="none" stroke="#eab308" stroke-width="6" opacity="0.8"/>
  <path d="M 160 370 C 220 390 280 380 340 370" fill="none" stroke="#eab308" stroke-width="6" opacity="0.8"/>

  <text x="20" y="585" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="bold">SAR C-BAND (SENTINEL-1 GRD) / VV+VH DUAL-POL / CLOUD PENETRATION: 100%</text>
</svg>
`);
