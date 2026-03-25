const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Migration schema to track applied migrations
const migrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  appliedAt: { type: Date, default: Date.now },
  version: { type: String, required: true }
});

const Migration = mongoose.model('Migration', migrationSchema);

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname);
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB for migrations');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  async getAppliedMigrations() {
    try {
      const migrations = await Migration.find({}).sort({ appliedAt: 1 });
      return migrations.map(m => m.name);
    } catch (error) {
      console.error('❌ Error fetching applied migrations:', error.message);
      return [];
    }
  }

  async getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.js') && file !== 'migrate.js')
        .sort();
      return files;
    } catch (error) {
      console.error('❌ Error reading migration files:', error.message);
      return [];
    }
  }

  async runMigration(migrationFile) {
    const migrationPath = path.join(this.migrationsPath, migrationFile);
    const migration = require(migrationPath);
    
    console.log(`🔄 Running migration: ${migrationFile}`);
    
    try {
      if (migration.up) {
        await migration.up();
        console.log(`✅ Migration completed: ${migrationFile}`);
      } else {
        console.log(`⚠️  No 'up' function found in ${migrationFile}`);
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${migrationFile}`, error.message);
      throw error;
    }
  }

  async rollbackMigration(migrationFile) {
    const migrationPath = path.join(this.migrationsPath, migrationFile);
    const migration = require(migrationPath);
    
    console.log(`🔄 Rolling back migration: ${migrationFile}`);
    
    try {
      if (migration.down) {
        await migration.down();
        console.log(`✅ Rollback completed: ${migrationFile}`);
      } else {
        console.log(`⚠️  No 'down' function found in ${migrationFile}`);
      }
    } catch (error) {
      console.error(`❌ Rollback failed: ${migrationFile}`, error.message);
      throw error;
    }
  }

  async recordMigration(migrationFile, version) {
    try {
      await Migration.create({
        name: migrationFile,
        version: version || '1.0.0'
      });
    } catch (error) {
      console.error('❌ Error recording migration:', error.message);
      throw error;
    }
  }

  async removeMigrationRecord(migrationFile) {
    try {
      await Migration.deleteOne({ name: migrationFile });
    } catch (error) {
      console.error('❌ Error removing migration record:', error.message);
      throw error;
    }
  }

  async migrate() {
    await this.connect();
    
    try {
      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      const pendingMigrations = migrationFiles.filter(file => 
        !appliedMigrations.includes(file)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
      pendingMigrations.forEach(file => console.log(`  - ${file}`));

      for (const migrationFile of pendingMigrations) {
        await this.runMigration(migrationFile);
        await this.recordMigration(migrationFile);
      }

      console.log('🎉 All migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }

  async rollback(steps = 1) {
    await this.connect();
    
    try {
      const appliedMigrations = await this.getAppliedMigrations();
      const migrationsToRollback = appliedMigrations.slice(-steps);

      if (migrationsToRollback.length === 0) {
        console.log('✅ No migrations to rollback');
        return;
      }

      console.log(`📋 Rolling back ${migrationsToRollback.length} migration(s):`);
      migrationsToRollback.forEach(file => console.log(`  - ${file}`));

      for (const migrationFile of migrationsToRollback.reverse()) {
        await this.rollbackMigration(migrationFile);
        await this.removeMigrationRecord(migrationFile);
      }

      console.log('🎉 Rollback completed successfully!');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }

  async status() {
    await this.connect();
    
    try {
      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      console.log('📊 Migration Status:');
      console.log(`Applied: ${appliedMigrations.length}`);
      console.log(`Total: ${migrationFiles.length}`);
      console.log(`Pending: ${migrationFiles.length - appliedMigrations.length}`);
      
      console.log('\n📋 Applied Migrations:');
      appliedMigrations.forEach(file => console.log(`  ✅ ${file}`));
      
      const pendingMigrations = migrationFiles.filter(file => 
        !appliedMigrations.includes(file)
      );
      
      if (pendingMigrations.length > 0) {
        console.log('\n📋 Pending Migrations:');
        pendingMigrations.forEach(file => console.log(`  ⏳ ${file}`));
      }
    } catch (error) {
      console.error('❌ Error checking migration status:', error.message);
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const runner = new MigrationRunner();

  switch (command) {
    case 'up':
    case 'migrate':
      await runner.migrate();
      break;
    case 'down':
    case 'rollback':
      const steps = parseInt(process.argv[3]) || 1;
      await runner.rollback(steps);
      break;
    case 'status':
      await runner.status();
      break;
    default:
      console.log(`
🔧 MongoDB Migration Tool

Usage:
  node migrate.js up          - Run pending migrations
  node migrate.js down [n]    - Rollback last n migrations (default: 1)
  node migrate.js status      - Show migration status

Examples:
  node migrate.js up
  node migrate.js down
  node migrate.js down 3
  node migrate.js status
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MigrationRunner;
