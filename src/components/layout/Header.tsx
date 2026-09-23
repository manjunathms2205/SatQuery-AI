import React from 'react';
import { Satellite, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  isAnalyzing: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, isAnalyzing }) => {
  return (
    <header className="border-b border-[#DDD9CE] bg-[#FAF9F6] sticky top-0 z-30 px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700">
          <Satellite className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-forest-700 font-sans">
              SatQuery AI
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-forest-50 text-forest-700 border border-forest-100 font-medium">
              SIH 2026
            </span>
          </div>
          <p className="text-xs text-charcoal-secondary hidden sm:block">
            Multi-Modal Earth Observation Assistant
          </p>
        </div>
      </div>

      {/* Center: Quiet, Subtle Transparency Note */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-charcoal-secondary">
        <span className="w-1.5 h-1.5 rounded-full bg-sage-400"></span>
        <span className="text-[11px]">Prototype · Specialist outputs are demonstrative</span>
      </div>

      {/* Right: Small Status & New Analysis */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ECE9E1] text-[11px] font-sans text-charcoal-secondary">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAnalyzing ? 'bg-terracotta-500 animate-pulse' : 'bg-forest-600'
            }`}
          ></span>
          <span>{isAnalyzing ? 'Analyzing...' : 'System Ready'}</span>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-charcoal hover:text-forest-700 px-2.5 py-1.5 rounded-lg border border-[#DDD9CE] hover:border-forest-700/40 bg-white transition-colors"
          title="Clear inputs and start a fresh session"
        >
          <RefreshCw className="w-3.5 h-3.5 text-charcoal-secondary" />
          <span className="hidden sm:inline font-medium">New Analysis</span>
        </button>
      </div>
    </header>
  );
};
