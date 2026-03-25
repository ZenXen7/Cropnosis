#!/usr/bin/env node

const https = require('https');

async function testDirectGeminiCall() {
  console.log('🧪 Testing Direct Gemini REST API Call');
  console.log('=====================================');
  
  const apiKey = process.env.GEMINI_API_KEY || 'demo-key';
  const modelName = 'gemini-2.5-flash';
  const prompt = 'Explain how AI works in a few words';
  
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`🤖 Model: ${modelName}`);
  console.log(`💬 Prompt: ${prompt}`);
  
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
    const data = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const options = {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    console.log('\n📡 Making request to:', url);
    console.log('📋 Headers:', JSON.stringify(options.headers, null, 2));
    console.log('📤 Data:', data);

    const req = https.request(url, options, (res) => {
      console.log(`\n📥 Response Status: ${res.statusCode}`);
      console.log('📋 Response Headers:', JSON.stringify(res.headers, null, 2));
      
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log('\n📥 Response Body:', responseData);
        
        try {
          const response = JSON.parse(responseData);
          
          if (res.statusCode === 200 && response.candidates && response.candidates[0]) {
            const text = response.candidates[0].content.parts[0].text;
            console.log('\n✅ Success!');
            console.log('🤖 AI Response:', text);
            resolve(text);
          } else {
            console.log('\n❌ API Error:', response.error || 'Unknown error');
            reject(new Error(`API Error: ${response.error?.message || 'Unknown error'}`));
          }
        } catch (parseError) {
          console.log('\n❌ Parse Error:', parseError.message);
          reject(new Error(`Parse Error: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('\n❌ Request Error:', error.message);
      reject(new Error(`Request Error: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
}

testDirectGeminiCall().catch(console.error);
