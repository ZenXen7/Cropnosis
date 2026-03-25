#!/usr/bin/env node

const geminiService = require('./services/geminiService');

async function testGeminiFix() {
  console.log('🧪 Testing Gemini AI Fix');
  console.log('========================');
  
  try {
    console.log('1. Testing AI tip generation...');
    const tip = await geminiService.generateQuickTip();
    console.log('✅ AI Tip:', tip);
    
    console.log('\n2. Testing crop analysis...');
    const mockPredictionData = {
      predictions: [
        { name: "Leaf Spot", confidence: 0.85 },
        { name: "Healthy", confidence: 0.12 },
        { name: "Powdery Mildew", confidence: 0.03 }
      ],
      processingTime: 1200,
      imageSize: 1024000
    };
    
    const analysis = await geminiService.generateCropAnalysis(mockPredictionData);
    console.log('✅ AI Analysis:', JSON.stringify(analysis, null, 2));
    
    console.log('\n🎉 Gemini AI is working correctly!');
    
  } catch (error) {
    console.error('❌ Gemini AI test failed:', error.message);
    console.log('💡 This might be due to:');
    console.log('   - No API key provided (using fallback)');
    console.log('   - Network connectivity issues');
    console.log('   - API quota exceeded');
  }
}

testGeminiFix();
