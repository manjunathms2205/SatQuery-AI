import { SpecialistTool, SpecialistRequest, SpecialistOutput } from './base';

export class RSVqaSpecialist implements SpecialistTool {
  id = 'RS-VQA' as const;
  name = 'RS-VQA';
  version = 'v2.4.1-rc';
  purpose = 'Remote-sensing visual question answering';
  description = 'Multimodal geospatial foundation model aligned for high-resolution earth observation imagery, capable of land-cover assessment, spatial counting, and infrastructure classification.';
  modelType = 'Vision-Language Geospatial Foundation Model';
  architecture = 'EVA-02-CLIP Visual Encoder + Cross-Attention Geospatial Reasoning Head';
  latencyAvgMs = 380;

  canHandle(query: string, hasSecondaryImage: boolean, manualMode?: string): boolean {
    if (manualMode === 'vqa') return true;
    if (manualMode && manualMode !== 'auto') return false;
    
    if (hasSecondaryImage) return false;

    const q = query.toLowerCase();
    const isGrounding = q.includes('locate') || q.includes('highlight') || q.includes('ground') || q.includes('bounding box');
    if (isGrounding) return false;

    return (
      q.includes('describe') ||
      q.includes('land-cover') ||
      q.includes('land cover') ||
      q.includes('major objects') ||
      q.includes('how many') ||
      q.includes('what') ||
      q.includes('is there') ||
      q.includes('are there') ||
      q.includes('vessel') ||
      q.includes('ship') ||
      q.includes('oil') ||
      q.includes('infrastructure')
    );
  }

  async execute(request: SpecialistRequest): Promise<SpecialistOutput> {
    const q = request.query.toLowerCase();
    let answer = '';
    let keyFindings: string[] = [];
    let confidence = 95.8;

    if (q.includes('describe') || q.includes('land-cover') || q.includes('land cover') || q.includes('major objects') || q.includes('objects visible')) {
      answer = 'Visual land-cover analysis categorizes the scene as an industrial maritime port terminal comprising 4 primary zones: deep-water navigation harbor basin (44% surface area), fortified concrete quay bulkheads (28%), containerized logistics stack yards (18%), and a dedicated liquid bulk petroleum wharf (10%). Major identified objects include 3 large commercial vessels (one 360m Ultra Large Container Vessel berthed north, one 240m crude petroleum tanker berthed south, and one 190m bulk carrier maneuvering mid-channel), 2 auxiliary tugboats, 2 rail-mounted container gantry cranes, organized container stack blocks (~1,850 TEU footprint), and 2 cylindrical petroleum storage tanks.';
      keyFindings = [
        'Primary Land-Cover: Industrial Port Terminal (44% deep water, 28% concrete wharfs, 18% container yard, 10% petroleum terminal)',
        'Active Commercial Vessels: 3 large vessels (1 ULCV Container Ship, 1 Petroleum Tanker, 1 Bulk Carrier) + 2 escort tugboats',
        'Quay Infrastructure: 2 Rail-Mounted Gantry (RMG) container handling cranes with ~65m boom outreach',
        'Storage Footprint: Multi-tier container storage blocks (~1,850 TEU visible) and 2 bulk petroleum storage tanks',
        'Navigation Fairway: Channel maintains clear deep-water passage with zero surface obstruction'
      ];
      confidence = 96.4;
    } else if (q.includes('oil') || q.includes('leak') || q.includes('slick') || q.includes('spill')) {
      answer = 'Spectral reflectance analysis across VNIR bands indicates NO continuous hydrocarbon slick or severe oil discharge in the waters surrounding the liquid bulk tanker berth. Surface spectral contrast reveals slight propeller turbulence near the maneuvering vessels, but no characteristic spectral absorption dips indicative of crude or fuel oil sheen.';
      keyFindings = [
        'Hydrocarbon Detection: Negative (Hydrocarbon Absorption Index below 0.04 detection threshold)',
        'Water Surface Quality: Normal harbor reflectance, minor suspended sediment near prop wakes',
        'Containment Status: Secondary perimeter containment boom observed at southern liquid berth',
        'Environmental Risk: Low / Nominal operating conditions'
      ];
      confidence = 94.8;
    } else {
      answer = 'High-resolution optical remote-sensing analysis confirms an active maritime logistics facility with concrete quays, 3 commercial vessels berthed or transiting, 2 container gantry cranes, and intermodal storage facilities operating under clear visibility conditions.';
      keyFindings = [
        'Scene Classification: Industrial Intermodal Maritime Port',
        'Vessel Count: 3 commercial vessels + 2 harbor tugs',
        'Handling Assets: 2 Rail-Mounted Gantry cranes operational',
        'Visibility: Nominal atmospheric clarity, sub-meter spatial feature resolution'
      ];
      confidence = 95.2;
    }

    return {
      toolId: this.id,
      toolVersion: this.version,
      detectedTask: 'SINGLE-IMAGE VQA',
      confidenceScore: confidence,
      answer,
      keyFindings,
      spatialMetadata: {
        sensor: 'WorldView-3 Optical VNIR (Demonstrative)',
        resolutionGsd: '0.31m Pan-Sharpened',
        bands: 'B1-B8 VNIR Multi-Spectral',
        coordinates: '51.9542°N, 4.1287°E',
        acquisitionDate: '2026-06-14 10:42:15 UTC',
        sunElevation: '54.2°',
        mgrsTile: '31UET824519',
        isDemonstrative: true
      },
      internalTelemetry: {
        tokensEvaluated: 412,
        visionTokens: 1024,
        spatialAttentionHeads: 16,
        inferenceEngine: 'TensorRT-LLM / vLLM-Geo'
      }
    };
  }
}
