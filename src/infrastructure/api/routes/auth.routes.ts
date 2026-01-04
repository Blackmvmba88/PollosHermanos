import { Router, Request, Response } from 'express';
import { ServicioAutenticacion } from '../../../application/services/ServicioAutenticacion';
import { UserRole } from '../../../domain/entities/User';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const servicioAuth = new ServicioAutenticacion();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, nombre } = req.body;

    // Validate required fields
    if (!username || !email || !password || !nombre) {
      res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos',
      });
      return;
    }

    // Register user
    const user = await servicioAuth.registrarUsuario(
      username,
      email,
      password,
      role || UserRole.VENDEDOR,
      nombre
    );

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        nombre: user.nombre,
      },
      message: 'Usuario registrado exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Error al registrar usuario',
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Username y password son requeridos',
      });
      return;
    }

    // Login
    const loginResponse = await servicioAuth.login(username, password);

    res.status(200).json({
      success: true,
      data: loginResponse,
      message: 'Login exitoso',
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Error al iniciar sesión',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token es requerido',
      });
      return;
    }

    const tokens = await servicioAuth.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Error al refrescar token',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token es requerido',
      });
      return;
    }

    await servicioAuth.logout(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logout exitoso',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al cerrar sesión',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

export default router;
