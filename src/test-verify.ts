import { agentEngine } from './services/agentEngine';
import { DEMO_SCENARIOS } from './data/sampleScenarios';
import { generateMarkdownReport } from './utils/reportExporter';

async function runAllVerificationTests() {
  console.log('====================================================');
  console.log('🛰️  SATQUERY AI — FINAL VERIFICATION SUITE (SIH 2026)');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 5;

  // Test 1: SINGLE-IMAGE VQA (Port & Industrial Maritime Area)
  console.log('TEST 1: Testing SINGLE-IMAGE VQA (Port / industrial area)...');
  const vqaScenario = DEMO_SCENARIOS.find(s => s.id === 'scenario-vqa-port')!;
  const vqaResult = await agentEngine.runAnalysis({
    query: vqaScenario.defaultQuery,
    primaryImage: vqaScenario.image1,
    primaryLabel: vqaScenario.image1Label,
    mode: 'auto'
  });

  const vqaPassed =
    vqaResult.selectedTool === 'RS-VQA' &&
    vqaResult.detectedTask === 'SINGLE-IMAGE VQA' &&
    vqaResult.confidenceScore > 90 &&
    vqaResult.agentDecision.selectedTool === 'RS-VQA' &&
    vqaResult.agentDecision.routingReason.length > 0 &&
    vqaResult.executionTrace.length === 7;

  if (vqaPassed) {
    console.log(`✅ TEST 1 PASSED: Single-Image VQA routed to RS-VQA (Task: ${vqaResult.detectedTask}), Confidence: ${vqaResult.confidenceScore}%, Latency: ${vqaResult.processingTimeMs}ms`);
    passedTests++;
  } else {
    console.error('❌ TEST 1 FAILED', vqaResult);
  }

  // Test 2: TEXT-GUIDED GROUNDING (Solar & Energy Infrastructure)
  console.log('\nTEST 2: Testing TEXT-GUIDED GROUNDING (Solar / clean energy complex)...');
  const groundScenario = DEMO_SCENARIOS.find(s => s.id === 'scenario-grounding-solar')!;
  const groundResult = await agentEngine.runAnalysis({
    query: groundScenario.defaultQuery,
    primaryImage: groundScenario.image1,
    primaryLabel: groundScenario.image1Label,
    mode: 'auto'
  });

  const groundPassed =
    groundResult.selectedTool === 'SceneGrounder' &&
    groundResult.detectedTask === 'TEXT-GUIDED GROUNDING' &&
    groundResult.groundingBoxes &&
    groundResult.groundingBoxes.length > 0 &&
    groundResult.agentDecision.requiredEvidence.includes('bounding boxes');

  if (groundPassed) {
    console.log(`✅ TEST 2 PASSED: Text-Guided Grounding routed to SceneGrounder with ${groundResult.groundingBoxes?.length} calibrated boxes, Confidence: ${groundResult.confidenceScore}%`);
    passedTests++;
  } else {
    console.error('❌ TEST 2 FAILED', groundResult);
  }

  // Test 3: BI-TEMPORAL CHANGE ANALYSIS (Flood Disaster Pre/Post)
  console.log('\nTEST 3: Testing BI-TEMPORAL CHANGE ANALYSIS (Flood disaster before/after)...');
  const changeScenario = DEMO_SCENARIOS.find(s => s.id === 'scenario-bitemporal-flood')!;
  const changeResult = await agentEngine.runAnalysis({
    query: changeScenario.defaultQuery,
    primaryImage: changeScenario.image1,
    primaryLabel: changeScenario.image1Label,
    secondaryImage: changeScenario.image2,
    secondaryLabel: changeScenario.image2Label,
    mode: 'auto'
  });

  const changePassed =
    changeResult.selectedTool === 'ChangeSense' &&
    changeResult.detectedTask === 'BI-TEMPORAL CHANGE ANALYSIS' &&
    changeResult.changeMetrics &&
    changeResult.changeMetrics.areaKm2 > 0 &&
    changeResult.agentDecision.routingReason.includes('Two spatially corresponding observations');

  if (changePassed) {
    console.log(`✅ TEST 3 PASSED: Bi-temporal routed to ChangeSense. Area altered: ${changeResult.changeMetrics?.areaKm2} km² (+${changeResult.changeMetrics?.changePercentage}%), Severity: ${changeResult.changeMetrics?.severity}`);
    passedTests++;
  } else {
    console.error('❌ TEST 3 FAILED', changeResult);
  }

  // Test 4: CROSS-MODAL ANALYSIS (Cloud-Covered Environmental Region)
  console.log('\nTEST 4: Testing CROSS-MODAL ANALYSIS (Optical + SAR microwave fusion)...');
  const sarScenario = DEMO_SCENARIOS.find(s => s.id === 'scenario-optisar-environmental')!;
  const sarResult = await agentEngine.runAnalysis({
    query: sarScenario.defaultQuery,
    primaryImage: sarScenario.image1,
    primaryLabel: sarScenario.image1Label,
    secondaryImage: sarScenario.image2,
    secondaryLabel: sarScenario.image2Label,
    mode: 'auto'
  });

  const sarPassed =
    sarResult.selectedTool === 'OptiSAR-Fuse' &&
    sarResult.detectedTask === 'CROSS-MODAL ANALYSIS' &&
    sarResult.optiSarMetrics &&
    sarResult.optiSarMetrics.sarPenetrationGainPercent > 90;

  if (sarPassed) {
    console.log(`✅ TEST 4 PASSED: Cross-Modal routed to OptiSAR-Fuse. Penetration gain: +${sarResult.optiSarMetrics?.sarPenetrationGainPercent}%, Concordance: ${sarResult.optiSarMetrics?.crossModalConcordance}%`);
    passedTests++;
  } else {
    console.error('❌ TEST 4 FAILED', sarResult);
  }

  // Test 5: REPORT GENERATION & PROTOTYPE TRANSPARENCY
  console.log('\nTEST 5: Testing Report Generation, Execution Trace & Transparency Label...');
  const reportMd = generateMarkdownReport(changeResult);
  const reportPassed =
    reportMd.includes('SATQUERY AI — GEOSPATIAL INTELLIGENCE REPORT') &&
    reportMd.includes('AGENT MISSION OVERVIEW') &&
    reportMd.includes('Routing Reason:') &&
    reportMd.includes('OBSERVABLE AGENTIC EXECUTION TRACE') &&
    reportMd.includes('Prototype Mode — Specialist outputs are demonstrative; production models are pluggable.') &&
    changeResult.executionTrace.length === 7;

  if (reportPassed) {
    console.log('✅ TEST 5 PASSED: Intelligence markdown report includes all decisions, routing reasons, 7-step trace, and transparency disclaimers.');
    passedTests++;
  } else {
    console.error('❌ TEST 5 FAILED');
  }

  console.log('\n====================================================');
  console.log(`🏁 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllVerificationTests().catch(err => {
  console.error('Verification failed with unhandled error:', err);
  process.exit(1);
});
