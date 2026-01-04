import { Request, Response, NextFunction } from 'express';
import { ServicioAutenticacion, JWTPayload } from '../../../application/services/ServicioAutenticacion';
import { UserRole } from '../../../domain/entities/User';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autenticación',
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const servicioAuth = new ServicioAutenticacion();
    const payload = servicioAuth.verifyAccessToken(token);
    
    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'Token inválido o expirado',
      });
      return;
    }

    // Attach user to request
    req.user = payload;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al verificar autenticación',
    });
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'No tienes permisos para acceder a este recurso',
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user if token is present, but doesn't reject if not
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const servicioAuth = new ServicioAutenticacion();
      const payload = servicioAuth.verifyAccessToken(token);
      
      if (payload) {
        req.user = payload;
      }
    }
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
}
