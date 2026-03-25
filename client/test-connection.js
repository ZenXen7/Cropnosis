#!/usr/bin/env node

// Test script to verify frontend-backend connection
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testConnection() {
  console.log('🔍 Testing Frontend-Backend Connection');
  console.log('=====================================');
  
  // Test 1: Health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData);
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }

  // Test 2: Registration endpoint
  try {
    console.log('\n2. Testing registration endpoint...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'test-connection@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'Connection',
        birthDate: '1990-01-01'
      })
    });
    
    const registerData = await registerResponse.json();
    if (registerResponse.ok) {
      console.log('✅ Registration endpoint:', registerData);
    } else {
      console.log('⚠️  Registration endpoint (expected if user exists):', registerData);
    }
  } catch (error) {
    console.log('❌ Registration endpoint failed:', error.message);
  }

  // Test 3: Login endpoint
  try {
    console.log('\n3. Testing login endpoint...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@agrivision.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (loginResponse.ok) {
      console.log('✅ Login endpoint:', loginData);
    } else {
      console.log('⚠️  Login endpoint:', loginData);
    }
  } catch (error) {
    console.log('❌ Login endpoint failed:', error.message);
  }

  console.log('\n📋 Connection Test Summary:');
  console.log('- If all tests show ✅, your connection is working');
  console.log('- If you see ❌, check if your server is running');
  console.log('- Make sure to run: npm start (in server directory)');
}

testConnection().catch(console.error);
