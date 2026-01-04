import { Pedido, EstadoPedido, ItemPedido, PrioridadPedido } from '../../domain/entities/Pedido';
import { IRepositorioPedidos } from '../../domain/repositories/IRepositorioPedidos';
import { DatabaseConnection } from '../database/DatabaseConnection';

/**
 * PostgreSQL Repository for Pedidos
 * Production-ready implementation with PostgreSQL
 */
export class RepositorioPedidosPostgres implements IRepositorioPedidos {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async guardar(pedido: Pedido): Promise<Pedido> {
    const client = await this.db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Check if pedido exists
      const existsResult = await client.query(
        'SELECT id FROM pedidos WHERE id = $1',
        [pedido.id]
      );
      
      if (existsResult.rows.length > 0) {
        // Update existing pedido
        await client.query(
          `UPDATE pedidos SET
            id_cliente = $1,
            estado = $2,
            prioridad = $3,
            monto_total = $4,
            direccion_entrega = $5,
            fecha_entrega = $6,
            fecha_actualizacion = $7,
            notas = $8,
            id_ruta_asignada = $9
          WHERE id = $10`,
          [
            pedido.idCliente,
            pedido.estado,
            pedido.prioridad,
            pedido.montoTotal,
            pedido.direccionEntrega,
            pedido.fechaEntrega,
            pedido.fechaActualizacion,
            pedido.notas,
            pedido.idRutaAsignada,
            pedido.id
          ]
        );
        
        // Delete existing items
        await client.query('DELETE FROM pedido_items WHERE id_pedido = $1', [pedido.id]);
      } else {
        // Insert new pedido
        await client.query(
          `INSERT INTO pedidos (
            id, id_cliente, estado, prioridad, monto_total,
            direccion_entrega, fecha_entrega, fecha_creacion,
            fecha_actualizacion, notas, id_ruta_asignada
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            pedido.id,
            pedido.idCliente,
            pedido.estado,
            pedido.prioridad,
            pedido.montoTotal,
            pedido.direccionEntrega,
            pedido.fechaEntrega,
            pedido.fechaCreacion,
            pedido.fechaActualizacion,
            pedido.notas,
            pedido.idRutaAsignada
          ]
        );
      }
      
      // Insert items
      for (const item of pedido.items) {
        await client.query(
          `INSERT INTO pedido_items (
            id_pedido, id_producto, nombre_producto, cantidad,
            precio_unitario, subtotal, notas
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            pedido.id,
            item.idProducto,
            item.nombreProducto,
            item.cantidad,
            item.precioUnitario,
            item.subtotal,
            item.notas
          ]
        );
      }
      
      await client.query('COMMIT');
      return pedido;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async buscarPorId(id: string): Promise<Pedido | null> {
    const result = await this.db.query(
      `SELECT p.*, 
        array_agg(
          json_build_object(
            'idProducto', pi.id_producto,
            'nombreProducto', pi.nombre_producto,
            'cantidad', pi.cantidad,
            'precioUnitario', pi.precio_unitario,
            'subtotal', pi.subtotal,
            'notas', pi.notas
          )
        ) as items
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id = pi.id_pedido
      WHERE p.id = $1
      GROUP BY p.id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapRowToPedido(result.rows[0]);
  }

  async obtenerTodos(): Promise<Pedido[]> {
    const result = await this.db.query(
      `SELECT p.*, 
        array_agg(
          json_build_object(
            'idProducto', pi.id_producto,
            'nombreProducto', pi.nombre_producto,
            'cantidad', pi.cantidad,
            'precioUnitario', pi.precio_unitario,
            'subtotal', pi.subtotal,
            'notas', pi.notas
          )
        ) FILTER (WHERE pi.id IS NOT NULL) as items
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id = pi.id_pedido
      GROUP BY p.id
      ORDER BY p.fecha_creacion DESC`
    );
    
    return result.rows.map(row => this.mapRowToPedido(row));
  }

  async buscarPorCliente(idCliente: string): Promise<Pedido[]> {
    const result = await this.db.query(
      `SELECT p.*, 
        array_agg(
          json_build_object(
            'idProducto', pi.id_producto,
            'nombreProducto', pi.nombre_producto,
            'cantidad', pi.cantidad,
            'precioUnitario', pi.precio_unitario,
            'subtotal', pi.subtotal,
            'notas', pi.notas
          )
        ) FILTER (WHERE pi.id IS NOT NULL) as items
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id = pi.id_pedido
      WHERE p.id_cliente = $1
      GROUP BY p.id
      ORDER BY p.fecha_creacion DESC`,
      [idCliente]
    );
    
    return result.rows.map(row => this.mapRowToPedido(row));
  }

  async buscarPorEstado(estado: EstadoPedido): Promise<Pedido[]> {
    const result = await this.db.query(
      `SELECT p.*, 
        array_agg(
          json_build_object(
            'idProducto', pi.id_producto,
            'nombreProducto', pi.nombre_producto,
            'cantidad', pi.cantidad,
            'precioUnitario', pi.precio_unitario,
            'subtotal', pi.subtotal,
            'notas', pi.notas
          )
        ) FILTER (WHERE pi.id IS NOT NULL) as items
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id = pi.id_pedido
      WHERE p.estado = $1
      GROUP BY p.id
      ORDER BY p.fecha_creacion DESC`,
      [estado]
    );
    
    return result.rows.map(row => this.mapRowToPedido(row));
  }

  async buscarPorRuta(idRuta: string): Promise<Pedido[]> {
    const result = await this.db.query(
      `SELECT p.*, 
        array_agg(
          json_build_object(
            'idProducto', pi.id_producto,
            'nombreProducto', pi.nombre_producto,
            'cantidad', pi.cantidad,
            'precioUnitario', pi.precio_unitario,
            'subtotal', pi.subtotal,
            'notas', pi.notas
          )
        ) FILTER (WHERE pi.id IS NOT NULL) as items
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id = pi.id_pedido
      WHERE p.id_ruta_asignada = $1
      GROUP BY p.id
      ORDER BY p.fecha_creacion DESC`,
      [idRuta]
    );
    
    return result.rows.map(row => this.mapRowToPedido(row));
  }

  async eliminar(id: string): Promise<void> {
    await this.db.query('DELETE FROM pedidos WHERE id = $1', [id]);
  }

  async buscarPorRangoFechas(fechaInicio: Date, fechaFin: Date): Promise<Pedido[]> {
    const result = await this.db.query(
      `SELECT p.*, 
        array_agg(
          json_build_object(
            'idProducto', pi.id_producto,
            'nombreProducto', pi.nombre_producto,
            'cantidad', pi.cantidad,
            'precioUnitario', pi.precio_unitario,
            'subtotal', pi.subtotal,
            'notas', pi.notas
          )
        ) FILTER (WHERE pi.id IS NOT NULL) as items
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id = pi.id_pedido
      WHERE p.fecha_creacion BETWEEN $1 AND $2
      GROUP BY p.id
      ORDER BY p.fecha_creacion DESC`,
      [fechaInicio, fechaFin]
    );
    
    return result.rows.map(row => this.mapRowToPedido(row));
  }

  /**
   * Map database row to Pedido entity
   */
  private mapRowToPedido(row: any): Pedido {
    const items: ItemPedido[] = row.items || [];
    
    return new Pedido(
      row.id,
      row.id_cliente,
      items,
      row.estado as EstadoPedido,
      row.prioridad as PrioridadPedido,
      parseFloat(row.monto_total),
      new Date(row.fecha_creacion),
      new Date(row.fecha_actualizacion),
      row.direccion_entrega,
      row.fecha_entrega ? new Date(row.fecha_entrega) : undefined,
      row.notas,
      row.id_ruta_asignada
    );
  }
}
