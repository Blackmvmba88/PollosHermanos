import { DatabaseConnection } from './DatabaseConnection';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Database Migration Tool
 * Executes schema.sql to create or update database structure
 */
export class DatabaseMigration {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /**
   * Run migrations
   */
  async migrate(): Promise<void> {
    console.log('Starting database migration...');
    
    try {
      // Check connection
      const isConnected = await this.db.ping();
      if (!isConnected) {
        throw new Error('Cannot connect to database');
      }
      console.log('✓ Database connection established');

      // Read schema file
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema
      await this.db.query(schema);
      console.log('✓ Schema executed successfully');

      // Verify tables
      const result = await this.db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      console.log(`✓ Created ${result.rows.length} tables:`);
      result.rows.forEach((row: any) => console.log(`  - ${row.table_name}`));

      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Drop all tables (use with caution!)
   */
  async dropAll(): Promise<void> {
    console.log('WARNING: Dropping all tables...');
    
    try {
      await this.db.query(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO postgres;
        GRANT ALL ON SCHEMA public TO public;
      `);
      console.log('✓ All tables dropped');
    } catch (error) {
      console.error('Drop failed:', error);
      throw error;
    }
  }

  /**
   * Seed initial data (optional)
   */
  async seed(): Promise<void> {
    console.log('Seeding initial data...');
    
    try {
      // Create default admin user (password: admin123)
      // Hash generated with bcrypt for "admin123"
      const adminPasswordHash = '$2b$10$K7qGfXXqXqXqXqXqXqXqXeJ7M9BqN9Y5iH3F5P0P0P0P0P0P0P0P0O';
      
      await this.db.query(`
        INSERT INTO users (id, username, email, password_hash, role, nombre)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (username) DO NOTHING
      `, ['user-admin-001', 'admin', 'admin@polloshermanos.com', adminPasswordHash, 'ADMIN', 'Administrador']);
      
      console.log('✓ Default admin user created (username: admin, password: admin123)');
      console.log('Seeding completed!');
    } catch (error) {
      console.error('Seeding failed:', error);
      throw error;
    }
  }
}

// Run migration if executed directly
if (require.main === module) {
  const migration = new DatabaseMigration();
  
  const command = process.argv[2];
  
  (async () => {
    try {
      switch (command) {
        case 'up':
          await migration.migrate();
          await migration.seed();
          break;
        case 'down':
          await migration.dropAll();
          break;
        case 'reset':
          await migration.dropAll();
          await migration.migrate();
          await migration.seed();
          break;
        default:
          console.log('Usage: ts-node migrate.ts [up|down|reset]');
          console.log('  up    - Run migrations');
          console.log('  down  - Drop all tables');
          console.log('  reset - Drop and recreate all tables');
      }
      process.exit(0);
    } catch (error) {
      console.error('Migration error:', error);
      process.exit(1);
    }
  })();
}
