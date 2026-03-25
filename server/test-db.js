#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log(`📍 Connection string: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    console.log('💡 Please check your .env file');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`📊 Database: ${db.databaseName}`);
    console.log(`📋 Collections (${collections.length}):`);
    
    if (collections.length === 0) {
      console.log('  (No collections found)');
    } else {
      collections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed');
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure MongoDB is running');
      console.log('   Local: Start MongoDB service');
      console.log('   Atlas: Check connection string');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Check your username and password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your MongoDB host/URL');
    }
    
    return false;
  }
}

if (require.main === module) {
  testConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}
