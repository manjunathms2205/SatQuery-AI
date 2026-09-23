import { SpecialistTool, SpecialistRequest, SpecialistOutput } from './base';
import { BoundingBox } from '../../types';

export class SceneGrounderSpecialist implements SpecialistTool {
  id = 'SceneGrounder' as const;
  name = 'SceneGrounder';
  version = 'v3.1.0-alpha';
  purpose = 'Text-guided region grounding';
  description = 'Open-vocabulary geospatial referring expression grounding model that localizes fine-grained terrain structures, utility arrays, and industrial equipment from free-form natural language queries.';
  modelType = 'Grounding-DINO-Geo + Swin Backbone';
  architecture = 'Deformable Transformer Cross-Attention with Spatial Coordinate Decoding';
  latencyAvgMs = 420;

  canHandle(query: string, hasSecondaryImage: boolean, manualMode?: string): boolean {
    if (manualMode === 'grounding') return true;
    if (manualMode && manualMode !== 'auto') return false;

    if (hasSecondaryImage) return false;

    const q = query.toLowerCase();
    return (
      q.includes('highlight') ||
      q.includes('locate') ||
      q.includes('ground') ||
      q.includes('bounding box') ||
      q.includes('find all') ||
      q.includes('pinpoint') ||
      q.includes('where is') ||
      q.includes('solar') ||
      q.includes('energy infrastructure') ||
      q.includes('substation') ||
      q.includes('transformer')
    );
  }

  async execute(request: SpecialistRequest): Promise<SpecialistOutput> {
    const boxes: BoundingBox[] = [
      {
        id: 'box-pv-nw',
        label: 'Photovoltaic Array String (NW Cluster)',
        confidence: 0.98,
        box2d: [6.6, 7.5, 21.6, 42.5],
        color: '#173F35',
        attributes: { capacity: '12.5 MWp', stringRows: 14, tiltAngle: '22°' }
      },
      {
        id: 'box-pv-ne',
        label: 'Photovoltaic Array String (NE Cluster)',
        confidence: 0.97,
        box2d: [6.6, 57.5, 21.6, 92.5],
        color: '#173F35',
        attributes: { capacity: '12.5 MWp', stringRows: 14, tiltAngle: '22°' }
      },
      {
        id: 'box-pv-mw',
        label: 'Photovoltaic Array String (Mid-West)',
        confidence: 0.99,
        box2d: [31.6, 7.5, 46.6, 42.5],
        color: '#173F35',
        attributes: { capacity: '12.5 MWp', stringRows: 14, tiltAngle: '22°' }
      },
      {
        id: 'box-pv-me',
        label: 'Photovoltaic Array String (Mid-East)',
        confidence: 0.98,
        box2d: [31.6, 57.5, 46.6, 92.5],
        color: '#173F35',
        attributes: { capacity: '12.5 MWp', stringRows: 14, tiltAngle: '22°' }
      },
      {
        id: 'box-pv-sw',
        label: 'Photovoltaic Array String (SW Cluster)',
        confidence: 0.96,
        box2d: [56.6, 7.5, 71.6, 42.5],
        color: '#173F35',
        attributes: { capacity: '12.5 MWp', stringRows: 14, tiltAngle: '22°' }
      },
      {
        id: 'box-pv-se',
        label: 'Photovoltaic Array String (SE Cluster)',
        confidence: 0.97,
        box2d: [56.6, 57.5, 71.6, 92.5],
        color: '#173F35',
        attributes: { capacity: '12.5 MWp', stringRows: 14, tiltAngle: '22°' }
      },
      {
        id: 'box-substation',
        label: 'Central Step-Up Substation & 230kV Transformer Yard',
        confidence: 0.99,
        box2d: [38.3, 41.2, 61.6, 58.7],
        color: '#C66B4A',
        attributes: { voltage: '34.5kV / 230kV', rating: '100 MVA', units: '3 Step-Up Transformers' }
      },
      {
        id: 'box-bess',
        label: 'Battery Energy Storage System (BESS-01 & BESS-02)',
        confidence: 0.95,
        box2d: [79.0, 42.0, 95.0, 56.5],
        color: '#C69A52',
        attributes: { totalEnergy: '20 MWh', batteryType: 'LiFePO4 Containers' }
      }
    ];

    const answer = `Visual grounding successfully pinpointed and highlighted 8 major clean-energy infrastructure entities based on query "${request.query}". Six utility-scale photovoltaic string blocks (total capacity: ~75 MWp) were localized with sub-meter spatial precision, alongside one central 100 MVA step-up substation transformer yard and a 20 MWh utility-scale Battery Energy Storage System (BESS). Mean detection confidence reached 97.4%, with normalized 2D bounding boxes and physical coordinates registered to the scene grid.`;

    const keyFindings = [
      'Grounded Entities: 8 infrastructure targets localized with calibrated bounding box polygons',
      'Solar Array Footprint: 6 distinct photovoltaic blocks totaling ~75 MWp generating footprint',
      'Central Substation: 100 MVA 34.5kV/230kV step-up transformer yard centered at [38.3%, 41.2% - 61.6%, 58.7%]',
      'Energy Storage: 2 BESS container units (20 MWh aggregate capacity) anchored at southern perimeter',
      'Spatial Alignment: 180° true-south panel tilt alignment with zero visible array skew'
    ];

    return {
      toolId: this.id,
      toolVersion: this.version,
      detectedTask: 'TEXT-GUIDED GROUNDING',
      confidenceScore: 97.4,
      answer,
      keyFindings,
      spatialMetadata: {
        sensor: 'High-Resolution Aerial Orthophoto (Demonstrative)',
        resolutionGsd: '0.15m GSD',
        bands: 'RGB 3-Band Pan-Sharpened',
        coordinates: '35.2144°N, 115.8921°W',
        acquisitionDate: '2026-05-18 14:10:00 UTC',
        sunElevation: '68.5°',
        mgrsTile: '11SMA842991',
        isDemonstrative: true
      },
      groundingBoxes: boxes,
      internalTelemetry: {
        queryEmbeddingDim: 768,
        proposalBoxesEvaluated: 300,
        nmsIoUThreshold: 0.45,
        decoderLayers: 6
      }
    };
  }
}
