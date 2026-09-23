import React from 'react';
import { History, Trash2, Clock, ChevronRight } from 'lucide-react';
import { AnalysisResult } from '../../types';

interface HistoryModalProps {
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export const HistoryView: React.FC<HistoryModalProps> = ({
  history,
  onSelectResult,
  onClearHistory,
  onClose
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#DDD9CE]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-forest-700" />
          <h2 className="text-base font-bold text-charcoal font-sans">Analysis Session History</h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-ivory-200 text-forest-700 border border-[#DDD9CE]">
            {history.length} Saved
          </span>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-terracotta-700 hover:text-terracotta-800 font-sans px-2.5 py-1.5 rounded-lg border border-terracotta-100 hover:border-terracotta-500/40 bg-terracotta-50 transition-colors font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-[#DDD9CE] bg-white">
          <Clock className="w-8 h-8 text-charcoal-muted mx-auto mb-3" />
          <p className="text-sm text-charcoal font-semibold">No prior analyses in this session yet.</p>
          <p className="text-xs text-charcoal-secondary mt-1">
            Run an analysis from the dashboard to track results, metrics, and traces here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map(item => (
            <div
              key={item.id}
              onClick={() => {
                onSelectResult(item);
                onClose();
              }}
              className="p-4 rounded-xl border border-[#DDD9CE] bg-white hover:border-forest-700/60 transition-all cursor-pointer group flex items-center justify-between shadow-subtle"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-forest-50 text-forest-700 font-bold border border-forest-100">
                    {item.detectedTask}
                  </span>
                  <span className="text-charcoal-secondary">
                    {item.selectedTool}
                  </span>
                  <span className="text-charcoal-muted">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-sm font-bold text-charcoal group-hover:text-forest-700 transition-colors font-sans">
                  "{item.query}"
                </div>

                <p className="text-xs text-charcoal-secondary line-clamp-2 font-sans leading-relaxed">
                  {item.answer}
                </p>
              </div>

              <div className="flex items-center gap-4 pl-4 shrink-0">
                <div className="text-right font-mono text-xs">
                  <div className="font-bold text-forest-700">
                    {item.confidenceScore.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-charcoal-muted">{item.processingTimeMs}ms</div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-ivory-100 border border-[#DDD9CE] flex items-center justify-center text-charcoal-secondary group-hover:text-forest-700 group-hover:border-forest-700/40 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
