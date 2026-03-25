#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Sample users to insert
const sampleUsers = [
  {
    email: 'admin@agrivision.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    birthDate: new Date('1990-01-01')
  },
  {
    email: 'john.doe@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    birthDate: new Date('1995-05-15')
  },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user',
    birthDate: new Date('1992-08-22')
  },
  {
    email: 'farmer@example.com',
    password: 'farmer123',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'user',
    birthDate: new Date('1988-12-10')
  }
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function insertUsers() {
  console.log('🚀 Starting user insertion...');
  
  try {
    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log(`⚠️  Found ${existingUsers.length} existing users in database`);
      console.log('📋 Existing users:');
      existingUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });
      
      // Ask if user wants to continue
      console.log('\n❓ Do you want to add more users? (This will not overwrite existing ones)');
      console.log('   Run with --force to skip this check');
      
      if (!process.argv.includes('--force')) {
        console.log('💡 Use: node insert-users.js --force');
        return;
      }
    }

    console.log('🔄 Processing users...');
    
    const insertedUsers = [];
    const skippedUsers = [];

    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⏭️  Skipping ${userData.email} - already exists`);
          skippedUsers.push(userData.email);
          continue;
        }

        // Hash password
        const hashedPassword = await hashPassword(userData.password);
        
        // Create user
        const user = new User({
          ...userData,
          password: hashedPassword
        });

        await user.save();
        console.log(`✅ Inserted user: ${userData.email} (${userData.role})`);
        insertedUsers.push(userData.email);
        
      } catch (error) {
        console.error(`❌ Error inserting ${userData.email}:`, error.message);
      }
    }

    console.log('\n📊 Insertion Summary:');
    console.log(`✅ Successfully inserted: ${insertedUsers.length} users`);
    console.log(`⏭️  Skipped (already exist): ${skippedUsers.length} users`);
    
    if (insertedUsers.length > 0) {
      console.log('\n📋 New users added:');
      insertedUsers.forEach(email => console.log(`  - ${email}`));
    }

    if (skippedUsers.length > 0) {
      console.log('\n📋 Skipped users:');
      skippedUsers.forEach(email => console.log(`  - ${email}`));
    }

  } catch (error) {
    console.error('❌ Error during user insertion:', error.message);
  }
}

async function listUsers() {
  try {
    const users = await User.find({}).select('-password');
    console.log(`\n📋 Current users in database (${users.length} total):`);
    console.log('=====================================');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  
  await connectDB();
  
  switch (command) {
    case 'list':
      await listUsers();
      break;
    case 'insert':
    default:
      await insertUsers();
      break;
  }
  
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error.message);
  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}
