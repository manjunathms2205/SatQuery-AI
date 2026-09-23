import React from 'react';
import {
  Presentation,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
  HelpCircle,
  Route,
  CheckCircle2
} from 'lucide-react';

export type DemoPresentationStep = 1 | 2 | 3;

interface PresentationDemoModeProps {
  isActive: boolean;
  currentStep: DemoPresentationStep;
  onStepChange: (step: DemoPresentationStep) => void;
  onToggleDemoMode: () => void;
  onResetDemo: () => void;
  hasResults: boolean;
  onRunCurrentDemo: () => void;
}

export const PresentationDemoMode: React.FC<PresentationDemoModeProps> = ({
  isActive,
  currentStep,
  onStepChange,
  onToggleDemoMode,
  onResetDemo,
  hasResults,
  onRunCurrentDemo
}) => {
  if (!isActive) return null;

  const steps = [
    {
      num: 1 as DemoPresentationStep,
      title: 'Step 1: Ask a question',
      desc: 'Ingest satellite observation & natural-language question',
      icon: <HelpCircle className="w-3.5 h-3.5" />
    },
    {
      num: 2 as DemoPresentationStep,
      title: 'Step 2: Agent selects a specialist',
      desc: 'Preflight validation, intent classification & tool dispatch',
      icon: <Route className="w-3.5 h-3.5" />
    },
    {
      num: 3 as DemoPresentationStep,
      title: 'Step 3: Evidence-grounded answer',
      desc: 'Calibrated AI assessment with interactive visual layers',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!hasResults) {
        onRunCurrentDemo();
      }
      onStepChange(2);
    } else if (currentStep === 2) {
      onStepChange(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      onStepChange(2);
    } else if (currentStep === 2) {
      onStepChange(1);
    }
  };

  return (
    <div className="rounded-xl border border-forest-700/40 bg-white p-4 shadow-subtle space-y-3.5 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DDD9CE]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-700 font-sans">
                Presentation Demo Mode
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-forest-50 text-forest-700 border border-forest-100">
                3-Step Flow
              </span>
            </div>
            <p className="text-[11px] text-charcoal-secondary font-sans">
              Guided presentation for SIH 2026 evaluation.
            </p>
          </div>
        </div>

        {/* Presentation Controls: BACK / NEXT / RESET / EXIT */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetDemo}
            className="flex items-center gap-1 text-xs font-sans px-2.5 py-1.5 rounded-lg border border-[#DDD9CE] hover:border-forest-700/40 bg-[#FAF9F6] text-charcoal-secondary hover:text-charcoal transition-colors"
            title="Reset to Step 1 and reload scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="font-medium">Reset Demo</span>
          </button>

          <button
            type="button"
            disabled={currentStep === 1}
            onClick={handleBack}
            className="flex items-center gap-1 text-xs font-sans px-2.5 py-1.5 rounded-lg border border-[#DDD9CE] hover:border-forest-700/40 bg-white text-charcoal disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK</span>
          </button>

          <button
            type="button"
            disabled={currentStep === 3}
            onClick={handleNext}
            className="flex items-center gap-1 text-xs font-sans font-semibold px-3 py-1.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-subtle"
          >
            <span>NEXT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleDemoMode}
            className="p-1.5 rounded-lg text-charcoal-secondary hover:text-charcoal hover:bg-ivory-200 ml-1 transition-colors"
            title="Exit Presentation Demo Mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-Step Clean Numbered Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {steps.map(s => {
          const isCurrent = currentStep === s.num;
          const isCompleted = currentStep > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => onStepChange(s.num)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isCurrent
                  ? 'bg-forest-50/70 border-forest-700 text-charcoal shadow-subtle'
                  : isCompleted
                  ? 'bg-[#FAF9F6] border-forest-100 text-charcoal-secondary'
                  : 'bg-[#FAF9F6] border-[#DDD9CE] text-charcoal-muted opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={isCurrent ? 'text-forest-700' : 'text-charcoal-muted'}>
                    {s.icon}
                  </span>
                  <span className={`text-xs font-sans font-bold ${isCurrent ? 'text-forest-700' : 'text-charcoal'}`}>
                    {s.title}
                  </span>
                </div>
                {isCompleted && (
                  <span className="text-[10px] font-mono text-forest-700 bg-forest-50 px-1 rounded border border-forest-100">
                    Done
                  </span>
                )}
              </div>
              <p className="text-[11px] text-charcoal-secondary font-sans line-clamp-1">{s.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
