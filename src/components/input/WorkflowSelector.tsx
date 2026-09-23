import React from 'react';
import { Camera, Scan, Clock, Radio, Sparkles, Check } from 'lucide-react';
import { AnalysisMode } from '../../types';

interface WorkflowSelectorProps {
  selectedMode: AnalysisMode | null;
  onSelectMode: (mode: AnalysisMode) => void;
}

export const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  selectedMode,
  onSelectMode
}) => {
  const specialists = [
    {
      id: 'vqa' as AnalysisMode,
      name: 'Single Image',
      description: 'Ask questions about one satellite image',
      specialist: 'RS-VQA',
      icon: Camera
    },
    {
      id: 'grounding' as AnalysisMode,
      name: 'Grounding',
      description: 'Locate objects or regions from a text query',
      specialist: 'SceneGrounder',
      icon: Scan
    },
    {
      id: 'bitemporal' as AnalysisMode,
      name: 'Bi-temporal',
      description: 'Compare observations across two dates',
      specialist: 'ChangeSense',
      icon: Clock
    },
    {
      id: 'optisar' as AnalysisMode,
      name: 'Optical + SAR',
      description: 'Combine complementary optical and radar observations',
      specialist: 'OptiSAR-Fuse',
      icon: Radio
    }
  ];

  return (
    <section className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal-secondary font-sans">
          Choose an analysis
        </h2>
        <p className="text-xs text-charcoal-muted">
          How would you like to analyze your imagery?
        </p>
      </div>

      {/* Subtle Auto Route Option Above Specialists */}
      <div
        onClick={() => onSelectMode('auto')}
        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          selectedMode === 'auto'
            ? 'border-forest-700 bg-forest-50/50 ring-1 ring-forest-700/30'
            : 'border-[#DDD9CE] bg-white hover:border-forest-700/40 hover:bg-[#FAF9F6]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              selectedMode === 'auto'
                ? 'bg-forest-700 text-white'
                : 'bg-ivory-200 text-charcoal-secondary border border-[#DDD9CE]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal font-sans">
                AUTO ROUTE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ivory-200 text-charcoal-secondary border border-[#DDD9CE]">
                Intelligent Router
              </span>
            </div>
            <p className="text-xs text-charcoal-secondary">
              Let SatQuery determine the appropriate specialist from your query and inputs.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onSelectMode('auto');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all whitespace-nowrap self-start sm:self-center ${
            selectedMode === 'auto'
              ? 'bg-forest-700 text-white shadow-subtle'
              : 'bg-white hover:bg-forest-50 text-forest-700 border border-[#DDD9CE]'
          }`}
        >
          {selectedMode === 'auto' ? 'Active' : 'Use Auto Route'}
        </button>
      </div>

      {/* 2x2 Clean Specialist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {specialists.map(item => {
          const Icon = item.icon;
          const isSelected = selectedMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMode(item.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'border-forest-700 bg-white ring-1 ring-forest-700/40 shadow-subtle'
                  : 'border-[#DDD9CE] bg-white hover:border-forest-700/40 hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2 w-full">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-forest-700 text-white'
                        : 'bg-ivory-200 text-charcoal group-hover:text-forest-700 group-hover:bg-forest-50 border border-[#DDD9CE]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal font-sans">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-mono text-charcoal-muted tracking-tight">
                      {item.specialist}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-forest-700 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <p className="text-xs text-charcoal-secondary font-sans leading-relaxed mt-1">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
