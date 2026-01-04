import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, RefreshToken } from '../../domain/entities/User';
import { Config } from '../../infrastructure/config/Config';
import { DatabaseConnection } from '../../infrastructure/database/DatabaseConnection';

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
}

/**
 * Login Response
 */
export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    nombre: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Authentication Service
 * Handles user authentication, JWT tokens, and authorization
 */
export class ServicioAutenticacion {
  private db: DatabaseConnection;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /**
   * Register a new user
   */
  async registrarUsuario(
    username: string,
    email: string,
    password: string,
    role: UserRole,
    nombre: string
  ): Promise<User> {
    // Check if username already exists
    const existingUser = await this.buscarPorUsername(username);
    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    // Check if email already exists
    const existingEmail = await this.buscarPorEmail(email);
    if (existingEmail) {
      throw new Error('El email ya está registrado');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const userId = `user-${uuidv4()}`;
    const now = new Date();

    await this.db.query(
      `INSERT INTO users (id, username, email, password_hash, role, nombre, activo, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, username, email, passwordHash, role, nombre, true, now, now]
    );

    return new User(userId, username, email, passwordHash, role, nombre, true, now, now);
  }

  /**
   * Login user
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = await this.buscarPorUsername(username);
    if (!user) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // Check if user is active
    if (!user.activo) {
      throw new Error('Usuario inactivo');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // Update last login
    await this.db.query(
      'UPDATE users SET last_login = $1, updated_at = $2 WHERE id = $3',
      [new Date(), new Date(), user.id]
    );

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
      },
      accessToken,
      refreshToken,
      expiresIn: Config.JWT_EXPIRES_IN,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
    // Verify refresh token
    const tokenData = await this.verifyRefreshToken(refreshToken);
    if (!tokenData) {
      throw new Error('Token de actualización inválido o expirado');
    }

    // Get user
    const user = await this.buscarPorId(tokenData.userId);
    if (!user || !user.activo) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(user);

    return {
      accessToken,
      expiresIn: Config.JWT_EXPIRES_IN,
    };
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    await this.db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, Config.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify password
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  private generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, Config.JWT_SECRET, {
      expiresIn: Config.JWT_EXPIRES_IN,
    });
  }

  /**
   * Generate refresh token
   */
  private async generateRefreshToken(user: User): Promise<string> {
    const tokenId = `rt-${uuidv4()}`;
    const token = jwt.sign({ userId: user.id }, Config.JWT_REFRESH_SECRET, {
      expiresIn: Config.JWT_REFRESH_EXPIRES_IN,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.db.query(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)',
      [tokenId, user.id, token, expiresAt, new Date()]
    );

    return token;
  }

  /**
   * Verify refresh token
   */
  private async verifyRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      // Verify JWT signature
      jwt.verify(token, Config.JWT_REFRESH_SECRET);

      // Check if token exists in database
      const result = await this.db.query(
        'SELECT * FROM refresh_tokens WHERE token = $1',
        [token]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const refreshToken = new RefreshToken(
        row.id,
        row.user_id,
        row.token,
        new Date(row.expires_at),
        new Date(row.created_at)
      );

      // Check if expired
      if (refreshToken.isExpired()) {
        await this.db.query('DELETE FROM refresh_tokens WHERE id = $1', [refreshToken.id]);
        return null;
      }

      return refreshToken;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find user by ID
   */
  private async buscarPorId(id: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Find user by username
   */
  private async buscarPorUsername(username: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Find user by email
   */
  private async buscarPorEmail(email: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Map database row to User entity
   */
  private mapRowToUser(row: any): User {
    return new User(
      row.id,
      row.username,
      row.email,
      row.password_hash,
      row.role as UserRole,
      row.nombre,
      row.activo,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.last_login ? new Date(row.last_login) : undefined
    );
  }
}
