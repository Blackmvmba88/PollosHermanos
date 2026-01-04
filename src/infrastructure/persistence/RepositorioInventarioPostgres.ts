import { ItemInventario, CategoriaProducto, UnidadMedida, NivelStock } from '../../domain/entities/ItemInventario';
import { IRepositorioInventario } from '../../domain/repositories/IRepositorioInventario';
import { DatabaseConnection } from '../database/DatabaseConnection';

/**
 * PostgreSQL Repository for Inventario
 */
export class RepositorioInventarioPostgres implements IRepositorioInventario {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async guardar(item: ItemInventario): Promise<ItemInventario> {
    const existsResult = await this.db.query(
      'SELECT id FROM inventario WHERE id = $1',
      [item.id]
    );
    
    if (existsResult.rows.length > 0) {
      // Update
      await this.db.query(
        `UPDATE inventario SET
          nombre_producto = $1,
          categoria = $2,
          cantidad_actual = $3,
          unidad = $4,
          nivel_stock = $5,
          stock_minimo = $6,
          stock_maximo = $7,
          costo_unitario = $8,
          precio_venta = $9,
          numero_lote = $10,
          fecha_vencimiento = $11,
          fecha_ultimo_movimiento = $12
        WHERE id = $13`,
        [
          item.nombreProducto,
          item.categoria,
          item.stockActual,
          item.unidad,
          item.obtenerNivelStock(),
          item.nivelStockMinimo,
          item.nivelStockMaximo,
          item.costoUnitario,
          item.precioVenta,
          item.numeroLote,
          item.fechaVencimiento,
          item.fechaUltimaReposicion,
          item.id
        ]
      );
    } else {
      // Insert
      await this.db.query(
        `INSERT INTO inventario (
          id, nombre_producto, categoria, cantidad_actual, unidad,
          nivel_stock, stock_minimo, stock_maximo, costo_unitario,
          precio_venta, numero_lote, fecha_vencimiento, fecha_ultimo_movimiento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          item.id,
          item.nombreProducto,
          item.categoria,
          item.stockActual,
          item.unidad,
          item.obtenerNivelStock(),
          item.nivelStockMinimo,
          item.nivelStockMaximo,
          item.costoUnitario,
          item.precioVenta,
          item.numeroLote,
          item.fechaVencimiento,
          item.fechaUltimaReposicion
        ]
      );
    }
    
    return item;
  }

  async buscarPorId(id: string): Promise<ItemInventario | null> {
    const result = await this.db.query('SELECT * FROM inventario WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToItem(result.rows[0]);
  }

  async obtenerTodos(): Promise<ItemInventario[]> {
    const result = await this.db.query('SELECT * FROM inventario ORDER BY nombre_producto');
    return result.rows.map(row => this.mapRowToItem(row));
  }

  async buscarPorNivelStock(nivel: NivelStock): Promise<ItemInventario[]> {
    const result = await this.db.query(
      'SELECT * FROM inventario WHERE nivel_stock = $1 ORDER BY nombre_producto',
      [nivel]
    );
    return result.rows.map(row => this.mapRowToItem(row));
  }

  async buscarQueNecesitanReposicion(): Promise<ItemInventario[]> {
    const result = await this.db.query(
      'SELECT * FROM inventario WHERE cantidad_actual <= stock_minimo ORDER BY nombre_producto'
    );
    return result.rows.map(row => this.mapRowToItem(row));
  }

  async buscarVencidos(): Promise<ItemInventario[]> {
    const result = await this.db.query(
      'SELECT * FROM inventario WHERE fecha_vencimiento <= CURRENT_TIMESTAMP ORDER BY fecha_vencimiento'
    );
    return result.rows.map(row => this.mapRowToItem(row));
  }

  async eliminar(id: string): Promise<void> {
    await this.db.query('DELETE FROM inventario WHERE id = $1', [id]);
  }

  async buscarPorNombre(nombre: string): Promise<ItemInventario[]> {
    const result = await this.db.query(
      'SELECT * FROM inventario WHERE nombre_producto ILIKE $1 ORDER BY nombre_producto',
      [`%${nombre}%`]
    );
    return result.rows.map(row => this.mapRowToItem(row));
  }

  private mapRowToItem(row: any): ItemInventario {
    return new ItemInventario(
      row.id,
      row.nombre_producto,
      row.categoria as CategoriaProducto,
      parseFloat(row.cantidad_actual),
      row.unidad as UnidadMedida,
      parseFloat(row.stock_minimo),
      parseFloat(row.stock_maximo),
      parseFloat(row.costo_unitario),
      parseFloat(row.precio_venta),
      row.id_proveedor,
      row.fecha_ultimo_movimiento ? new Date(row.fecha_ultimo_movimiento) : undefined,
      row.fecha_vencimiento ? new Date(row.fecha_vencimiento) : undefined,
      row.numero_lote
    );
  }
}
