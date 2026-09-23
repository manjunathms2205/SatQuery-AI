import React, { useState, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { WorkflowSelector } from './components/input/WorkflowSelector';
import { ImageUploader } from './components/input/ImageUploader';
import { QueryInput } from './components/input/QueryInput';
import { VisualEvidence } from './components/output/VisualEvidence';
import { AnswerCard } from './components/output/AnswerCard';
import { ExecutionTrace } from './components/output/ExecutionTrace';
import { AgentDecisionCard } from './components/output/AgentDecisionCard';
import { HistoryView } from './components/output/HistoryModal';
import { PresentationDemoMode, DemoPresentationStep } from './components/presentation/PresentationDemoMode';
import { DemoWorkflows } from './components/presentation/DemoWorkflows';
import { DEMO_SCENARIOS } from './data/sampleScenarios';
import { agentEngine } from './services/agentEngine';
import { AnalysisMode, AnalysisResult, DemoScenario, ExecutionTraceStep, UploadedFileMeta } from './types';
import { AlertCircle, Loader2, Layers } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'history'>('dashboard');
  
  // Selected workflow: null until user selects one (or auto-assigned when loading a demo)
  const [selectedWorkflow, setSelectedWorkflow] = useState<AnalysisMode | null>(null);
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('auto');

  // Input states - Start EMPTY (no dummy imagery)
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);
  const [primaryLabel, setPrimaryLabel] = useState<string>('Primary Satellite Scene');
  const [primaryMeta, setPrimaryMeta] = useState<UploadedFileMeta | null>(null);

  const [secondaryImage, setSecondaryImage] = useState<string | null>(null);
  const [secondaryLabel, setSecondaryLabel] = useState<string>('Paired Modality Scene');
  const [secondaryMeta, setSecondaryMeta] = useState<UploadedFileMeta | null>(null);

  const [query, setQuery] = useState<string>('');
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>(undefined);
  const [exampleQueries, setExampleQueries] = useState<string[]>([]);

  // Presentation Demo Mode state
  const [isDemoModeActive, setIsDemoModeActive] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<DemoPresentationStep>(1);

  // Execution & Results state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [liveTrace, setLiveTrace] = useState<ExecutionTraceStep[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  // Concurrency guard
  const isExecutingRef = useRef<boolean>(false);

  // Helper for mode-tailored query configuration
  const getQueryConfig = () => {
    const active = selectedWorkflow || selectedMode;
    switch (active) {
      case 'grounding':
        return {
          label: 'What would you like to locate?',
          placeholder: 'Highlight the solar arrays and major energy infrastructure...',
          defaultSuggestions: [
            'Highlight the solar arrays and major energy infrastructure.',
            'Ground the Battery Energy Storage System (BESS) container enclosures.',
            'Identify all distributed inverter sheds stationed along the service tracks.'
          ]
        };
      case 'bitemporal':
        return {
          label: 'What would you like to compare?',
          placeholder: 'What changed between these two observations?',
          defaultSuggestions: [
            'What changed between these two dates, and where did the change occur?',
            'Detect inundated floodplains and quantify infrastructure damage.',
            'Identify structural washouts along the primary highway corridor and bridges.'
          ]
        };
      case 'optisar':
        return {
          label: 'What would you like to know?',
          placeholder: 'Use the optical and SAR images together to identify built-up and water-covered regions...',
          defaultSuggestions: [
            'Use the optical and SAR images together to identify built-up and water-covered regions.',
            'Penetrate dense cloud cover using SAR backscatter to detect illegal deforestation corridors.',
            'Fuse optical reflectance with radar polarimetry to assess soil moisture saturation.'
          ]
        };
      case 'vqa':
      case 'auto':
      default:
        return {
          label: 'What would you like to know?',
          placeholder: 'Describe the land-cover and major objects visible in this image...',
          defaultSuggestions: [
            'Describe the land-cover and major objects visible in this image.',
            'How many cargo vessels and tankers are docked at the wharfs?',
            'Are there any hydrocarbon slick leaks detected near the south pier?'
          ]
        };
    }
  };

  const handleSelectWorkflow = (mode: AnalysisMode) => {
    setSelectedWorkflow(mode);
    setSelectedMode(mode);
    setErrorMessage(null);
    if (!activeScenarioId) {
      const active = mode;
      if (active === 'grounding') {
        setExampleQueries([
          'Highlight the solar arrays and major energy infrastructure.',
          'Ground the Battery Energy Storage System (BESS) container enclosures.',
          'Identify all distributed inverter sheds stationed along the service tracks.'
        ]);
      } else if (active === 'bitemporal') {
        setExampleQueries([
          'What changed between these two dates, and where did the change occur?',
          'Detect inundated floodplains and quantify infrastructure damage.',
          'Identify structural washouts along the primary highway corridor and bridges.'
        ]);
      } else if (active === 'optisar') {
        setExampleQueries([
          'Use the optical and SAR images together to identify built-up and water-covered regions.',
          'Penetrate dense cloud cover using SAR backscatter to detect illegal deforestation corridors.',
          'Fuse optical reflectance with radar polarimetry to assess soil moisture saturation.'
        ]);
      } else {
        setExampleQueries([
          'Describe the land-cover and major objects visible in this image.',
          'How many cargo vessels and tankers are docked at the wharfs?',
          'Are there any hydrocarbon slick leaks detected near the south pier?'
        ]);
      }
    }
  };

  const loadScenario = async (scenario: DemoScenario, autoRun = false) => {
    setActiveScenarioId(scenario.id);
    setSelectedWorkflow(scenario.mode);
    setSelectedMode(scenario.mode);
    setPrimaryImage(scenario.image1);
    setPrimaryLabel(scenario.image1Label);
    setPrimaryMeta({
      name: scenario.image1Label,
      sizeFormatted: '1.8 MB (Curated)',
      dimensions: '1024 × 1024 px',
      format: 'GeoTIFF (Demonstrative)'
    });
    setSecondaryImage(scenario.image2 || null);
    setSecondaryLabel(scenario.image2Label || '');
    if (scenario.image2) {
      setSecondaryMeta({
        name: scenario.image2Label || 'Paired Scene',
        sizeFormatted: '1.9 MB (Curated)',
        dimensions: '1024 × 1024 px',
        format: scenario.mode === 'optisar' ? 'SAR GeoTIFF' : 'Sentinel-2 GeoTIFF'
      });
    } else {
      setSecondaryMeta(null);
    }
    setQuery(scenario.defaultQuery);
    setExampleQueries([scenario.defaultQuery, ...scenario.alternativeQueries]);
    setErrorMessage(null);

    if (autoRun) {
      setTimeout(() => {
        executeAnalysisWithParams({
          queryText: scenario.defaultQuery,
          img1: scenario.image1,
          label1: scenario.image1Label,
          img2: scenario.image2 || null,
          label2: scenario.image2Label || '',
          mode: scenario.mode
        });
      }, 50);
    }
  };

  // Full reset: returns to clean selection
  const handleReset = () => {
    setSelectedWorkflow(null);
    setSelectedMode('auto');
    setPrimaryImage(null);
    setPrimaryLabel('Primary Satellite Scene');
    setPrimaryMeta(null);
    setSecondaryImage(null);
    setSecondaryLabel('Paired Modality Scene');
    setSecondaryMeta(null);
    setQuery('');
    setActiveScenarioId(undefined);
    setExampleQueries([]);
    setAnalysisResult(null);
    setLiveTrace([]);
    setErrorMessage(null);
    setDemoStep(1);
    setIsDemoModeActive(false);
  };

  const handleResetDemo = () => {
    setDemoStep(1);
    setAnalysisResult(null);
    setLiveTrace([]);
    setErrorMessage(null);
    loadScenario(DEMO_SCENARIOS[0], false);
  };

  const handleToggleDemoMode = () => {
    const next = !isDemoModeActive;
    setIsDemoModeActive(next);
    if (next) {
      setDemoStep(1);
      if (!activeScenarioId) {
        loadScenario(DEMO_SCENARIOS[0], false);
      }
    }
  };

  const isInputReady = () => {
    if (!selectedWorkflow) return false;
    if (!primaryImage) return false;
    if ((selectedWorkflow === 'bitemporal' || selectedWorkflow === 'optisar') && !secondaryImage) {
      return false;
    }
    return true;
  };

  const getDisabledReason = () => {
    if (!selectedWorkflow) return 'Select an analysis workflow above';
    if (!primaryImage) {
      if (selectedWorkflow === 'grounding') return 'Upload reference image to enable query';
      if (selectedWorkflow === 'bitemporal') return 'Upload Observation A to proceed';
      if (selectedWorkflow === 'optisar') return 'Upload optical image to proceed';
      return 'Upload satellite image to enable query';
    }
    if ((selectedWorkflow === 'bitemporal' || selectedWorkflow === 'optisar') && !secondaryImage) {
      if (selectedWorkflow === 'bitemporal') return 'Upload Observation B (Later Date) to proceed';
      return 'Upload SAR radar image to proceed';
    }
    return undefined;
  };

  const executeAnalysisWithParams = async (params: {
    queryText: string;
    img1: string | null;
    label1: string;
    img2: string | null;
    label2: string;
    mode: AnalysisMode;
  }) => {
    if (isExecutingRef.current) return;

    if (!params.img1) {
      setErrorMessage('Please upload a satellite observation image before running analysis.');
      return;
    }

    if ((params.mode === 'bitemporal' || params.mode === 'optisar') && !params.img2) {
      const modeName = params.mode === 'bitemporal' ? 'Bi-temporal Change Analysis' : 'Optical + SAR Fusion';
      setErrorMessage(`${modeName} requires two corresponding observations. Please upload both images.`);
      return;
    }

    if (!params.queryText || params.queryText.trim().length < 2) {
      setErrorMessage('Please enter an observation inquiry or select one of the suggested prompts.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    isExecutingRef.current = true;
    setLiveTrace([]);

    try {
      const result = await agentEngine.runAnalysis({
        query: params.queryText.trim(),
        primaryImage: params.img1,
        primaryLabel: params.label1,
        secondaryImage: params.img2 || undefined,
        secondaryLabel: params.label2 || undefined,
        mode: params.mode,
        onTraceUpdate: steps => {
          setLiveTrace(steps);
        }
      });

      setAnalysisResult(result);
      setHistory(prev => [result, ...prev]);

      if (isDemoModeActive && demoStep === 1) {
        setDemoStep(2);
      }

      setTimeout(() => {
        const resultsEl = document.getElementById('analysis-results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(err.message || 'An error occurred during agentic execution.');
    } finally {
      setIsAnalyzing(false);
      isExecutingRef.current = false;
    }
  };

  const handleLoadSampleRaster = async (isSecondary = false) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/analyze/single?use_sample=true`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to fetch Easy-EO sample from backend');
      const data = await res.json();
      if (isSecondary) {
        setSecondaryImage(data.visualizations.rgb);
        setSecondaryLabel('Sentinel-2 Sample T2 (Easy-EO)');
        setSecondaryMeta({
          name: 'sentinel2_small.tif',
          sizeFormatted: '16.8 MB (Easy-EO)',
          dimensions: `${data.metadata.width} × ${data.metadata.height} px`,
          format: 'GeoTIFF (EPSG:32633)'
        });
      } else {
        setPrimaryImage(data.visualizations.rgb);
        setPrimaryLabel('Sentinel-2 Sample T1 (Easy-EO)');
        setPrimaryMeta({
          name: 'sentinel2_small.tif',
          sizeFormatted: '16.8 MB (Easy-EO)',
          dimensions: `${data.metadata.width} × ${data.metadata.height} px`,
          format: 'GeoTIFF (EPSG:32633)'
        });
      }
    } catch (err: any) {
      console.warn('Backend sample fetch failed:', err);
      setErrorMessage('Could not load sample raster from backend. Ensure Python FastAPI service is running on port 8000.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunAnalysis = () => {
    executeAnalysisWithParams({
      queryText: query,
      img1: primaryImage,
      label1: primaryLabel,
      img2: secondaryImage,
      label2: secondaryLabel,
      mode: selectedWorkflow || selectedMode
    });
  };

  const queryConfig = getQueryConfig();

  return (
    <div className="flex h-screen bg-[#F5F3ED] text-[#202522] overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedMode={selectedWorkflow || selectedMode}
        onModeSelect={mode => {
          handleSelectWorkflow(mode);
          setCurrentView('dashboard');
        }}
        onNewAnalysis={handleReset}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header onReset={handleReset} isAnalyzing={isAnalyzing} />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
          {currentView === 'history' ? (
            <div className="max-w-5xl mx-auto">
              <HistoryView
                history={history}
                onSelectResult={res => {
                  setAnalysisResult(res);
                  setSelectedWorkflow(
                    res.detectedTask.includes('CHANGE')
                      ? 'bitemporal'
                      : res.detectedTask.includes('CROSS')
                      ? 'optisar'
                      : res.detectedTask.includes('GROUNDING')
                      ? 'grounding'
                      : 'vqa'
                  );
                  setPrimaryImage(res.inputImages.primary);
                  setPrimaryLabel(res.inputImages.primaryLabel);
                  setSecondaryImage(res.inputImages.secondary || null);
                  setSecondaryLabel(res.inputImages.secondaryLabel || '');
                  setQuery(res.query);
                  setCurrentView('dashboard');
                }}
                onClearHistory={() => setHistory([])}
                onClose={() => setCurrentView('dashboard')}
              />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* 1. WELCOME SECTION */}
              <div className="space-y-1.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-forest-700 font-sans">
                  SatQuery AI
                </h1>
                <p className="text-lg font-medium text-charcoal font-sans">
                  Ask questions about remote-sensing imagery using natural language.
                </p>
                <p className="text-xs text-charcoal-secondary max-w-2xl font-sans leading-relaxed">
                  Describe, compare, locate, and reason across satellite observations through a single interface.
                </p>
              </div>

              {/* Presentation Demo Mode (When Active) */}
              <PresentationDemoMode
                isActive={isDemoModeActive}
                currentStep={demoStep}
                onStepChange={step => setDemoStep(step)}
                onToggleDemoMode={handleToggleDemoMode}
                onResetDemo={handleResetDemo}
                hasResults={!!analysisResult}
                onRunCurrentDemo={handleRunAnalysis}
              />

              {/* Error Guidance Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-terracotta-50 border border-terracotta-100 text-terracotta-700 text-xs flex items-center justify-between gap-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-terracotta-600" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="text-terracotta-600 hover:text-terracotta-800 text-xs underline font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* 2. CHOOSE AN ANALYSIS (Primary Entry Point) */}
              <WorkflowSelector
                selectedMode={selectedWorkflow}
                onSelectMode={handleSelectWorkflow}
              />

              {/* 3. UPLOAD YOUR OBSERVATION (Appears when workflow is chosen) */}
              {selectedWorkflow ? (
                <div className={isDemoModeActive && demoStep !== 1 ? 'opacity-70 transition-opacity' : ''}>
                  <ImageUploader
                    primaryImage={primaryImage}
                    primaryLabel={primaryLabel}
                    primaryMeta={primaryMeta}
                    secondaryImage={secondaryImage}
                    secondaryLabel={secondaryLabel}
                    secondaryMeta={secondaryMeta}
                    onSetPrimaryImage={(img, label, meta) => {
                      setPrimaryImage(img);
                      if (label) setPrimaryLabel(label);
                      setPrimaryMeta(meta || null);
                      setActiveScenarioId(undefined);
                      setErrorMessage(null);
                    }}
                    onSetSecondaryImage={(img, label, meta) => {
                      setSecondaryImage(img);
                      if (label) setSecondaryLabel(label);
                      setSecondaryMeta(meta || null);
                      setErrorMessage(null);
                    }}
                    mode={selectedWorkflow}
                    isAnalyzing={isAnalyzing}
                    onLoadSample={handleLoadSampleRaster}
                  />
                </div>
              ) : (
                /* Intentional Empty State When No Specialist Chosen */
                <div className="rounded-xl border border-dashed border-[#DDD9CE] p-8 text-center bg-white space-y-2.5 shadow-subtle">
                  <div className="w-10 h-10 rounded-full bg-ivory-200 border border-[#DDD9CE] mx-auto flex items-center justify-center text-charcoal-muted">
                    <Layers className="w-5 h-5 text-forest-700/70" />
                  </div>
                  <h3 className="text-sm font-bold text-charcoal font-sans">
                    No imagery selected
                  </h3>
                  <p className="text-xs text-charcoal-secondary max-w-md mx-auto">
                    Select one of the four specialist workflows above to configure your observation upload interface.
                  </p>
                </div>
              )}

              {/* 4. ASK A QUESTION & 5. ANALYZE (Enabled after required inputs present) */}
              <div className={isDemoModeActive && demoStep !== 1 ? 'opacity-70 transition-opacity' : ''}>
                <QueryInput
                  query={query}
                  onChangeQuery={q => {
                    setQuery(q);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onAnalyze={handleRunAnalysis}
                  isAnalyzing={isAnalyzing}
                  exampleQueries={exampleQueries}
                  label={queryConfig.label}
                  placeholder={queryConfig.placeholder}
                  disabled={!isInputReady()}
                  disabledReason={getDisabledReason()}
                />
              </div>

              {/* Live Scientific Analysis Progress */}
              {isAnalyzing && (
                <div className="p-5 rounded-xl border border-forest-700/30 bg-white shadow-subtle space-y-3">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 text-forest-700 font-semibold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Orchestrating agentic workflow pipeline...</span>
                    </div>
                    <span className="font-mono text-charcoal-secondary">
                      Phase {liveTrace.length} of 7 Active
                    </span>
                  </div>

                  <div className="w-full bg-ivory-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-forest-700 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(14, liveTrace.length * 14.3))}%` }}
                    ></div>
                  </div>

                  <div className="text-[11px] text-charcoal-secondary font-mono flex items-center justify-between">
                    <span>
                      Active: {liveTrace[liveTrace.length - 1]?.title || 'Input preflight check'}
                    </span>
                    <span className="text-charcoal-muted">Observable trace</span>
                  </div>
                </div>
              )}

              {/* 6. RESULT: Answer, Evidence, Confidence, Trace */}
              {analysisResult && !isAnalyzing && (
                <div id="analysis-results-section" className="space-y-6 pt-4 border-t border-[#DDD9CE]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-charcoal font-sans">
                        Analysis Assessment & Evidence
                      </h2>
                      <p className="text-xs text-charcoal-secondary">
                        Synthesized findings and calibrated remote sensing evidence.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-forest-50 text-forest-700 border border-forest-100 font-bold">
                      {analysisResult.detectedTask}
                    </span>
                  </div>

                  {/* Agent Decision Process Visualization */}
                  <div className={isDemoModeActive && demoStep === 2 ? 'ring-2 ring-forest-700 rounded-xl transition-all' : ''}>
                    <AgentDecisionCard
                      decision={analysisResult.agentDecision}
                      confidenceScore={analysisResult.confidenceScore}
                    />
                  </div>

                  {/* Two-Column Grid: Large Visual Evidence & Editorial Answer */}
                  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isDemoModeActive && demoStep === 3 ? 'ring-2 ring-forest-700 p-2 rounded-xl transition-all' : ''}`}>
                    {/* Visual Evidence (7 cols) */}
                    <div className="lg:col-span-7">
                      <VisualEvidence result={analysisResult} />
                    </div>

                    {/* AI Answer & Findings (5 cols) */}
                    <div className="lg:col-span-5">
                      <AnswerCard result={analysisResult} />
                    </div>
                  </div>

                  {/* Observable Scientific Execution Trace */}
                  <div className="pt-2">
                    <ExecutionTrace
                      steps={analysisResult.executionTrace}
                      totalLatencyMs={analysisResult.processingTimeMs}
                    />
                  </div>
                </div>
              )}

              {/* 7. DEMO WORKFLOWS (Curated SIH Scenarios & Presentation Mode) */}
              <DemoWorkflows
                onSelectScenario={loadScenario}
                activeScenarioId={activeScenarioId}
                isAnalyzing={isAnalyzing}
                isDemoModeActive={isDemoModeActive}
                onToggleDemoMode={handleToggleDemoMode}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
