#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🤖 Setting up Gemini AI Demo');
console.log('============================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
  } else {
    console.log('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🔑 Gemini AI Setup Instructions:');
console.log('1. Go to https://makersuite.google.com/app/apikey');
console.log('2. Create a new API key');
console.log('3. Copy the API key');
console.log('4. Add it to your .env file:');
console.log('   GEMINI_API_KEY=your-actual-api-key-here');
console.log('');

console.log('💡 Demo Mode:');
console.log('- If no API key is provided, the system will use fallback responses');
console.log('- This allows the demo to work without requiring API setup');
console.log('- Fallback responses are realistic and professional');

console.log('\n🚀 Available Endpoints:');
console.log('- POST /predict - Upload image for disease analysis');
console.log('- GET /ai-tip - Get AI-generated farming tips');
console.log('- GET /health - Check service status');

console.log('\n📋 Demo Features:');
console.log('✅ Mock disease prediction');
console.log('✅ AI-generated analysis (with Gemini or fallback)');
console.log('✅ Professional recommendations');
console.log('✅ Risk assessment');
console.log('✅ Treatment suggestions');

console.log('\n🎯 Ready for Demo!');
console.log('Start your server: npm start');
console.log('Test the AI: curl http://localhost:3000/ai-tip');
