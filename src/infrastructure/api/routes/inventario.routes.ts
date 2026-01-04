/**
 * REST API Routes for Inventario (Inventory)
 */

import { Router, Request, Response } from 'express';
import { ServicioInventario } from '../../../application/services/ServicioInventario';
import { CategoriaProducto, UnidadMedida } from '../../../domain/entities/ItemInventario';

export function crearRutasInventario(servicioInventario: ServicioInventario): Router {
  const router = Router();

  // Specific routes MUST come before parameterized routes

  // GET /api/inventario/reponer/lista - Obtener productos para reponer
  router.get('/reponer/lista', async (req: Request, res: Response) => {
    try {
      const productos = await servicioInventario.obtenerProductosParaReponer();
      res.json({
        success: true,
        data: productos,
        total: productos.length
      });
    } catch (error) {
      console.error('Error al obtener productos para reponer:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener productos para reponer',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/inventario - Obtener todos los productos
  router.get('/', async (req: Request, res: Response) => {
    try {
      const productos = await servicioInventario.obtenerTodos();
      res.json({
        success: true,
        data: productos,
        total: productos.length
      });
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener inventario',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/inventario/:id - Obtener producto por ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const productos = await servicioInventario.obtenerProductosParaReponer();
      res.json({
        success: true,
        data: productos,
        total: productos.length
      });
    } catch (error) {
      console.error('Error al obtener productos para reponer:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener productos para reponer',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/inventario - Agregar nuevo producto
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        nombreProducto,
        categoria,
        stockInicial,
        unidad,
        stockMinimo,
        stockMaximo,
        costoUnitario,
        precioVenta
      } = req.body;

      if (!nombreProducto || !categoria || stockInicial === undefined || !unidad) {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos. Se requiere: nombreProducto, categoria, stockInicial, unidad'
        });
      }

      const producto = await servicioInventario.agregarProducto(
        nombreProducto,
        categoria as CategoriaProducto,
        stockInicial,
        unidad as UnidadMedida,
        stockMinimo || 0,
        stockMaximo || 0,
        costoUnitario || 0,
        precioVenta || 0
      );

      res.status(201).json({
        success: true,
        data: producto,
        message: 'Producto agregado exitosamente'
      });
    } catch (error) {
      console.error('Error al agregar producto:', error);
      res.status(500).json({
        success: false,
        error: 'Error al agregar producto',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/inventario/:id/stock - Agregar stock a un producto
  router.put('/:id/stock', async (req: Request, res: Response) => {
    try {
      const { cantidad, numeroLote, fechaVencimiento } = req.body;

      if (cantidad === undefined || cantidad <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Cantidad inválida'
        });
      }

      const producto = await servicioInventario.agregarStock(
        req.params.id,
        cantidad,
        numeroLote,
        fechaVencimiento ? new Date(fechaVencimiento) : undefined
      );

      res.json({
        success: true,
        data: producto,
        message: 'Stock agregado exitosamente'
      });
    } catch (error) {
      console.error('Error al agregar stock:', error);
      res.status(500).json({
        success: false,
        error: 'Error al agregar stock',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/inventario/:id/descontar - Descontar stock de un producto
  router.put('/:id/descontar', async (req: Request, res: Response) => {
    try {
      const { cantidad } = req.body;

      if (cantidad === undefined || cantidad <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Cantidad inválida'
        });
      }

      const producto = await servicioInventario.retirarStock(
        req.params.id,
        cantidad
      );

      res.json({
        success: true,
        data: producto,
        message: 'Stock descontado exitosamente'
      });
    } catch (error) {
      console.error('Error al descontar stock:', error);
      res.status(500).json({
        success: false,
        error: 'Error al descontar stock',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/inventario/:id/precio - Actualizar precio de venta
  router.put('/:id/precio', async (req: Request, res: Response) => {
    try {
      const { precioVenta, costoUnitario } = req.body;

      if (precioVenta === undefined || precioVenta < 0) {
        return res.status(400).json({
          success: false,
          error: 'Precio inválido'
        });
      }

      const producto = await servicioInventario.actualizarPrecios(
        req.params.id,
        costoUnitario,
        precioVenta
      );

      res.json({
        success: true,
        data: producto,
        message: 'Precio actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar precio:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar precio',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/inventario/:id/disponibilidad - Verificar disponibilidad
  router.get('/:id/disponibilidad/:cantidad', async (req: Request, res: Response) => {
    try {
      const cantidad = parseFloat(req.params.cantidad);
      if (isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Cantidad inválida'
        });
      }

      const disponible = await servicioInventario.verificarDisponibilidad(
        req.params.id,
        cantidad
      );

      res.json({
        success: true,
        data: {
          disponible,
          cantidad
        }
      });
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar disponibilidad',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}
