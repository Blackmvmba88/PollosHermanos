import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Configuration class for managing environment variables
 */
export class Config {
  // Database Configuration
  static readonly DB_HOST = process.env.DB_HOST || 'localhost';
  static readonly DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
  static readonly DB_NAME = process.env.DB_NAME || 'polloshermanos';
  static readonly DB_USER = process.env.DB_USER || 'postgres';
  static readonly DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
  static readonly DB_SSL = process.env.DB_SSL === 'true';

  // Redis Configuration
  static readonly REDIS_HOST = process.env.REDIS_HOST || 'localhost';
  static readonly REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
  static readonly REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

  // Server Configuration
  static readonly PORT = parseInt(process.env.PORT || '3000', 10);
  static readonly NODE_ENV = process.env.NODE_ENV || 'development';
  static readonly IS_PRODUCTION = this.NODE_ENV === 'production';
  static readonly IS_DEVELOPMENT = this.NODE_ENV === 'development';
  static readonly IS_TEST = this.NODE_ENV === 'test';

  // JWT Configuration
  static readonly JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-12345';
  static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-12345';
  static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  // Rate Limiting
  static readonly RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
  static readonly RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

  /**
   * Get database connection string
   */
  static getDatabaseUrl(): string {
    return `postgresql://${this.DB_USER}:${this.DB_PASSWORD}@${this.DB_HOST}:${this.DB_PORT}/${this.DB_NAME}${this.DB_SSL ? '?ssl=true' : ''}`;
  }

  /**
   * Validate required configuration
   */
  static validate(): void {
    if (this.IS_PRODUCTION) {
      if (this.JWT_SECRET === 'dev-secret-key-12345') {
        throw new Error('JWT_SECRET must be set in production');
      }
      if (this.JWT_REFRESH_SECRET === 'dev-refresh-secret-key-12345') {
        throw new Error('JWT_REFRESH_SECRET must be set in production');
      }
    }
  }
}

// Validate configuration on load
Config.validate();
