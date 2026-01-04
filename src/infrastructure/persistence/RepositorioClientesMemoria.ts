import { Cliente, EstadoCliente } from '../../domain/entities/Cliente';
import { IRepositorioClientes } from '../../domain/repositories/IRepositorioClientes';

/**
 * Repositorio en Memoria para Clientes
 * Implementación para desarrollo y testing
 */
export class RepositorioClientesMemoria implements IRepositorioClientes {
  private clientes: Map<string, Cliente> = new Map();

  async guardar(cliente: Cliente): Promise<Cliente> {
    this.clientes.set(cliente.id, cliente);
    return cliente;
  }

  async buscarPorId(id: string): Promise<Cliente | null> {
    return this.clientes.get(id) || null;
  }

  async obtenerTodos(): Promise<Cliente[]> {
    return Array.from(this.clientes.values());
  }

  async buscarPorEstado(estado: EstadoCliente): Promise<Cliente[]> {
    return Array.from(this.clientes.values()).filter(
      cliente => cliente.estado === estado
    );
  }

  async buscarPorNombre(nombre: string): Promise<Cliente[]> {
    const nombreLower = nombre.toLowerCase();
    return Array.from(this.clientes.values()).filter(
      cliente => cliente.nombre.toLowerCase().includes(nombreLower)
    );
  }

  async buscarPorTelefono(telefono: string): Promise<Cliente[]> {
    return Array.from(this.clientes.values()).filter(
      cliente => cliente.contacto.telefono === telefono
    );
  }

  async eliminar(id: string): Promise<void> {
    this.clientes.delete(id);
  }

  async buscarConSaldoPendiente(): Promise<Cliente[]> {
    return Array.from(this.clientes.values()).filter(
      cliente => cliente.saldoActual > 0
    );
  }

  // Método auxiliar para limpiar el repositorio (útil para testing)
  limpiar(): void {
    this.clientes.clear();
  }
}
