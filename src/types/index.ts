export type AnalysisMode = 'auto' | 'vqa' | 'grounding' | 'bitemporal' | 'optisar';

export interface UploadedFileMeta {
  name: string;
  sizeFormatted: string;
  dimensions?: string;
  format: string;
}

export type SpecialistToolId = 'RS-VQA' | 'SceneGrounder' | 'ChangeSense' | 'OptiSAR-Fuse';

export interface SpecialistInfo {
  id: SpecialistToolId;
  name: string;
  version: string;
  purpose: string;
  description: string;
  status: 'online' | 'busy' | 'offline';
  modelType: string;
  architecture: string;
  latencyAvgMs: number;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in percentages (0 to 100)
  color?: string;
  attributes?: Record<string, string | number>;
}

export interface BiTemporalChange {
  changeType: string;
  areaKm2: number;
  changePercentage: number;
  preClass: string;
  postClass: string;
  confidence: number;
  severity: 'critical' | 'moderate' | 'low';
  breakdown: Array<{
    category: string;
    areaHa: number;
    pct: number;
    color: string;
  }>;
}

export interface OptiSARMetrics {
  opticalCloudOcclusionPercent: number;
  sarPenetrationGainPercent: number;
  polarization: 'VV' | 'VH' | 'Dual VV+VH';
  surfaceRoughnessIndex: number;
  dielectricMoistureIndex: number;
  crossModalConcordance: number;
  waterDetectionConfidence: number;
}

export type TracePhase =
  | 'query'
  | 'preflight'
  | 'classify'
  | 'route'
  | 'easyeo_preprocess'
  | 'raster_alignment'
  | 'feature_extract'
  | 'execute'
  | 'synthesize'
  | 'answer';

export interface VisualLayers {
  rgb?: string;
  falseColor?: string;
  ndvi?: string;
  ndwi?: string;
  changeMap?: string;
  overlay?: string;
  sar?: string;
  blended?: string;
}

export interface RasterEvidence {
  isRealRaster: boolean;
  rasterSource: string;
  crs: string;
  resolutionM: number;
  dimensions: string;
  footprintKm2: number;
  indices?: {
    ndvi?: { mean: number; min: number; max: number; std?: number; vegetation_area_km2?: number; vegetation_pct?: number };
    ndwi?: { mean: number; min: number; max: number; std?: number; water_area_km2?: number; water_pct?: number };
    ndbi?: { mean?: number; min?: number; max?: number; status: string };
  };
  changeMetrics?: {
    changed_area_km2: number;
    changed_percentage: number;
    number_of_change_regions: number;
    largest_change_region_ha: number;
    mean_change_magnitude?: number;
    delta_ndvi?: any;
    delta_ndwi?: any;
    delta_ndbi?: string;
  };
  modalityEvidence?: Array<{
    feature: string;
    primary_modality: string;
    reasoning: string;
  }>;
  visualLayers: VisualLayers;
  geojson?: any;
}

export interface ExecutionTraceStep {
  id: string;
  phase: TracePhase;
  title: string;
  description: string;
  durationMs: number;
  status: 'completed' | 'processing' | 'skipped' | 'failed';
  details?: Record<string, any>;
}

export interface SpatialMetadata {
  sensor: string;
  resolutionGsd: string;
  bands: string;
  coordinates: string;
  acquisitionDate: string;
  sunElevation?: string;
  mgrsTile?: string;
  isDemonstrative?: boolean;
}

export interface AgentDecision {
  inputSummary: string;
  inputValidationStatus: string;
  queryType: string;
  detectedTask: string;
  selectedTool: SpecialistToolId;
  routingReason: string;
  requiredEvidence: string;
  evidenceProduced: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  query: string;
  detectedTask: string;
  selectedTool: SpecialistToolId;
  toolVersion: string;
  confidenceScore: number; // 0 - 100
  processingTimeMs: number;
  answer: string;
  keyFindings: string[];
  spatialMetadata: SpatialMetadata;
  groundingBoxes?: BoundingBox[];
  changeMetrics?: BiTemporalChange;
  optiSarMetrics?: OptiSARMetrics;
  executionTrace: ExecutionTraceStep[];
  agentDecision: AgentDecision;
  prototypeTransparencyNotice: string;
  rasterEvidence?: RasterEvidence;
  isRealRaster?: boolean;
  inputImages: {
    primary: string;
    primaryLabel: string;
    secondary?: string;
    secondaryLabel?: string;
  };
}

export interface DemoScenario {
  id: string;
  name: string;
  badge: string;
  category: 'Single Image VQA' | 'Text-Guided Grounding' | 'Bi-temporal Change' | 'Optical + SAR Fusion';
  mode: AnalysisMode;
  targetTool: SpecialistToolId;
  detectedTask: string;
  image1: string;
  image1Label: string;
  image2?: string;
  image2Label?: string;
  defaultQuery: string;
  alternativeQueries: string[];
  description: string;
  sensor: string;
  location: string;
  coordinates: string;
}
