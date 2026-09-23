import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Terminal, Check } from 'lucide-react';
import { ExecutionTraceStep } from '../../types';

interface ExecutionTraceProps {
  steps: ExecutionTraceStep[];
  totalLatencyMs?: number;
}

export const ExecutionTrace: React.FC<ExecutionTraceProps> = ({ steps, totalLatencyMs }) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [isTraceCollapsed, setIsTraceCollapsed] = useState<boolean>(false);

  const toggleStep = (id: string) => {
    setExpandedStepId(prev => (prev === id ? null : id));
  };

  return (
    <div className="rounded-xl border border-[#DDD9CE] bg-white overflow-hidden shadow-subtle">
      {/* Header bar */}
      <div
        onClick={() => setIsTraceCollapsed(!isTraceCollapsed)}
        className="px-5 py-3 bg-[#FAF9F6] border-b border-[#DDD9CE] flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-forest-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal font-sans">
            Observable Scientific Execution Trace
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ivory-200 text-charcoal-secondary border border-[#DDD9CE]">
            {steps.length} Steps
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-charcoal-secondary">
          {totalLatencyMs && (
            <span className="hidden sm:inline">
              Total Latency: <span className="text-charcoal font-semibold">{totalLatencyMs}ms</span>
            </span>
          )}
          {isTraceCollapsed ? (
            <ChevronRight className="w-4 h-4 text-charcoal-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-charcoal-muted" />
          )}
        </div>
      </div>

      {/* Scientific Workflow Timeline */}
      {!isTraceCollapsed && (
        <div className="p-4 space-y-1 divide-y divide-[#DDD9CE]/50">
          {steps.map((step, idx) => {
            const isExpanded = expandedStepId === step.id;
            const stepNum = String(idx + 1).padStart(2, '0');

            return (
              <div key={step.id} className="pt-2 first:pt-0">
                <div
                  onClick={() => toggleStep(step.id)}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-forest-50/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-forest-700 w-5">
                      {stepNum}
                    </span>
                    <span className="text-xs font-semibold text-charcoal font-sans">
                      {step.title}
                    </span>
                    <span className="hidden md:inline text-[11px] text-charcoal-secondary font-sans truncate max-w-md">
                      — {step.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-charcoal-muted">
                      {step.durationMs}ms
                    </span>
                    <span className="w-4 h-4 rounded-full bg-forest-50 text-forest-700 border border-forest-100 flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-charcoal-muted" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-charcoal-muted" />
                    )}
                  </div>
                </div>

                {/* Expanded Technical Metadata */}
                {isExpanded && step.details && (
                  <div className="pl-10 pr-2 pb-2 pt-1 text-xs">
                    <p className="text-xs text-charcoal-secondary font-sans mb-1.5 md:hidden">
                      {step.description}
                    </p>
                    <pre className="p-2.5 rounded bg-[#FAF9F6] border border-[#DDD9CE] text-[11px] font-mono text-charcoal overflow-x-auto">
                      {JSON.stringify(step.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
