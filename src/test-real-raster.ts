import { agentEngine } from './services/agentEngine';

async function testRealRasterPipeline() {
  console.log('🛰️ Testing Real Easy-EO Remote Sensing Pipeline from TypeScript...');

  // 1. Fetch real sample raster RGB from FastAPI backend
  const sampleRes = await fetch('http://127.0.0.1:8000/api/analyze/single?use_sample=true', { method: 'POST' });
  const sampleData = await sampleRes.json();
  const realRgb = sampleData.visualizations.rgb;

  console.log('[*] Real sample raster obtained:', sampleData.metadata.crs, `${sampleData.metadata.width}x${sampleData.metadata.height}px`);

  // 2. Run analysis with real uploaded image data URL
  const result = await agentEngine.runAnalysis({
    query: 'Calculate NDVI and quantify vegetation and water canopy',
    primaryImage: realRgb,
    primaryLabel: 'Sentinel-2 Multispectral Scene (Easy-EO)',
    mode: 'vqa'
  });

  console.log('✅ Analysis finished!');
  console.log('Detected Task:', result.detectedTask);
  console.log('Selected Tool:', result.selectedTool);
  console.log('Is Real Raster:', result.isRealRaster);
  console.log('Trace Steps Count:', result.executionTrace.length);
  console.log('Trace Phases:', result.executionTrace.map(s => s.phase).join(' -> '));
  console.log('Transparency Notice:', result.prototypeTransparencyNotice);
  console.log('Answer:', result.answer);

  if (result.isRealRaster && result.executionTrace.length === 10) {
    console.log('🎉 10-STEP REAL EASY-EO PIPELINE VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ Real pipeline test failed: trace length != 10 or isRealRaster != true');
    process.exit(1);
  }
}

testRealRasterPipeline().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
