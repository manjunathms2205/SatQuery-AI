import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Layers,
  Sparkles,
  Camera,
  Radio,
  Clock,
  Scan,
  CheckCircle2
} from 'lucide-react';
import { AnalysisMode } from '../../types';

interface SidebarProps {
  currentView: 'dashboard' | 'history';
  onViewChange: (view: 'dashboard' | 'history') => void;
  selectedMode: AnalysisMode;
  onModeSelect: (mode: AnalysisMode) => void;
  onNewAnalysis: () => void;
  historyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  selectedMode,
  onModeSelect,
  onNewAnalysis,
  historyCount
}) => {
  const modes: { id: AnalysisMode; label: string; tool: string; icon: React.ReactNode }[] = [
    {
      id: 'auto',
      label: 'Auto Route',
      tool: 'Agent Router',
      icon: <Sparkles className="w-3.5 h-3.5" />
    },
    {
      id: 'vqa',
      label: 'Single Image',
      tool: 'RS-VQA',
      icon: <Camera className="w-3.5 h-3.5" />
    },
    {
      id: 'optisar',
      label: 'Optical + SAR',
      tool: 'OptiSAR-Fuse',
      icon: <Radio className="w-3.5 h-3.5" />
    },
    {
      id: 'bitemporal',
      label: 'Bi-temporal',
      tool: 'ChangeSense',
      icon: <Clock className="w-3.5 h-3.5" />
    },
    {
      id: 'grounding',
      label: 'Grounding',
      tool: 'SceneGrounder',
      icon: <Scan className="w-3.5 h-3.5" />
    }
  ];

  return (
    <aside className="w-56 border-r border-[#DDD9CE] bg-[#ECE9E1] flex flex-col justify-between shrink-0 h-full select-none">
      {/* Top Section */}
      <div className="p-4 space-y-6">
        {/* Brand */}
        <div className="px-2 py-1">
          <div className="text-sm font-bold tracking-tight text-forest-700 font-sans">
            SatQuery AI
          </div>
          <div className="text-[10px] text-charcoal-muted uppercase font-mono tracking-wider">
            SIH 2026 Prototype
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="space-y-0.5">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-white text-forest-700 font-semibold shadow-subtle border border-[#DDD9CE]'
                : 'text-charcoal-secondary hover:text-charcoal hover:bg-white/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-forest-600" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={onNewAnalysis}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-charcoal-secondary hover:text-charcoal hover:bg-white/50 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-forest-600" />
            <span>New Analysis</span>
          </button>

          <button
            onClick={() => onViewChange('history')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'history'
                ? 'bg-white text-forest-700 font-semibold shadow-subtle border border-[#DDD9CE]'
                : 'text-charcoal-secondary hover:text-charcoal hover:bg-white/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-3.5 h-3.5 text-forest-600" />
              <span>Analysis History</span>
            </div>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-[10px] font-mono text-forest-700 border border-[#DDD9CE]">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* ANALYSIS MODES SECTION */}
        <div className="pt-2 border-t border-[#DDD9CE]/60">
          <div className="px-2 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-charcoal-muted font-bold font-sans">
              Analysis Modes
            </span>
          </div>

          <div className="space-y-0.5">
            {modes.map(mode => {
              const active = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    onModeSelect(mode.id);
                    onViewChange('dashboard');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    active
                      ? 'bg-white text-forest-700 font-semibold shadow-subtle border border-[#DDD9CE]'
                      : 'text-charcoal-secondary hover:text-charcoal hover:bg-white/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={active ? 'text-forest-700' : 'text-charcoal-muted'}>
                      {mode.icon}
                    </span>
                    <span>{mode.label}</span>
                  </div>
                  <span className="text-[9px] font-mono text-charcoal-muted">{mode.tool}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Status Card */}
      <div className="p-4 border-t border-[#DDD9CE]/80 text-[11px] text-charcoal-secondary space-y-1">
        <div className="flex items-center gap-1.5 font-medium text-forest-700">
          <CheckCircle2 className="w-3 h-3 text-forest-600" />
          <span>4 Specialists Ready</span>
        </div>
        <div className="text-[10px] text-charcoal-muted font-mono">
          Pluggable Architecture · v1.2
        </div>
      </div>
    </aside>
  );
};
