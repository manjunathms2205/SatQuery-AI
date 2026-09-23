import React from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface QueryInputProps {
  query: string;
  onChangeQuery: (q: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  exampleQueries: string[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export const QueryInput: React.FC<QueryInputProps> = ({
  query,
  onChangeQuery,
  onAnalyze,
  isAnalyzing,
  exampleQueries,
  label = "What would you like to know?",
  placeholder = "Describe the land-cover and major objects visible in this image...",
  disabled = false,
  disabledReason
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isAnalyzing && query.trim().length > 1 && !disabled) {
        onAnalyze();
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Central Query Container */}
      <div
        className={`rounded-xl border bg-white p-4 shadow-subtle transition-all ${
          disabled
            ? 'border-[#DDD9CE] opacity-80'
            : 'border-[#DDD9CE] focus-within:border-forest-700 focus-within:ring-1 focus-within:ring-forest-700/20'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs uppercase tracking-wider font-bold text-charcoal-secondary font-sans">
            {label}
          </label>
          {disabled && disabledReason && (
            <span className="text-[11px] text-ochre-700 font-medium">
              {disabledReason}
            </span>
          )}
        </div>

        <textarea
          value={query}
          onChange={e => onChangeQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          disabled={isAnalyzing || disabled}
          className="w-full bg-transparent resize-none text-base text-charcoal placeholder:text-charcoal-muted focus:outline-none font-sans leading-relaxed disabled:cursor-not-allowed"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DDD9CE]/60 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-secondary">
            <span className={`w-1.5 h-1.5 rounded-full ${disabled ? 'bg-charcoal-muted' : 'bg-forest-600'}`}></span>
            <span>Agent classifies query & routes to specialist tool</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-charcoal-muted font-sans">
              Press <kbd className="px-1.5 py-0.5 rounded bg-ivory-200 text-charcoal border border-[#DDD9CE] text-[11px] font-mono">Enter ↵</kbd>
            </span>

            {/* Dark Forest Green Analyze Button */}
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing || query.trim().length < 2 || disabled}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold font-sans tracking-wide transition-all ${
                isAnalyzing
                  ? 'bg-forest-900 text-white cursor-wait opacity-80'
                  : query.trim().length < 2 || disabled
                  ? 'bg-ivory-200 text-charcoal-muted border border-[#DDD9CE] cursor-not-allowed'
                  : 'bg-forest-700 hover:bg-forest-800 text-white shadow-subtle active:scale-[0.98]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Example Queries */}
      {exampleQueries.length > 0 && !disabled && (
        <div className="flex flex-wrap items-baseline gap-2 pt-0.5 text-xs">
          <span className="text-[11px] font-medium text-charcoal-secondary uppercase tracking-wider">
            Suggested:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {exampleQueries.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChangeQuery(ex)}
                className="text-left px-2.5 py-1 rounded-md bg-white hover:bg-forest-50/60 text-charcoal-secondary hover:text-forest-800 border border-[#DDD9CE] hover:border-forest-700/40 transition-colors truncate max-w-[340px]"
                title={ex}
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
