import { Pedido, EstadoPedido } from '../../domain/entities/Pedido';
import { IRepositorioPedidos } from '../../domain/repositories/IRepositorioPedidos';

/**
 * Repositorio en Memoria para Pedidos
 * Implementación para desarrollo y testing
 */
export class RepositorioPedidosMemoria implements IRepositorioPedidos {
  private pedidos: Map<string, Pedido> = new Map();

  async guardar(pedido: Pedido): Promise<Pedido> {
    this.pedidos.set(pedido.id, pedido);
    return pedido;
  }

  async buscarPorId(id: string): Promise<Pedido | null> {
    return this.pedidos.get(id) || null;
  }

  async obtenerTodos(): Promise<Pedido[]> {
    return Array.from(this.pedidos.values());
  }

  async buscarPorCliente(idCliente: string): Promise<Pedido[]> {
    return Array.from(this.pedidos.values()).filter(
      pedido => pedido.idCliente === idCliente
    );
  }

  async buscarPorEstado(estado: EstadoPedido): Promise<Pedido[]> {
    return Array.from(this.pedidos.values()).filter(
      pedido => pedido.estado === estado
    );
  }

  async buscarPorRuta(idRuta: string): Promise<Pedido[]> {
    return Array.from(this.pedidos.values()).filter(
      pedido => pedido.idRutaAsignada === idRuta
    );
  }

  async eliminar(id: string): Promise<void> {
    this.pedidos.delete(id);
  }

  async buscarPorRangoFechas(fechaInicio: Date, fechaFin: Date): Promise<Pedido[]> {
    return Array.from(this.pedidos.values()).filter(
      pedido => pedido.fechaCreacion >= fechaInicio && pedido.fechaCreacion <= fechaFin
    );
  }

  // Método auxiliar para limpiar el repositorio (útil para testing)
  limpiar(): void {
    this.pedidos.clear();
  }
}
