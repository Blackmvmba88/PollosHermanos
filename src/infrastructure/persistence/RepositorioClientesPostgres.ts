import { Cliente, TipoCliente, EstadoCliente, InfoContacto, Direccion } from '../../domain/entities/Cliente';
import { IRepositorioClientes } from '../../domain/repositories/IRepositorioClientes';
import { DatabaseConnection } from '../database/DatabaseConnection';

/**
 * PostgreSQL Repository for Clientes
 */
export class RepositorioClientesPostgres implements IRepositorioClientes {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async guardar(cliente: Cliente): Promise<Cliente> {
    const direccionesStr = cliente.direcciones.map(d => JSON.stringify(d));
    
    const existsResult = await this.db.query(
      'SELECT id FROM clientes WHERE id = $1',
      [cliente.id]
    );
    
    if (existsResult.rows.length > 0) {
      // Update
      await this.db.query(
        `UPDATE clientes SET
          nombre = $1,
          tipo = $2,
          estado = $3,
          telefono = $4,
          email = $5,
          direcciones = $6,
          limite_credito = $7,
          saldo_pendiente = $8,
          total_compras = $9,
          fecha_ultima_compra = $10,
          notas = $11
        WHERE id = $12`,
        [
          cliente.nombre,
          cliente.tipo,
          cliente.estado,
          cliente.contacto.telefono,
          cliente.contacto.email,
          direccionesStr,
          cliente.limiteCredito || 0,
          cliente.saldoActual,
          cliente.totalGastado,
          cliente.fechaUltimoPedido,
          cliente.notas,
          cliente.id
        ]
      );
    } else {
      // Insert
      await this.db.query(
        `INSERT INTO clientes (
          id, nombre, tipo, estado, telefono, email, direcciones,
          limite_credito, saldo_pendiente, total_compras, fecha_registro,
          fecha_ultima_compra, notas
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          cliente.id,
          cliente.nombre,
          cliente.tipo,
          cliente.estado,
          cliente.contacto.telefono,
          cliente.contacto.email,
          direccionesStr,
          cliente.limiteCredito || 0,
          cliente.saldoActual,
          cliente.totalGastado,
          cliente.fechaCreacion,
          cliente.fechaUltimoPedido,
          cliente.notas
        ]
      );
    }
    
    return cliente;
  }

  async buscarPorId(id: string): Promise<Cliente | null> {
    const result = await this.db.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToCliente(result.rows[0]);
  }

  async obtenerTodos(): Promise<Cliente[]> {
    const result = await this.db.query('SELECT * FROM clientes ORDER BY nombre');
    return result.rows.map(row => this.mapRowToCliente(row));
  }

  async buscarPorEstado(estado: EstadoCliente): Promise<Cliente[]> {
    const result = await this.db.query(
      'SELECT * FROM clientes WHERE estado = $1 ORDER BY nombre',
      [estado]
    );
    return result.rows.map(row => this.mapRowToCliente(row));
  }

  async buscarPorNombre(nombre: string): Promise<Cliente[]> {
    const result = await this.db.query(
      'SELECT * FROM clientes WHERE nombre ILIKE $1 ORDER BY nombre',
      [`%${nombre}%`]
    );
    return result.rows.map(row => this.mapRowToCliente(row));
  }

  async buscarPorTelefono(telefono: string): Promise<Cliente[]> {
    const result = await this.db.query(
      'SELECT * FROM clientes WHERE telefono LIKE $1',
      [`%${telefono}%`]
    );
    return result.rows.map(row => this.mapRowToCliente(row));
  }

  async eliminar(id: string): Promise<void> {
    await this.db.query('DELETE FROM clientes WHERE id = $1', [id]);
  }

  async buscarConSaldoPendiente(): Promise<Cliente[]> {
    const result = await this.db.query(
      'SELECT * FROM clientes WHERE saldo_pendiente > 0 ORDER BY saldo_pendiente DESC'
    );
    return result.rows.map(row => this.mapRowToCliente(row));
  }

  private mapRowToCliente(row: any): Cliente {
    const direcciones: Direccion[] = (row.direcciones || []).map((d: string) => {
      if (typeof d === 'string') {
        return JSON.parse(d);
      }
      return d;
    });

    const contacto: InfoContacto = {
      telefono: row.telefono || '',
      email: row.email,
    };

    return new Cliente(
      row.id,
      row.nombre,
      row.tipo as TipoCliente,
      row.estado as EstadoCliente,
      contacto,
      direcciones,
      new Date(row.fecha_registro),
      row.fecha_ultima_compra ? new Date(row.fecha_ultima_compra) : undefined,
      parseInt(row.total_pedidos || '0'),
      parseFloat(row.total_compras || '0'),
      parseFloat(row.limite_credito || '0'),
      parseFloat(row.saldo_pendiente || '0'),
      row.notas
    );
  }
}
