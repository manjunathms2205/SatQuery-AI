import React, { useState } from 'react';
import { Sliders, Split, Crosshair, Layers, Eye, Download } from 'lucide-react';
import { AnalysisResult } from '../../types';

interface VisualEvidenceProps {
  result: AnalysisResult;
}

export const VisualEvidence: React.FC<VisualEvidenceProps> = ({ result }) => {
  const { selectedTool, groundingBoxes, changeMetrics, optiSarMetrics, inputImages, rasterEvidence, isRealRaster } = result;

  // Layer selection
  const [activeLayer, setActiveLayer] = useState<string>('default');

  // Change overlay opacity (0 - 100%)
  const [overlayOpacity, setOverlayOpacity] = useState<number>(75);

  // Grounding states
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);

  // Bi-temporal comparison slider state (0 - 100%)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [bitemporalView, setBitemporalView] = useState<'slider' | 'side-by-side' | 'changemap' | 'overlay'>('slider');

  // Filter toggles for bi-temporal change
  const [filterChanged, setFilterChanged] = useState(true);
  const [filterVegIncrease, setFilterVegIncrease] = useState(true);
  const [filterVegDecrease, setFilterVegDecrease] = useState(true);
  const [filterWater, setFilterWater] = useState(true);
  const [filterBuiltup, setFilterBuiltup] = useState(true);

  // OptiSAR blend state (0 = 100% optical, 100 = 100% SAR)
  const [sarBlend, setSarBlend] = useState<number>(50);
  const [optiSarMode, setOptiSarMode] = useState<'blend' | 'optical' | 'sar'>('blend');

  // Download GeoJSON helper
  const handleDownloadGeoJson = () => {
    if (!rasterEvidence?.geojson) return;
    const blob = new Blob([JSON.stringify(rasterEvidence.geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satquery_change_polygons_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Extract real visual layers if available from backend
  const layers = rasterEvidence?.visualLayers;

  return (
    <div className="rounded-xl border border-[#DDD9CE] bg-white overflow-hidden shadow-subtle flex flex-col">
      {/* Evidence Header Bar */}
      <div className="px-5 py-3 border-b border-[#DDD9CE] bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-forest-600"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">
            Visual Evidence
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ivory-200 text-charcoal-secondary border border-[#DDD9CE]">
            {selectedTool}
          </span>
          {isRealRaster && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest-50 text-forest-700 border border-forest-100 font-semibold">
              Raster-derived Evidence
            </span>
          )}
        </div>

        {/* Dynamic Layer Switchers */}
        {selectedTool === 'RS-VQA' && layers && (
          <div className="flex items-center gap-1 text-xs font-sans">
            <button
              onClick={() => setActiveLayer('rgb')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeLayer === 'rgb' || activeLayer === 'default'
                  ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                  : 'text-charcoal-secondary hover:text-charcoal'
              }`}
            >
              RGB
            </button>
            {layers.falseColor && (
              <button
                onClick={() => setActiveLayer('falseColor')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeLayer === 'falseColor'
                    ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                    : 'text-charcoal-secondary hover:text-charcoal'
                }`}
              >
                False Colour (NIR)
              </button>
            )}
            {layers.ndvi && (
              <button
                onClick={() => setActiveLayer('ndvi')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeLayer === 'ndvi'
                    ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                    : 'text-charcoal-secondary hover:text-charcoal'
                }`}
              >
                NDVI
              </button>
            )}
            {layers.ndwi && (
              <button
                onClick={() => setActiveLayer('ndwi')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeLayer === 'ndwi'
                    ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                    : 'text-charcoal-secondary hover:text-charcoal'
                }`}
              >
                NDWI
              </button>
            )}
          </div>
        )}

        {/* ChangeSense View Controls */}
        {selectedTool === 'ChangeSense' && (
          <div className="flex items-center gap-1 text-xs font-sans">
            <button
              onClick={() => setBitemporalView('slider')}
              className={`px-2.5 py-1 rounded transition-colors ${
                bitemporalView === 'slider'
                  ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                  : 'text-charcoal-secondary hover:text-charcoal'
              }`}
            >
              Split Slider
            </button>
            <button
              onClick={() => setBitemporalView('side-by-side')}
              className={`px-2.5 py-1 rounded transition-colors ${
                bitemporalView === 'side-by-side'
                  ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                  : 'text-charcoal-secondary hover:text-charcoal'
              }`}
            >
              Side-by-Side
            </button>
            {layers?.overlay && (
              <button
                onClick={() => setBitemporalView('overlay')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  bitemporalView === 'overlay'
                    ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                    : 'text-charcoal-secondary hover:text-charcoal'
                }`}
              >
                Change Overlay
              </button>
            )}
            {layers?.changeMap && (
              <button
                onClick={() => setBitemporalView('changemap')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  bitemporalView === 'changemap'
                    ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                    : 'text-charcoal-secondary hover:text-charcoal'
                }`}
              >
                Change Map
              </button>
            )}
          </div>
        )}

        {/* OptiSAR-Fuse View Controls */}
        {selectedTool === 'OptiSAR-Fuse' && (
          <div className="flex items-center gap-1 text-xs font-sans">
            <button
              onClick={() => setOptiSarMode('optical')}
              className={`px-2 py-0.5 rounded transition-colors ${
                optiSarMode === 'optical'
                  ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                  : 'text-charcoal-secondary hover:text-charcoal'
              }`}
            >
              Optical
            </button>
            <button
              onClick={() => setOptiSarMode('blend')}
              className={`px-2 py-0.5 rounded transition-colors ${
                optiSarMode === 'blend'
                  ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                  : 'text-charcoal-secondary hover:text-charcoal'
              }`}
            >
              Cross-Modal Blend
            </button>
            <button
              onClick={() => setOptiSarMode('sar')}
              className={`px-2 py-0.5 rounded transition-colors ${
                optiSarMode === 'sar'
                  ? 'bg-forest-50 text-forest-700 font-semibold border border-forest-100'
                  : 'text-charcoal-secondary hover:text-charcoal'
              }`}
            >
              SAR Radar
            </button>
          </div>
        )}

        {/* SceneGrounder Controls */}
        {selectedTool === 'SceneGrounder' && groundingBoxes && groundingBoxes.length > 0 && (
          <div className="flex items-center gap-3 text-xs font-sans text-charcoal-secondary">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-charcoal">
              <input
                type="checkbox"
                checked={showBoxes}
                onChange={e => setShowBoxes(e.target.checked)}
                className="rounded border-[#DDD9CE] text-forest-700 focus:ring-0"
              />
              <span>Boxes ({groundingBoxes.length})</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-charcoal">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={e => setShowLabels(e.target.checked)}
                className="rounded border-[#DDD9CE] text-forest-700 focus:ring-0"
              />
              <span>Labels</span>
            </label>
          </div>
        )}
      </div>

      {/* Main Evidence Viewer Display */}
      <div className="p-4 bg-[#FAF9F6] flex flex-col items-center justify-center">
        {/* 1. SCENE GROUNDER VIEW: Grounded Target Scene */}
        {selectedTool === 'SceneGrounder' && (
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white select-none">
            <img
              src={layers?.rgb || inputImages.primary}
              alt="Grounded scene"
              className="w-full h-full object-contain"
            />

            {/* Transparent grounding overlay if available */}
            {layers?.overlay && (
              <img
                src={layers.overlay}
                alt="Grounding overlay"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ opacity: overlayOpacity / 100 }}
              />
            )}

            {/* SVG Bounding Boxes Overlay */}
            {showBoxes && groundingBoxes && (
              <svg className="absolute inset-0 w-full h-full pointer-events-auto">
                {groundingBoxes.map(box => {
                  const [ymin, xmin, ymax, xmax] = box.box2d;
                  const isHovered = activeBoxId === box.id;
                  const boxColor = box.color || '#173F35';

                  return (
                    <g
                      key={box.id}
                      onMouseEnter={() => setActiveBoxId(box.id)}
                      onMouseLeave={() => setActiveBoxId(null)}
                      className="cursor-pointer transition-all"
                    >
                      <rect
                        x={`${xmin}%`}
                        y={`${ymin}%`}
                        width={`${xmax - xmin}%`}
                        height={`${ymax - ymin}%`}
                        fill={isHovered ? `${boxColor}25` : `${boxColor}10`}
                        stroke={boxColor}
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        strokeDasharray={isHovered ? 'none' : '3,2'}
                      />

                      <circle cx={`${xmin}%`} cy={`${ymin}%`} r="2.5" fill={boxColor} />
                      <circle cx={`${xmax}%`} cy={`${ymin}%`} r="2.5" fill={boxColor} />
                      <circle cx={`${xmin}%`} cy={`${ymax}%`} r="2.5" fill={boxColor} />
                      <circle cx={`${xmax}%`} cy={`${ymax}%`} r="2.5" fill={boxColor} />

                      {showLabels && (
                        <foreignObject
                          x={`${xmin}%`}
                          y={`${Math.max(0, ymin - 6)}%`}
                          width="240"
                          height="24"
                          className="overflow-visible pointer-events-none"
                        >
                          <div
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold shadow-sm whitespace-nowrap"
                            style={{
                              backgroundColor: boxColor,
                              color: '#FFFFFF'
                            }}
                          >
                            <span>{box.label}</span>
                            <span className="opacity-80 font-mono">
                              ({(box.confidence * (box.confidence > 1 ? 1 : 100)).toFixed(0)}%)
                            </span>
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        )}

        {/* 2. CHANGE SENSE VIEW */}
        {selectedTool === 'ChangeSense' && (
          <div className="w-full space-y-3">
            {bitemporalView === 'slider' ? (
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white select-none">
                {/* Secondary Image (T2) Background */}
                <img
                  src={layers?.rgb || inputImages.secondary || inputImages.primary}
                  alt="Post-event satellite"
                  className="absolute inset-0 w-full h-full object-contain"
                />

                {/* Primary Image (T1) Clipped by Slider */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={inputImages.primary}
                    alt="Pre-event satellite"
                    className="absolute top-0 left-0 w-full h-full object-contain max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>

                {/* Minimal Vertical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-forest-700 flex items-center justify-center pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-forest-700 text-white flex items-center justify-center shadow-subtle border-2 border-white pointer-events-auto">
                    <Split className="w-3 h-3" />
                  </div>
                </div>

                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm border border-[#DDD9CE] text-[10px] font-mono font-semibold text-forest-700">
                  T1: BASELINE (PRE-EVENT)
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm border border-[#DDD9CE] text-[10px] font-mono font-semibold text-terracotta-600">
                  T2: OBSERVATION (POST-EVENT)
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={e => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                />
              </div>
            ) : bitemporalView === 'overlay' ? (
              /* TRANSPARENT CHANGE OVERLAY VIEW WITH OPACITY SLIDER */
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white select-none">
                {/* Base Original Image */}
                <img
                  src={inputImages.primary}
                  alt="Original base"
                  className="absolute inset-0 w-full h-full object-contain"
                />

                {/* Transparent Change Overlay */}
                {layers?.overlay && (
                  <img
                    src={layers.overlay}
                    alt="Change Overlay"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{ opacity: overlayOpacity / 100 }}
                  />
                )}

                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-white/90 border border-[#DDD9CE] text-[10px] font-mono font-semibold text-charcoal">
                  Original Raster + Change Mask Overlay
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-terracotta-50 text-terracotta-700 border border-terracotta-100 text-[10px] font-mono font-semibold">
                  Opacity: {overlayOpacity}%
                </div>
              </div>
            ) : bitemporalView === 'changemap' && layers?.changeMap ? (
              /* SPECTRAL MAGNITUDE CHANGE MAP */
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white">
                <img
                  src={layers.changeMap}
                  alt="Change Magnitude Map"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-white/90 border border-[#DDD9CE] text-[10px] font-mono font-semibold text-charcoal">
                  Spectral Distance Magnitude (Magma Map)
                </div>
              </div>
            ) : (
              /* SIDE BY SIDE */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white">
                  <img
                    src={inputImages.primary}
                    alt="T1 Baseline"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 text-[10px] font-mono font-semibold text-forest-700 border border-[#DDD9CE]">
                    T1: PRE-EVENT
                  </div>
                </div>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white">
                  <img
                    src={inputImages.secondary || inputImages.primary}
                    alt="T2 Post-event"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 text-[10px] font-mono font-semibold text-terracotta-600 border border-[#DDD9CE]">
                    T2: POST-EVENT
                  </div>
                </div>
              </div>
            )}

            {/* Slider or Opacity Controls */}
            {bitemporalView === 'slider' && (
              <div className="flex items-center justify-between text-xs text-charcoal-secondary font-sans px-1">
                <span>Drag split slider to compare temporal extent</span>
                <span className="font-mono text-charcoal font-semibold">{sliderPos}% Split</span>
              </div>
            )}

            {bitemporalView === 'overlay' && (
              <div className="p-3 rounded-lg bg-white border border-[#DDD9CE] space-y-2">
                <div className="flex items-center justify-between text-xs text-charcoal font-sans">
                  <span className="font-semibold">Change Mask Opacity</span>
                  <span className="font-mono text-charcoal-secondary">{overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={overlayOpacity}
                  onChange={e => setOverlayOpacity(Number(e.target.value))}
                  className="w-full accent-terracotta-600 h-1.5 bg-ivory-200 rounded-lg cursor-pointer"
                />

                {/* Filter Toggles */}
                <div className="pt-2 border-t border-[#DDD9CE]/60 flex flex-wrap items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-secondary hover:text-charcoal">
                    <input
                      type="checkbox"
                      checked={filterChanged}
                      onChange={e => setFilterChanged(e.target.checked)}
                      className="rounded border-[#DDD9CE] text-forest-700 focus:ring-0"
                    />
                    <span>Show changed areas</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-secondary hover:text-charcoal">
                    <input
                      type="checkbox"
                      checked={filterVegIncrease}
                      onChange={e => setFilterVegIncrease(e.target.checked)}
                      className="rounded border-[#DDD9CE] text-forest-700 focus:ring-0"
                    />
                    <span>Increased vegetation</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-secondary hover:text-charcoal">
                    <input
                      type="checkbox"
                      checked={filterVegDecrease}
                      onChange={e => setFilterVegDecrease(e.target.checked)}
                      className="rounded border-[#DDD9CE] text-forest-700 focus:ring-0"
                    />
                    <span>Decreased vegetation</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-charcoal-secondary hover:text-charcoal">
                    <input
                      type="checkbox"
                      checked={filterWater}
                      onChange={e => setFilterWater(e.target.checked)}
                      className="rounded border-[#DDD9CE] text-forest-700 focus:ring-0"
                    />
                    <span>Water changes</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. OPTISAR-FUSE VIEW */}
        {selectedTool === 'OptiSAR-Fuse' && (
          <div className="w-full space-y-3">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white select-none">
              {/* Layer 1: SAR Image */}
              <img
                src={layers?.sar || inputImages.secondary || inputImages.primary}
                alt="SAR Radar"
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  opacity: optiSarMode === 'optical' ? 0 : optiSarMode === 'sar' ? 1 : sarBlend / 100
                }}
              />

              {/* Layer 2: Optical Image */}
              <img
                src={layers?.rgb || inputImages.primary}
                alt="Optical"
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  opacity:
                    optiSarMode === 'sar' ? 0 : optiSarMode === 'optical' ? 1 : (100 - sarBlend) / 100
                }}
              />

              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-white/90 border border-[#DDD9CE] text-[10px] font-mono font-semibold text-forest-700">
                Optical VNIR (Reflectance)
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/90 border border-[#DDD9CE] text-[10px] font-mono font-semibold text-ochre-600">
                SAR Microwave Backscatter
              </div>
            </div>

            {optiSarMode === 'blend' && (
              <div className="p-3 rounded-lg bg-white border border-[#DDD9CE] space-y-1.5">
                <div className="flex items-center justify-between text-xs text-charcoal font-sans">
                  <span>Optical ({100 - sarBlend}%)</span>
                  <span className="font-medium text-charcoal-secondary">Cross-Modal Blend Ratio</span>
                  <span>SAR Radar ({sarBlend}%)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sarBlend}
                  onChange={e => setSarBlend(Number(e.target.value))}
                  className="w-full accent-forest-700 h-1.5 bg-ivory-200 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* 4. RS-VQA VIEW */}
        {selectedTool === 'RS-VQA' && (
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#DDD9CE] bg-white">
            <img
              src={
                activeLayer === 'falseColor' && layers?.falseColor
                  ? layers.falseColor
                  : activeLayer === 'ndvi' && layers?.ndvi
                  ? layers.ndvi
                  : activeLayer === 'ndwi' && layers?.ndwi
                  ? layers.ndwi
                  : layers?.rgb || inputImages.primary
              }
              alt="Observation canvas"
              className="w-full h-full object-contain"
            />

            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-white/90 border border-[#DDD9CE] text-[10px] font-mono text-charcoal uppercase">
              {activeLayer === 'falseColor'
                ? 'False Colour Composite (B08-B04-B03)'
                : activeLayer === 'ndvi'
                ? 'Normalized Difference Vegetation Index (NDVI)'
                : activeLayer === 'ndwi'
                ? 'Normalized Difference Water Index (NDWI)'
                : 'Natural RGB Composite'}
            </div>

            {isRealRaster && rasterEvidence && (
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-white/90 border border-[#DDD9CE] text-[10px] font-mono text-forest-700 font-semibold">
                {rasterEvidence.resolutionM}m GSD · {rasterEvidence.crs}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Target Chips for Grounding */}
      {selectedTool === 'SceneGrounder' && groundingBoxes && (
        <div className="px-5 py-3 border-t border-[#DDD9CE] bg-[#FAF9F6]">
          <div className="text-[11px] uppercase font-mono text-charcoal-muted mb-2 font-semibold">
            Grounded Targets ({groundingBoxes.length} Entities):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {groundingBoxes.map(b => {
              const isHovered = activeBoxId === b.id;
              return (
                <button
                  key={b.id}
                  onMouseEnter={() => setActiveBoxId(b.id)}
                  onMouseLeave={() => setActiveBoxId(null)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-sans transition-all flex items-center gap-1.5 ${
                    isHovered
                      ? 'bg-forest-50 text-forest-800 border-forest-700 font-semibold shadow-subtle'
                      : 'bg-white text-charcoal-secondary border-[#DDD9CE] hover:border-forest-700/40'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: b.color || '#173F35' }}
                  ></span>
                  <span>{b.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    {(b.confidence * (b.confidence > 1 ? 1 : 100)).toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bi-Temporal Summary & GeoJSON Export */}
      {selectedTool === 'ChangeSense' && (
        <div className="px-5 py-3 border-t border-[#DDD9CE] bg-[#FAF9F6] space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-charcoal font-bold">
              {isRealRaster && rasterEvidence?.changeMetrics
                ? `Altered Surface: ${rasterEvidence.changeMetrics.changed_area_km2} km² (${rasterEvidence.changeMetrics.changed_percentage}%) across ${rasterEvidence.changeMetrics.number_of_change_regions} regions`
                : changeMetrics
                ? `Total Inundation Area: ${changeMetrics.areaKm2} km² (+${changeMetrics.changePercentage}% of scene)`
                : 'Change analysis completed'}
            </span>

            {rasterEvidence?.geojson && (
              <button
                type="button"
                onClick={handleDownloadGeoJson}
                className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-white hover:bg-forest-50 text-forest-700 border border-[#DDD9CE] transition-colors"
                title="Download change polygons as GeoJSON"
              >
                <Download className="w-3 h-3" />
                <span>Export GeoJSON</span>
              </button>
            )}
          </div>

          {/* Breakdown cards */}
          {changeMetrics?.breakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {changeMetrics.breakdown.map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-white border border-[#DDD9CE]">
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <span className="text-charcoal-secondary truncate">{item.category}</span>
                    <span className="font-bold text-charcoal">{item.pct}%</span>
                  </div>
                  <div className="text-[10px] text-charcoal-muted font-mono mt-0.5">{item.areaHa} Hectares</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modality Evidence for OptiSAR-Fuse */}
      {selectedTool === 'OptiSAR-Fuse' && rasterEvidence?.modalityEvidence && (
        <div className="px-5 py-3 border-t border-[#DDD9CE] bg-[#FAF9F6] space-y-2">
          <div className="text-[11px] uppercase font-mono text-charcoal-muted font-semibold">
            Modality Attribution & Complementary Evidence:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {rasterEvidence.modalityEvidence.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded bg-white border border-[#DDD9CE] space-y-1">
                <div className="text-xs font-bold text-charcoal font-sans">{m.feature}</div>
                <div className="text-[10px] font-mono text-forest-700 font-semibold">{m.primary_modality}</div>
                <p className="text-[11px] text-charcoal-secondary leading-snug">{m.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
