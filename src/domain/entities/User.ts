/**
 * User Role - defines access level and permissions
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  GERENTE = 'GERENTE',
  VENDEDOR = 'VENDEDOR',
  CONDUCTOR = 'CONDUCTOR',
  CONTADOR = 'CONTADOR'
}

/**
 * User Entity - Represents a system user with authentication
 */
export class User {
  constructor(
    public readonly id: string,
    public username: string,
    public email: string,
    public passwordHash: string,
    public role: UserRole,
    public nombre: string,
    public activo: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public lastLogin?: Date
  ) {}

  /**
   * Check if user has required role
   */
  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Update last login timestamp
   */
  updateLastLogin(): void {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Deactivate user
   */
  deactivate(): void {
    this.activo = false;
    this.updatedAt = new Date();
  }

  /**
   * Activate user
   */
  activate(): void {
    this.activo = true;
    this.updatedAt = new Date();
  }
}

/**
 * Refresh Token Entity
 */
export class RefreshToken {
  constructor(
    public readonly id: string,
    public userId: string,
    public token: string,
    public expiresAt: Date,
    public readonly createdAt: Date
  ) {}

  /**
   * Check if token is expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
