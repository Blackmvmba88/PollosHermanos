import { Config } from '../../src/infrastructure/config/Config';

describe('Config', () => {
  it('should have default values', () => {
    expect(Config.PORT).toBeDefined();
    expect(Config.NODE_ENV).toBeDefined();
    expect(Config.DB_HOST).toBeDefined();
    expect(Config.DB_PORT).toBeDefined();
    expect(Config.JWT_SECRET).toBeDefined();
  });

  it('should generate database URL', () => {
    const url = Config.getDatabaseUrl();
    expect(url).toContain('postgresql://');
    expect(url).toContain(Config.DB_HOST);
    expect(url).toContain(Config.DB_NAME);
  });

  it('should validate configuration', () => {
    expect(() => Config.validate()).not.toThrow();
  });
});
