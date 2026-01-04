/**
 * REST API Routes for Clientes (Customers)
 */

import { Router, Request, Response } from 'express';
import { ServicioClientes } from '../../../application/services/ServicioClientes';
import { TipoCliente } from '../../../domain/entities/Cliente';

export function crearRutasClientes(servicioClientes: ServicioClientes): Router {
  const router = Router();

  // Specific routes MUST come before parameterized routes

  // GET /api/clientes/tipo/:tipo - Obtener clientes por tipo
  router.get('/tipo/:tipo', async (req: Request, res: Response) => {
    try {
      // Filter by tipo on the client side for now
      // TODO: Implement obtenerPorTipo method in ServicioClientes for better performance
      const todosClientes = await servicioClientes.obtenerTodos();
      const tipo = req.params.tipo as TipoCliente;
      const clientes = todosClientes.filter(c => c.tipo === tipo);
      res.json({
        success: true,
        data: clientes,
        total: clientes.length
      });
    } catch (error) {
      console.error('Error al obtener clientes por tipo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener clientes por tipo',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/clientes - Obtener todos los clientes
  router.get('/', async (req: Request, res: Response) => {
    try {
      const clientes = await servicioClientes.obtenerTodos();
      res.json({
        success: true,
        data: clientes,
        total: clientes.length
      });
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener clientes',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/clientes/:id - Obtener cliente por ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      // Note: This endpoint filters by tipo on the client side
      // TODO: Add obtenerPorTipo method to ServicioClientes in future
      const todosClientes = await servicioClientes.obtenerTodos();
      const tipo = req.params.tipo as TipoCliente;
      const clientes = todosClientes.filter(c => c.tipo === tipo);
      res.json({
        success: true,
        data: clientes,
        total: clientes.length
      });
    } catch (error) {
      console.error('Error al obtener clientes por tipo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener clientes por tipo',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/clientes - Registrar nuevo cliente
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        nombre,
        tipo,
        contacto,
        direcciones,
        limiteCredito
      } = req.body;

      if (!nombre || !tipo) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos. Se requiere: nombre, tipo'
        });
      }

      const cliente = await servicioClientes.registrarCliente(
        nombre,
        tipo as TipoCliente,
        contacto || {},
        direcciones || [],
        limiteCredito || 0
      );

      res.status(201).json({
        success: true,
        data: cliente,
        message: 'Cliente registrado exitosamente'
      });
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al registrar cliente',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/clientes/:id/direccion - Agregar dirección al cliente
  router.put('/:id/direccion', async (req: Request, res: Response) => {
    try {
      const { direccion } = req.body;

      if (!direccion) {
        return res.status(400).json({
          success: false,
          error: 'Dirección requerida'
        });
      }

      const cliente = await servicioClientes.agregarDireccion(req.params.id, direccion);
      res.json({
        success: true,
        data: cliente,
        message: 'Dirección agregada exitosamente'
      });
    } catch (error) {
      console.error('Error al agregar dirección:', error);
      res.status(500).json({
        success: false,
        error: 'Error al agregar dirección',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/clientes/:id/credito - Registrar pago del cliente
  router.put('/:id/credito', async (req: Request, res: Response) => {
    try {
      const { monto } = req.body;

      if (monto === undefined || monto <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Monto inválido'
        });
      }

      const cliente = await servicioClientes.registrarPago(req.params.id, monto);
      res.json({
        success: true,
        data: cliente,
        message: 'Pago registrado exitosamente'
      });
    } catch (error) {
      console.error('Error al registrar pago:', error);
      res.status(500).json({
        success: false,
        error: 'Error al registrar pago',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/clientes/:id/compra - Registrar compra del cliente
  router.put('/:id/compra', async (req: Request, res: Response) => {
    try {
      const { monto } = req.body;

      if (monto === undefined || monto <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Monto inválido'
        });
      }

      // Add to balance (credit)
      const cliente = await servicioClientes.agregarAlSaldo(req.params.id, monto);
      res.json({
        success: true,
        data: cliente,
        message: 'Compra registrada exitosamente'
      });
    } catch (error) {
      console.error('Error al registrar compra:', error);
      res.status(500).json({
        success: false,
        error: 'Error al registrar compra',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}
