import React from 'react';
import { ArrowRight, Check, Route } from 'lucide-react';
import { AgentDecision } from '../../types';

interface AgentDecisionCardProps {
  decision: AgentDecision;
  confidenceScore: number;
}

export const AgentDecisionCard: React.FC<AgentDecisionCardProps> = ({
  decision,
  confidenceScore
}) => {
  const steps = [
    { num: '01', title: 'Input Check', detail: decision.inputSummary, status: 'completed' },
    { num: '02', title: 'Query Understanding', detail: decision.detectedTask, status: 'completed' },
    { num: '03', title: 'Specialist Selected', detail: decision.selectedTool, status: 'highlight' },
    { num: '04', title: 'Evidence Integration', detail: 'Spatial Layers', status: 'completed' },
    { num: '05', title: 'Calibrated Answer', detail: `${confidenceScore.toFixed(1)}% Confidence`, status: 'completed' }
  ];

  return (
    <div className="rounded-xl border border-[#DDD9CE] bg-white p-5 shadow-subtle space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DDD9CE]/60">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-forest-700 font-sans">
            Agent Decision & Routing Process
          </h3>
          <p className="text-xs text-charcoal-secondary">
            Observable routing rationale without hidden chain-of-thought.
          </p>
        </div>
        <div className="text-xs font-mono text-charcoal-secondary">
          Confidence: <span className="font-bold text-forest-700">{confidenceScore.toFixed(1)}%</span>
        </div>
      </div>

      {/* Process Visualization Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {steps.map((st, idx) => {
          const isHighlight = st.status === 'highlight';
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border text-left flex flex-col justify-between ${
                isHighlight
                  ? 'bg-terracotta-50/70 border-terracotta-500/40 text-charcoal'
                  : 'bg-forest-50/40 border-forest-100 text-charcoal'
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
                <span className={isHighlight ? 'text-terracotta-600 font-bold' : 'text-forest-700 font-semibold'}>
                  {st.num}
                </span>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  isHighlight ? 'bg-terracotta-500 text-white' : 'bg-forest-600 text-white'
                }`}>
                  ✓
                </span>
              </div>
              <div>
                <div className="text-xs font-bold font-sans line-clamp-1">{st.title}</div>
                <div className="text-[10px] text-charcoal-secondary font-mono truncate mt-0.5">{st.detail}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Summary Grid */}
      <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#DDD9CE] space-y-2 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted">Input Observations</span>
            <div className="font-semibold text-charcoal">{decision.inputSummary}</div>
            <div className="text-[11px] text-forest-700 font-mono mt-0.5">{decision.inputValidationStatus}</div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted">Query Type & Task</span>
            <div className="font-semibold text-charcoal">{decision.queryType}</div>
            <div className="text-[11px] text-charcoal-secondary font-mono mt-0.5">{decision.detectedTask}</div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted">Selected Specialist</span>
            <div className="font-bold text-forest-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
              <span>{decision.selectedTool}</span>
            </div>
            <div className="text-[11px] text-charcoal-secondary font-mono mt-0.5">Required: {decision.requiredEvidence}</div>
          </div>
        </div>

        {/* Routing Reason */}
        <div className="pt-2 border-t border-[#DDD9CE]/60 flex items-start gap-2">
          <Route className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
          <p className="text-xs text-charcoal leading-relaxed font-sans">
            <span className="font-semibold text-forest-700">Routing reason:</span> "{decision.routingReason}"
          </p>
        </div>
      </div>
    </div>
  );
};
