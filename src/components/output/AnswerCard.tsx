import React from 'react';
import { Download, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { downloadReportFile } from '../../utils/reportExporter';

interface AnswerCardProps {
  result: AnalysisResult;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ result }) => {
  const {
    detectedTask,
    selectedTool,
    toolVersion,
    confidenceScore,
    processingTimeMs,
    answer,
    keyFindings,
    spatialMetadata,
    agentDecision,
    prototypeTransparencyNotice,
    isRealRaster,
    rasterEvidence
  } = result;

  const confidenceRating = confidenceScore >= 95 ? 'High' : confidenceScore >= 80 ? 'Moderate' : 'Calibrated';

  return (
    <div className="rounded-xl border border-[#DDD9CE] bg-white p-6 shadow-subtle flex flex-col justify-between space-y-6">
      <div className="space-y-5">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DDD9CE]/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
              {detectedTask}
            </span>
            <span className="text-xs font-mono text-charcoal-secondary">
              {selectedTool} ({toolVersion})
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-charcoal-muted">{processingTimeMs}ms</span>
            <span className="px-2 py-0.5 rounded bg-forest-50 text-forest-700 font-bold border border-forest-100">
              {confidenceRating} ({confidenceScore.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* 1. QUANTITATIVE EVIDENCE (Strictly from backend math) */}
        <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#DDD9CE] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-forest-700" />
              <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-charcoal">
                {isRealRaster ? 'Raster-derived evidence' : 'Quantitative Evidence'}
              </span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-forest-700 border border-[#DDD9CE]">
              {isRealRaster ? 'Easy-EO + Rasterio' : 'Demonstrative Control'}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {rasterEvidence?.indices?.ndvi ? (
              <>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">NDVI Mean</span>
                  <span className="font-bold text-forest-700">{rasterEvidence.indices.ndvi.mean}</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">Vegetation Area</span>
                  <span className="font-bold text-forest-700">{rasterEvidence.indices.ndvi.vegetation_area_km2} km² ({rasterEvidence.indices.ndvi.vegetation_pct}%)</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">NDWI Water</span>
                  <span className="font-bold text-charcoal">
                    {rasterEvidence.indices.ndwi ? `${rasterEvidence.indices.ndwi.water_area_km2} km²` : 'Not calculated'}
                  </span>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">NDBI Built-Up</span>
                  <span className="text-charcoal-secondary text-[10px]">{rasterEvidence.indices.ndbi?.status || 'Not calculated'}</span>
                </div>
              </>
            ) : rasterEvidence?.changeMetrics ? (
              <>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">Altered Surface</span>
                  <span className="font-bold text-terracotta-600">{rasterEvidence.changeMetrics.changed_area_km2} km²</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">Change Percentage</span>
                  <span className="font-bold text-terracotta-600">{rasterEvidence.changeMetrics.changed_percentage}%</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">Change Clusters</span>
                  <span className="font-bold text-charcoal">{rasterEvidence.changeMetrics.number_of_change_regions} regions</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">Largest Region</span>
                  <span className="font-bold text-charcoal">{rasterEvidence.changeMetrics.largest_change_region_ha} ha</span>
                </div>
              </>
            ) : (
              /* Fallback to verified specialist metrics */
              <>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">Observed Footprint</span>
                  <span className="font-bold text-charcoal">{spatialMetadata.coordinates || 'Local grid'}</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#DDD9CE]/60">
                  <span className="text-[10px] text-charcoal-muted block">Spatial GSD</span>
                  <span className="font-bold text-forest-700">{spatialMetadata.resolutionGsd}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. AI MODEL INTERPRETATION (Conditioned strictly on evidence) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-charcoal-muted block">
              AI Model Interpretation
            </span>
            <span className="text-[10px] font-mono text-charcoal-muted">
              Conditioned on evidence
            </span>
          </div>
          <p className="text-base text-charcoal leading-relaxed font-sans font-normal">
            {answer}
          </p>
        </div>

        {/* Key Findings List */}
        <div className="space-y-2 pt-2 border-t border-[#DDD9CE]/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">
            Key Findings
          </h4>
          <ul className="space-y-1.5 text-xs text-charcoal leading-normal font-sans">
            {keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-forest-700 font-bold shrink-0 mt-0.5">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sensor & Spatial Telemetry */}
        <div className="pt-2 border-t border-[#DDD9CE]/40 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-charcoal-muted">
            <span>Spatial & Sensor Telemetry</span>
            <span className="text-charcoal-muted">{isRealRaster ? 'Easy-EO verified' : 'curated metadata'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-charcoal">
            <div>
              <span className="text-charcoal-muted text-[11px] block">Sensor</span>
              <span className="truncate block font-medium">{spatialMetadata.sensor}</span>
            </div>
            <div>
              <span className="text-charcoal-muted text-[11px] block">Resolution</span>
              <span className="truncate block font-medium">{spatialMetadata.resolutionGsd}</span>
            </div>
            <div>
              <span className="text-charcoal-muted text-[11px] block">Coordinates</span>
              <span className="truncate block font-medium">{spatialMetadata.coordinates}</span>
            </div>
            <div>
              <span className="text-charcoal-muted text-[11px] block">Acquisition Time</span>
              <span className="truncate block font-medium">{spatialMetadata.acquisitionDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Download Report & Transparency Disclaimer */}
      <div className="pt-4 border-t border-[#DDD9CE]/60 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[10px] text-charcoal-muted font-mono max-w-sm">
          {prototypeTransparencyNotice}
        </span>

        <button
          onClick={() => downloadReportFile(result)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDD9CE] hover:border-forest-700/60 bg-white hover:bg-forest-50/40 text-forest-700 text-xs font-sans font-semibold transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Report</span>
        </button>
      </div>
    </div>
  );
};
