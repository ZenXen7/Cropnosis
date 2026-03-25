#!/usr/bin/env node

const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  console.log('🔍 Finding your local IP address...');
  console.log('=====================================');
  
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    
    for (const address of addresses) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (address.family === 'IPv4' && !address.internal) {
        console.log(`📱 Interface: ${interfaceName}`);
        console.log(`🌐 IP Address: ${address.address}`);
        console.log(`🔗 Use this URL: http://${address.address}:3000`);
        console.log('');
      }
    }
  }
  
  console.log('💡 Instructions:');
  console.log('1. Copy one of the IP addresses above');
  console.log('2. Update lib/config.ts with your IP');
  console.log('3. Replace 192.168.1.100 with your actual IP');
  console.log('');
  console.log('📋 For different platforms:');
  console.log('- Android Emulator: Use 10.0.2.2:3000');
  console.log('- iOS Simulator: Use localhost:3000');
  console.log('- Physical Device: Use your IP address');
}

getLocalIPAddress();
