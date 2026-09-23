import {
  AnalysisMode,
  AnalysisResult,
  BoundingBox,
  BiTemporalChange,
  OptiSARMetrics,
  SpatialMetadata,
  SpecialistToolId
} from '../../types';

export interface SpecialistRequest {
  query: string;
  primaryImage: string;
  primaryLabel: string;
  secondaryImage?: string;
  secondaryLabel?: string;
  mode: AnalysisMode;
  metadata?: Partial<SpatialMetadata>;
}

export interface SpecialistOutput {
  toolId: SpecialistToolId;
  toolVersion: string;
  detectedTask: string;
  confidenceScore: number;
  answer: string;
  keyFindings: string[];
  spatialMetadata: SpatialMetadata;
  groundingBoxes?: BoundingBox[];
  changeMetrics?: BiTemporalChange;
  optiSarMetrics?: OptiSARMetrics;
  internalTelemetry?: Record<string, any>;
}

export interface SpecialistTool {
  id: SpecialistToolId;
  name: string;
  version: string;
  purpose: string;
  description: string;
  modelType: string;
  architecture: string;
  latencyAvgMs: number;
  
  canHandle(query: string, hasSecondaryImage: boolean, manualMode?: AnalysisMode): boolean;
  execute(request: SpecialistRequest): Promise<SpecialistOutput>;
}
