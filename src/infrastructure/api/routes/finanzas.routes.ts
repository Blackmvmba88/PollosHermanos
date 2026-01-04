/**
 * REST API Routes for Finanzas (Finance)
 */

import { Router, Request, Response } from 'express';
import { ServicioFinanzas } from '../../../application/services/ServicioFinanzas';
import { TipoTransaccion, MetodoPago } from '../../../domain/entities/TransaccionFinanciera';

export function crearRutasFinanzas(servicioFinanzas: ServicioFinanzas): Router {
  const router = Router();

  // GET /api/finanzas/transacciones - Obtener todas las transacciones
  router.get('/transacciones', async (req: Request, res: Response) => {
    try {
      const transacciones = await servicioFinanzas.obtenerTodas();
      res.json({
        success: true,
        data: transacciones,
        total: transacciones.length
      });
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener transacciones',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/finanzas/transacciones/:id - Obtener transacción por ID
  router.get('/transacciones/:id', async (req: Request, res: Response) => {
    try {
      const transaccion = await servicioFinanzas.obtenerPorId(req.params.id);
      if (!transaccion) {
        return res.status(404).json({
          success: false,
          error: 'Transacción no encontrada'
        });
      }
      res.json({
        success: true,
        data: transaccion
      });
    } catch (error) {
      console.error('Error al obtener transacción:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener transacción',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/finanzas/resumen - Generar resumen financiero
  router.get('/resumen', async (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      let inicio: Date;
      let fin: Date;

      if (fechaInicio && fechaFin) {
        inicio = new Date(fechaInicio as string);
        fin = new Date(fechaFin as string);
      } else {
        // Por defecto, mes actual
        const hoy = new Date();
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fin = hoy;
      }

      const resumen = await servicioFinanzas.generarResumen(inicio, fin);
      res.json({
        success: true,
        data: resumen
      });
    } catch (error) {
      console.error('Error al generar resumen financiero:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar resumen financiero',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/finanzas/balance - Obtener balance actual
  router.get('/balance', async (req: Request, res: Response) => {
    try {
      const balance = await servicioFinanzas.calcularBalance();
      res.json({
        success: true,
        data: {
          balance
        }
      });
    } catch (error) {
      console.error('Error al obtener balance:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener balance',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/finanzas/transacciones - Registrar nueva transacción
  router.post('/transacciones', async (req: Request, res: Response) => {
    try {
      const {
        tipo,
        monto,
        metodoPago,
        descripcion,
        referencia,
        categoria
      } = req.body;

      if (!tipo || monto === undefined || !metodoPago) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos. Se requiere: tipo, monto, metodoPago'
        });
      }

      const transaccion = await servicioFinanzas.registrarTransaccion(
        tipo as TipoTransaccion,
        monto,
        metodoPago as MetodoPago,
        descripcion,
        referencia,
        categoria
      );

      res.status(201).json({
        success: true,
        data: transaccion,
        message: 'Transacción registrada exitosamente'
      });
    } catch (error) {
      console.error('Error al registrar transacción:', error);
      res.status(500).json({
        success: false,
        error: 'Error al registrar transacción',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/finanzas/transacciones/:id/anular - Anular transacción
  router.put('/transacciones/:id/anular', async (req: Request, res: Response) => {
    try {
      const transaccion = await servicioFinanzas.cancelarTransaccion(req.params.id);
      res.json({
        success: true,
        data: transaccion,
        message: 'Transacción anulada exitosamente'
      });
    } catch (error) {
      console.error('Error al anular transacción:', error);
      res.status(500).json({
        success: false,
        error: 'Error al anular transacción',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}
