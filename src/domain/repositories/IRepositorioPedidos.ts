import { Pedido } from '../entities/Pedido';
import { EstadoPedido } from '../entities/Pedido';

/**
 * Interfaz del Repositorio de Pedidos
 * Define las operaciones de persistencia para los pedidos
 */
export interface IRepositorioPedidos {
  /**
   * Guardar un nuevo pedido o actualizar uno existente
   */
  guardar(pedido: Pedido): Promise<Pedido>;

  /**
   * Buscar un pedido por su ID
   */
  buscarPorId(id: string): Promise<Pedido | null>;

  /**
   * Obtener todos los pedidos
   */
  obtenerTodos(): Promise<Pedido[]>;

  /**
   * Buscar pedidos por cliente
   */
  buscarPorCliente(idCliente: string): Promise<Pedido[]>;

  /**
   * Buscar pedidos por estado
   */
  buscarPorEstado(estado: EstadoPedido): Promise<Pedido[]>;

  /**
   * Buscar pedidos por ruta asignada
   */
  buscarPorRuta(idRuta: string): Promise<Pedido[]>;

  /**
   * Eliminar un pedido
   */
  eliminar(id: string): Promise<void>;

  /**
   * Buscar pedidos por rango de fechas
   */
  buscarPorRangoFechas(fechaInicio: Date, fechaFin: Date): Promise<Pedido[]>;
}
