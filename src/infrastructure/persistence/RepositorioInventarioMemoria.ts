import { ItemInventario, NivelStock } from '../../domain/entities/ItemInventario';
import { IRepositorioInventario } from '../../domain/repositories/IRepositorioInventario';

/**
 * Repositorio en Memoria para Inventario
 * Implementación para desarrollo y testing
 */
export class RepositorioInventarioMemoria implements IRepositorioInventario {
  private items: Map<string, ItemInventario> = new Map();

  async guardar(item: ItemInventario): Promise<ItemInventario> {
    this.items.set(item.id, item);
    return item;
  }

  async buscarPorId(id: string): Promise<ItemInventario | null> {
    return this.items.get(id) || null;
  }

  async obtenerTodos(): Promise<ItemInventario[]> {
    return Array.from(this.items.values());
  }

  async buscarPorNivelStock(nivel: NivelStock): Promise<ItemInventario[]> {
    return Array.from(this.items.values()).filter(
      item => item.obtenerNivelStock() === nivel
    );
  }

  async buscarQueNecesitanReposicion(): Promise<ItemInventario[]> {
    return Array.from(this.items.values()).filter(
      item => item.necesitaReposicion()
    );
  }

  async buscarVencidos(): Promise<ItemInventario[]> {
    return Array.from(this.items.values()).filter(
      item => item.estaVencido()
    );
  }

  async eliminar(id: string): Promise<void> {
    this.items.delete(id);
  }

  async buscarPorNombre(nombre: string): Promise<ItemInventario[]> {
    const nombreLower = nombre.toLowerCase();
    return Array.from(this.items.values()).filter(
      item => item.nombreProducto.toLowerCase().includes(nombreLower)
    );
  }

  // Método auxiliar para limpiar el repositorio (útil para testing)
  limpiar(): void {
    this.items.clear();
  }
}
