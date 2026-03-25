#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.27:3000';

async function testEndpoints() {
  console.log('🔍 Testing API Endpoints');
  console.log('========================');
  
  // Test 1: Health endpoint
  try {
    console.log('1. Testing /health endpoint...');
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ /health:', response.status, data);
  } catch (error) {
    console.log('❌ /health failed:', error.message);
  }

  // Test 2: Auth register endpoint
  try {
    console.log('\n2. Testing /auth/register endpoint...');
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test-endpoint@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Endpoint',
        birthDate: '1990-01-01'
      })
    });
    
    const data = await response.json();
    console.log('✅ /auth/register:', response.status, data);
  } catch (error) {
    console.log('❌ /auth/register failed:', error.message);
  }

  // Test 3: Auth login endpoint
  try {
    console.log('\n3. Testing /auth/login endpoint...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@agrivision.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('✅ /auth/login:', response.status, data);
  } catch (error) {
    console.log('❌ /auth/login failed:', error.message);
  }

  // Test 4: Predict endpoint
  try {
    console.log('\n4. Testing /predict endpoint...');
    const response = await fetch(`${BASE_URL}/predict`, {
      method: 'GET'
    });
    
    const data = await response.json();
    console.log('✅ /predict:', response.status, data);
  } catch (error) {
    console.log('❌ /predict failed:', error.message);
  }

  console.log('\n📋 Summary:');
  console.log('- If all tests show ✅, your API is working correctly');
  console.log('- If you see ❌, there might be an issue with the endpoint');
  console.log('- Make sure your server is running: npm start (in server directory)');
}

testEndpoints().catch(console.error);
