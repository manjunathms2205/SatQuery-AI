import { AnalysisResult } from '../types';

export function generateMarkdownReport(result: AnalysisResult): string {
  const timestamp = new Date(result.timestamp).toUTCString();
  
  let report = `# SATQUERY AI — GEOSPATIAL INTELLIGENCE REPORT
**Generated:** ${timestamp}
**Report Reference:** SQ-INTEL-${result.id.toUpperCase()}
**Security Classification:** DEMO PROTOTYPE (SIH 2026)
**Notice:** Prototype Mode — Specialist outputs are demonstrative; production models are pluggable.

---

## 1. AGENT MISSION OVERVIEW
- **System:** SatQuery AI (SIH 2026 Hackathon Prototype)
- **User Query:** "${result.query}"
- **Detected Task:** ${result.detectedTask}
- **Selected Specialist:** ${result.selectedTool} (${result.toolVersion})
- **Routing Reason:** "${result.agentDecision.routingReason}"
- **Analytical Confidence:** ${result.confidenceScore.toFixed(1)}%
- **End-to-End Processing Time:** ${result.processingTimeMs} ms

---

## 2. INPUT & SENSOR TELEMETRY
- **Input Information:** ${result.agentDecision.inputSummary}
- **Input Validation Status:** ${result.agentDecision.inputValidationStatus}
- **Primary Sensor Platform:** ${result.spatialMetadata.sensor}
- **Ground Sampling Distance (Spatial Resolution):** ${result.spatialMetadata.resolutionGsd}
- **Spectral / Radiometric Bands:** ${result.spatialMetadata.bands}
- **Geographic Coordinates:** ${result.spatialMetadata.coordinates}
- **Acquisition Timestamp:** ${result.spatialMetadata.acquisitionDate}
${result.spatialMetadata.sunElevation ? `- **Sun Elevation Angle:** ${result.spatialMetadata.sunElevation}` : ''}
${result.spatialMetadata.mgrsTile ? `- **MGRS Tile Identifier:** ${result.spatialMetadata.mgrsTile}` : ''}

---

## 3. ARTIFICIAL INTELLIGENCE ASSESSMENT (ANSWER)
${result.answer}

---

## 4. KEY QUANTITATIVE FINDINGS
${result.keyFindings.map(finding => `- ${finding}`).join('\n')}

---

## 5. EVIDENCE SUMMARY
- **Required Evidence:** ${result.agentDecision.requiredEvidence}
- **Evidence Produced:** ${result.agentDecision.evidenceProduced}
`;

  if (result.groundingBoxes && result.groundingBoxes.length > 0) {
    report += `
### Localized Target Bounding Boxes:
| ID | Target Classification | Confidence | Bounding Box [ymin, xmin, ymax, xmax] |
|---|---|---|---|
${result.groundingBoxes.map(b => `| ${b.id} | ${b.label} | ${(b.confidence * 100).toFixed(1)}% | [${b.box2d.map(v => v.toFixed(1)).join(', ')}] |`).join('\n')}
`;
  }

  if (result.changeMetrics) {
    report += `
### Bi-Temporal Change Quantification:
- **Phenomenon Classification:** ${result.changeMetrics.changeType}
- **Total Altered Surface Area:** ${result.changeMetrics.areaKm2} km² (+${result.changeMetrics.changePercentage}% of target scene)
- **Baseline State (T1):** ${result.changeMetrics.preClass}
- **Post-Event State (T2):** ${result.changeMetrics.postClass}
- **Hazard Severity Rating:** ${result.changeMetrics.severity.toUpperCase()}

#### Land-Cover Alteration Breakdown:
${result.changeMetrics.breakdown.map(b => `- **${b.category}:** ${b.areaHa} ha (${b.pct}%)`).join('\n')}
`;
  }

  if (result.optiSarMetrics) {
    report += `
### Cross-Modal Optical + SAR Fusion Metrics:
- **Optical Cloud Occlusion:** ${result.optiSarMetrics.opticalCloudOcclusionPercent}%
- **Radar Cloud Penetration Gain:** ${result.optiSarMetrics.sarPenetrationGainPercent}%
- **SAR Polarization Mode:** ${result.optiSarMetrics.polarization}
- **Surface Roughness Index:** ${result.optiSarMetrics.surfaceRoughnessIndex}
- **Dielectric Moisture Saturation:** ${result.optiSarMetrics.dielectricMoistureIndex}
- **Cross-Modal Concordance:** ${result.optiSarMetrics.crossModalConcordance}%
`;
  }

  report += `---

## 6. OBSERVABLE AGENTIC EXECUTION TRACE
${result.executionTrace.map((step, idx) => `
### Step ${idx + 1}: ${step.title} (${step.durationMs}ms)
- **Phase:** ${step.phase.toUpperCase()} | **Status:** ${step.status.toUpperCase()}
- **Description:** ${step.description}
`).join('')}

---

## 7. PROTOTYPE TRANSPARENCY DISCLAIMER
*Prototype Mode — Specialist outputs are demonstrative; production models are pluggable. Built for Smart India Hackathon (SIH 2026).*
`;

  return report;
}

export function downloadReportFile(result: AnalysisResult) {
  const content = generateMarkdownReport(result);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SatQuery_Report_${result.selectedTool}_${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
