import { SpecialistTool, SpecialistRequest, SpecialistOutput } from './base';
import { BiTemporalChange } from '../../types';

export class ChangeSenseSpecialist implements SpecialistTool {
  id = 'ChangeSense' as const;
  name = 'ChangeSense';
  version = 'v2.1.4-prod';
  purpose = 'Bi-temporal change detection and change description';
  description = 'Siamese temporal attention network trained on multi-epoch satellite pairs to isolate severe morphological alterations, disaster inundation, deforestation, and structural collapse.';
  modelType = 'Siamese Temporal Swin-Unet + Change Vector Analysis (CVA)';
  architecture = 'Dual-Encoder Feature Differencing with Cross-Temporal Attention Fusion';
  latencyAvgMs = 490;

  canHandle(query: string, hasSecondaryImage: boolean, manualMode?: string): boolean {
    if (manualMode === 'bitemporal') return true;
    if (manualMode && manualMode !== 'auto') return false;

    if (hasSecondaryImage && manualMode !== 'optisar') {
      const q = query.toLowerCase();
      if (!q.includes('sar') && !q.includes('radar')) {
        return true;
      }
    }

    const q = query.toLowerCase();
    return (
      q.includes('change') ||
      q.includes('between') ||
      q.includes('flood') ||
      q.includes('damage') ||
      q.includes('where did the change occur') ||
      q.includes('before and after') ||
      q.includes('two dates') ||
      q.includes('oct 24') ||
      q.includes('oct 30')
    );
  }

  async execute(request: SpecialistRequest): Promise<SpecialistOutput> {
    const changeMetrics: BiTemporalChange = {
      changeType: 'Catastrophic Flash Flood & Infrastructure Inundation (DANA Event)',
      areaKm2: 18.42,
      changePercentage: 34.6,
      preClass: 'Vegetated Arable Farmland & Residential Grid (Oct 24)',
      postClass: 'Inundated Mudflow & Sediment-Deposited Floodplain (Oct 30)',
      confidence: 98.2,
      severity: 'critical',
      breakdown: [
        {
          category: 'Flooded Agricultural Farmland',
          areaHa: 920,
          pct: 49.9,
          color: '#3B82F6'
        },
        {
          category: 'Submerged Residential Grid (Paiporta / Sedaví)',
          areaHa: 680,
          pct: 36.9,
          color: '#EF4444'
        },
        {
          category: 'Eroded Riverbed & Mud Sedimentation',
          areaHa: 242,
          pct: 13.2,
          color: '#F59E0B'
        }
      ]
    };

    const answer = `Between acquisition date T1 (Oct 24) and acquisition date T2 (Oct 30), a catastrophic flash flood occurred that inundated 18.42 km² (+34.6% of the target scene). The change occurred along two primary axes: (1) The Turia / Rambla del Poyo ravine corridor widened by up to 480% (from 32m to 195m peak surge width), overflowing its embankments and inundating 680 hectares of the eastern Paiporta and Sedaví residential street grid under turbid sediment-laden water; and (2) The central east-west highway arterial (CV-36) suffered severe hydraulic scour and structural washout across a 1.8km segment between chainage km 14.2 and km 16.0, severing bridge crossings and transport access.`;

    const keyFindings = [
      'What Changed: 18.42 km² (1,842 hectares) converted from dry terrain into active or residual standing floodwaters',
      'Where Change Occurred: Turia River/Rambla del Poyo drainage basin extending east into residential Paiporta',
      'Transportation Washout: 1.8km span of Highway CV-36 breached with 2 bridge approaches submerged',
      'Urban Inundation: 680 hectares of residential fabric submerged under muddy floodwaters',
      'Severity Level: CRITICAL (NDWI shift > +0.72 confirming severe hydraulic inundation)'
    ];

    return {
      toolId: this.id,
      toolVersion: this.version,
      detectedTask: 'BI-TEMPORAL CHANGE ANALYSIS',
      confidenceScore: 98.2,
      answer,
      keyFindings,
      spatialMetadata: {
        sensor: 'Copernicus Sentinel-2 MSI (Demonstrative)',
        resolutionGsd: '10.0m GSD',
        bands: 'B2, B3, B4, B8 (NIR) & B11 (SWIR)',
        coordinates: '39.4211°N, 0.4184°W',
        acquisitionDate: 'T1: 2024-10-24 10:50 UTC | T2: 2024-10-30 10:55 UTC',
        sunElevation: '41.8°',
        mgrsTile: '30SYJ1665',
        isDemonstrative: true
      },
      changeMetrics,
      internalTelemetry: {
        registeredTiePoints: 1420,
        rmseCoregistrationPixels: 0.18,
        differencingMetric: 'Normalized Difference Water Index (NDWI) + Siamese Differencing',
        cloudShadowMaskApplied: true
      }
    };
  }
}
