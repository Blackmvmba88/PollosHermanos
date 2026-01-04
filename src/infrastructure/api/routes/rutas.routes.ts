/**
 * REST API Routes for Rutas (Delivery Routes)
 */

import { Router, Request, Response } from 'express';
import { ServicioRutas } from '../../../application/services/ServicioRutas';

export function crearRutasDeEntrega(servicioRutas: ServicioRutas): Router {
  const router = Router();

  // Specific routes MUST come before parameterized routes

  // GET /api/rutas/activas/lista - Obtener rutas activas
  router.get('/activas/lista', async (req: Request, res: Response) => {
    try {
      const rutas = await servicioRutas.obtenerRutasActivas();
      res.json({
        success: true,
        data: rutas,
        total: rutas.length
      });
    } catch (error) {
      console.error('Error al obtener rutas activas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener rutas activas',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/rutas - Obtener todas las rutas
  router.get('/', async (req: Request, res: Response) => {
    try {
      const rutas = await servicioRutas.obtenerTodas();
      res.json({
        success: true,
        data: rutas,
        total: rutas.length
      });
    } catch (error) {
      console.error('Error al obtener rutas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener rutas',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/rutas/:id - Obtener ruta por ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const ruta = await servicioRutas.obtenerPorId(req.params.id);
      if (!ruta) {
        return res.status(404).json({
          success: false,
          error: 'Ruta no encontrada'
        });
      }
      res.json({
        success: true,
        data: ruta
      });
    } catch (error) {
      console.error('Error al obtener ruta:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener ruta',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/rutas - Crear nueva ruta
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        nombre,
        fechaPlanificada,
        idConductor,
        nombreConductor,
        idVehiculo
      } = req.body;

      if (!nombre || !fechaPlanificada) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos. Se requiere: nombre, fechaPlanificada'
        });
      }

      const ruta = await servicioRutas.crearRuta(
        nombre,
        new Date(fechaPlanificada),
        idConductor,
        nombreConductor,
        idVehiculo
      );

      res.status(201).json({
        success: true,
        data: ruta,
        message: 'Ruta creada exitosamente'
      });
    } catch (error) {
      console.error('Error al crear ruta:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear ruta',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/rutas/:id/parada - Agregar parada a la ruta
  router.put('/:id/parada', async (req: Request, res: Response) => {
    try {
      const { parada } = req.body;

      if (!parada) {
        return res.status(400).json({
          success: false,
          error: 'Datos de parada requeridos'
        });
      }

      const ruta = await servicioRutas.agregarParada(req.params.id, parada);
      res.json({
        success: true,
        data: ruta,
        message: 'Parada agregada exitosamente'
      });
    } catch (error) {
      console.error('Error al agregar parada:', error);
      res.status(500).json({
        success: false,
        error: 'Error al agregar parada',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/rutas/:id/iniciar - Iniciar ruta
  router.put('/:id/iniciar', async (req: Request, res: Response) => {
    try {
      const ruta = await servicioRutas.iniciarRuta(req.params.id);
      res.json({
        success: true,
        data: ruta,
        message: 'Ruta iniciada exitosamente'
      });
    } catch (error) {
      console.error('Error al iniciar ruta:', error);
      res.status(500).json({
        success: false,
        error: 'Error al iniciar ruta',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/rutas/:id/completar-parada - Completar parada
  router.put('/:id/completar-parada', async (req: Request, res: Response) => {
    try {
      const { idPedido } = req.body;

      if (!idPedido) {
        return res.status(400).json({
          success: false,
          error: 'idPedido requerido'
        });
      }

      const ruta = await servicioRutas.completarParada(req.params.id, idPedido);
      res.json({
        success: true,
        data: ruta,
        message: 'Parada completada exitosamente'
      });
    } catch (error) {
      console.error('Error al completar parada:', error);
      res.status(500).json({
        success: false,
        error: 'Error al completar parada',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/rutas/:id/finalizar - Finalizar ruta
  router.put('/:id/finalizar', async (req: Request, res: Response) => {
    try {
      const ruta = await servicioRutas.completarRuta(req.params.id);
      res.json({
        success: true,
        data: ruta,
        message: 'Ruta finalizada exitosamente'
      });
    } catch (error) {
      console.error('Error al finalizar ruta:', error);
      res.status(500).json({
        success: false,
        error: 'Error al finalizar ruta',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/rutas/:id/optimizar - Optimizar ruta
  router.put('/:id/optimizar', async (req: Request, res: Response) => {
    try {
      const { nuevoOrden } = req.body;
      
      if (!nuevoOrden || !Array.isArray(nuevoOrden)) {
        return res.status(400).json({
          success: false,
          error: 'Se requiere nuevoOrden como array de IDs de pedidos'
        });
      }

      const ruta = await servicioRutas.reordenarParadas(req.params.id, nuevoOrden);
      res.json({
        success: true,
        data: ruta,
        message: 'Ruta optimizada exitosamente'
      });
    } catch (error) {
      console.error('Error al optimizar ruta:', error);
      res.status(500).json({
        success: false,
        error: 'Error al optimizar ruta',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}
