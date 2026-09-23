import React from 'react';
import { ArrowRight, Presentation } from 'lucide-react';
import { DemoScenario } from '../../types';
import { DEMO_SCENARIOS } from '../../data/sampleScenarios';

interface DemoWorkflowsProps {
  onSelectScenario: (scenario: DemoScenario, autoRun?: boolean) => void;
  activeScenarioId?: string;
  isAnalyzing: boolean;
  isDemoModeActive: boolean;
  onToggleDemoMode: () => void;
}

export const DemoWorkflows: React.FC<DemoWorkflowsProps> = ({
  onSelectScenario,
  activeScenarioId,
  isAnalyzing,
  isDemoModeActive,
  onToggleDemoMode
}) => {
  return (
    <section className="space-y-4 pt-6 border-t border-[#DDD9CE]">
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 pb-2 border-b border-[#DDD9CE]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold px-2 py-0.5 rounded bg-ochre-50 text-ochre-700 border border-ochre-100">
              DEMO · Curated demonstration imagery
            </span>
          </div>
          <h3 className="text-base font-bold text-charcoal font-sans">
            Demo Workflows
          </h3>
          <p className="text-xs text-charcoal-secondary">
            Use curated examples for presentation and live jury evaluation.
          </p>
        </div>

        {/* Presentation Demo Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleDemoMode}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-sans transition-all border ${
            isDemoModeActive
              ? 'bg-forest-700 text-white border-forest-800 shadow-subtle'
              : 'bg-white hover:bg-forest-50 text-forest-700 border-[#DDD9CE] hover:border-forest-700/50 shadow-subtle'
          }`}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span className="font-semibold">
            {isDemoModeActive ? 'Exit Demo Mode' : 'Presentation Demo Mode'}
          </span>
        </button>
      </div>

      {/* 4 Clean Curated Scenario Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {DEMO_SCENARIOS.map(sc => {
          const isSelected = activeScenarioId === sc.id;
          return (
            <div
              key={sc.id}
              className={`p-3.5 rounded-xl border bg-white transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-forest-700 ring-1 ring-forest-700/40 shadow-subtle'
                  : 'border-[#DDD9CE] hover:border-forest-700/40 hover:shadow-subtle'
              }`}
            >
              <div>
                {/* Category Label & Thumbnail */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-charcoal-muted">
                    {sc.badge}
                  </span>
                  <div className="w-9 h-7 rounded border border-[#DDD9CE] overflow-hidden bg-ivory-100 shrink-0">
                    <img
                      src={sc.image1}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-charcoal line-clamp-1 mb-1">
                  {sc.name}
                </h4>

                {/* Query snippet */}
                <p className="text-[11px] text-charcoal-secondary font-sans line-clamp-2 italic leading-relaxed">
                  "{sc.defaultQuery}"
                </p>
              </div>

              {/* Actions */}
              <div className="mt-3 pt-2.5 border-t border-[#DDD9CE]/60 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onSelectScenario(sc, false)}
                  className={`font-medium text-[11px] ${
                    isSelected ? 'text-forest-700 font-bold' : 'text-charcoal-secondary hover:text-charcoal'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Load data'}
                </button>

                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => onSelectScenario(sc, true)}
                  className="flex items-center gap-1 font-semibold text-[11px] text-forest-700 hover:text-forest-800 disabled:opacity-50 group"
                >
                  <span>Run example</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
