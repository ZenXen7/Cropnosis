#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 AgriVision Database Setup');
console.log('================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
    console.log('⚠️  Please edit .env file with your database credentials');
  } else {
    console.log('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Edit .env file with your MongoDB connection string');
console.log('2. Make sure MongoDB is running (local or Atlas)');
console.log('3. Run: npm run migrate');
console.log('4. Check status: npm run migrate:status');
console.log('5. Start server: npm start');

console.log('\n🔧 Available Commands:');
console.log('  npm run migrate              - Run pending migrations');
console.log('  npm run migrate:status       - Check migration status');
console.log('  npm run migrate:rollback     - Rollback last migration');
console.log('  npm run migrate:rollback:all - Rollback all migrations');

console.log('\n💡 MongoDB Connection Examples:');
console.log('  Local: mongodb://localhost:27017/agrivision');
console.log('  Atlas: SECRET_MONGO_URI');
