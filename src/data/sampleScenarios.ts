import { DemoScenario } from '../types';
import {
  SATELLITE_PORT_OPTICAL,
  SATELLITE_SOLAR_GROUNDING,
  SATELLITE_VALENCIA_PRE,
  SATELLITE_VALENCIA_POST,
  SATELLITE_AMAZON_OPTICAL,
  SATELLITE_AMAZON_SAR
} from './satelliteImages';

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-vqa-port',
    name: 'Port & Industrial Maritime Area',
    badge: 'Single-Image VQA',
    category: 'Single Image VQA',
    mode: 'vqa',
    targetTool: 'RS-VQA',
    detectedTask: 'SINGLE-IMAGE VQA',
    image1: SATELLITE_PORT_OPTICAL,
    image1Label: 'Optical High-Res (WV-3 0.31m GSD)',
    defaultQuery: 'Describe the land-cover and major objects visible in this image.',
    alternativeQueries: [
      'How many cargo vessels and tankers are docked at the wharfs, and what is the berthing density?',
      'Are there any hydrocarbon slick leaks detected near the oil tanker at the south pier?',
      'What type of cargo handling infrastructure and gantry cranes are installed along the north quay?'
    ],
    description: 'Single-image remote-sensing visual question answering assessing land-cover, berths, cargo vessels, and handling infrastructure.',
    sensor: 'WorldView-3 Optical VNIR (Demonstrative)',
    location: 'Maasvlakte Harbor, Port of Rotterdam, Netherlands',
    coordinates: '51.9542°N, 4.1287°E'
  },
  {
    id: 'scenario-grounding-solar',
    name: 'Solar & Clean Energy Infrastructure',
    badge: 'Text-Guided Grounding',
    category: 'Text-Guided Grounding',
    mode: 'grounding',
    targetTool: 'SceneGrounder',
    detectedTask: 'TEXT-GUIDED GROUNDING',
    image1: SATELLITE_SOLAR_GROUNDING,
    image1Label: 'Aerial Orthomosaic (0.15m GSD)',
    defaultQuery: 'Highlight the solar arrays and major energy infrastructure.',
    alternativeQueries: [
      'Ground the Battery Energy Storage System (BESS) container enclosures at the southern perimeter.',
      'Highlight the SCADA central control room and the 3 high-voltage step-up transformers.',
      'Identify all distributed inverter sheds stationed along the internal service tracks.'
    ],
    description: 'Text-guided region grounding pinpointing photovoltaic solar arrays, central substation transformers, and BESS enclosures with calibrated bounding boxes.',
    sensor: 'High-Resolution Aerial Orthophoto (Demonstrative)',
    location: 'Mojave Clean Energy Complex, California, USA',
    coordinates: '35.2144°N, 115.8921°W'
  },
  {
    id: 'scenario-bitemporal-flood',
    name: 'Flood Disaster Bi-Temporal Comparison',
    badge: 'Bi-Temporal Change',
    category: 'Bi-temporal Change',
    mode: 'bitemporal',
    targetTool: 'ChangeSense',
    detectedTask: 'BI-TEMPORAL CHANGE ANALYSIS',
    image1: SATELLITE_VALENCIA_PRE,
    image1Label: 'T1: Oct 24 (Pre-Flood Normal)',
    image2: SATELLITE_VALENCIA_POST,
    image2Label: 'T2: Oct 30 (Post-Flood DANA)',
    defaultQuery: 'What changed between these two dates, and where did the change occur?',
    alternativeQueries: [
      'Detect inundated floodplains and quantify infrastructure damage between Oct 24 and Oct 30.',
      'Quantify total submerged residential surface area and breached transportation arteries.',
      'Identify structural washouts along the primary highway corridor and bridges.'
    ],
    description: 'Bi-temporal differential analysis tracking catastrophic flood impact, water expansion, and critical transportation corridor washouts between T1 and T2.',
    sensor: 'Copernicus Sentinel-2 MSI (Demonstrative)',
    location: 'Turia River Basin / Paiporta, Valencia, Spain',
    coordinates: '39.4211°N, 0.4184°W'
  },
  {
    id: 'scenario-optisar-environmental',
    name: 'Cloud-Covered Environmental Region',
    badge: 'Optical + SAR Fusion',
    category: 'Optical + SAR Fusion',
    mode: 'optisar',
    targetTool: 'OptiSAR-Fuse',
    detectedTask: 'CROSS-MODAL ANALYSIS',
    image1: SATELLITE_AMAZON_OPTICAL,
    image1Label: 'Sentinel-2 Optical (58% Cloud Cover)',
    image2: SATELLITE_AMAZON_SAR,
    image2Label: 'Sentinel-1 C-Band SAR (VV+VH Backscatter)',
    defaultQuery: 'Use the optical and SAR images together to identify built-up and water-covered regions.',
    alternativeQueries: [
      'Penetrate dense cloud cover using SAR backscatter to detect illegal deforestation corridors and water boundaries.',
      'Fuse optical reflectance with radar polarimetry to assess soil moisture saturation and canopy volume.',
      'Detect hidden logging roads obscured under 58% cloud cover on the south river bank.'
    ],
    description: 'Cross-modal interpretation combining optical RGB with microwave SAR backscatter to identify water bodies and built-up clearings through heavy cloud occlusion.',
    sensor: 'Sentinel-2 MSI Optical + Sentinel-1 C-Band SAR (Demonstrative)',
    location: 'Rondônia State, Amazon Basin, Brazil',
    coordinates: '10.8256°S, 62.5482°W'
  }
];
