/**
 * REST API Routes for Pedidos (Orders)
 */

import { Router, Request, Response } from 'express';
import { ServicioPedidos } from '../../../application/services/ServicioPedidos';
import { EstadoPedido, PrioridadPedido } from '../../../domain/entities/Pedido';

export function crearRutasPedidos(servicioPedidos: ServicioPedidos): Router {
  const router = Router();

  // GET /api/pedidos - Obtener todos los pedidos
  router.get('/', async (req: Request, res: Response) => {
    try {
      const pedidos = await servicioPedidos.obtenerTodos();
      res.json({
        success: true,
        data: pedidos,
        total: pedidos.length
      });
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener pedidos',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/pedidos/:id - Obtener pedido por ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const pedido = await servicioPedidos.obtenerPorId(req.params.id);
      if (!pedido) {
        return res.status(404).json({
          success: false,
          error: 'Pedido no encontrado'
        });
      }
      res.json({
        success: true,
        data: pedido
      });
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener pedido',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/pedidos/cliente/:idCliente - Obtener pedidos por cliente
  router.get('/cliente/:idCliente', async (req: Request, res: Response) => {
    try {
      const pedidos = await servicioPedidos.obtenerPedidosPorCliente(req.params.idCliente);
      res.json({
        success: true,
        data: pedidos,
        total: pedidos.length
      });
    } catch (error) {
      console.error('Error al obtener pedidos del cliente:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener pedidos del cliente',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/pedidos/estado/:estado - Obtener pedidos por estado
  router.get('/estado/:estado', async (req: Request, res: Response) => {
    try {
      const estado = req.params.estado as EstadoPedido;
      const pedidos = await servicioPedidos.obtenerPedidosPorEstado(estado);
      res.json({
        success: true,
        data: pedidos,
        total: pedidos.length
      });
    } catch (error) {
      console.error('Error al obtener pedidos por estado:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener pedidos por estado',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/pedidos - Crear nuevo pedido
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { idCliente, items, prioridad, direccionEntrega, fechaEntrega } = req.body;
      
      if (!idCliente || !items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos. Se requiere idCliente e items (array)'
        });
      }

      const pedido = await servicioPedidos.crearPedido(
        idCliente,
        items,
        prioridad || PrioridadPedido.NORMAL,
        direccionEntrega,
        fechaEntrega ? new Date(fechaEntrega) : undefined
      );

      res.status(201).json({
        success: true,
        data: pedido,
        message: 'Pedido creado exitosamente'
      });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear pedido',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/pedidos/:id/confirmar - Confirmar pedido
  router.put('/:id/confirmar', async (req: Request, res: Response) => {
    try {
      const pedido = await servicioPedidos.confirmarPedido(req.params.id);
      res.json({
        success: true,
        data: pedido,
        message: 'Pedido confirmado exitosamente'
      });
    } catch (error) {
      console.error('Error al confirmar pedido:', error);
      res.status(500).json({
        success: false,
        error: 'Error al confirmar pedido',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/pedidos/:id/estado - Actualizar estado del pedido
  router.put('/:id/estado', async (req: Request, res: Response) => {
    try {
      const { estado } = req.body;
      
      if (!estado) {
        return res.status(400).json({
          success: false,
          error: 'Estado requerido'
        });
      }

      const pedido = await servicioPedidos.actualizarEstado(req.params.id, estado as EstadoPedido);
      res.json({
        success: true,
        data: pedido,
        message: 'Estado actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar estado',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/pedidos/:id/ruta - Asignar pedido a ruta
  router.put('/:id/ruta', async (req: Request, res: Response) => {
    try {
      const { idRuta } = req.body;
      
      if (!idRuta) {
        return res.status(400).json({
          success: false,
          error: 'idRuta requerido'
        });
      }

      const pedido = await servicioPedidos.asignarARuta(req.params.id, idRuta);
      res.json({
        success: true,
        data: pedido,
        message: 'Pedido asignado a ruta exitosamente'
      });
    } catch (error) {
      console.error('Error al asignar pedido a ruta:', error);
      res.status(500).json({
        success: false,
        error: 'Error al asignar pedido a ruta',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE /api/pedidos/:id - Cancelar pedido
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const pedido = await servicioPedidos.cancelarPedido(req.params.id);
      res.json({
        success: true,
        data: pedido,
        message: 'Pedido cancelado exitosamente'
      });
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cancelar pedido',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}
