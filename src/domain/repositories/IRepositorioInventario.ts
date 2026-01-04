import { ItemInventario, NivelStock } from '../entities/ItemInventario';

/**
 * Interfaz del Repositorio de Inventario
 * Define las operaciones de persistencia para items de inventario
 */
export interface IRepositorioInventario {
  /**
   * Guardar un nuevo item o actualizar uno existente
   */
  guardar(item: ItemInventario): Promise<ItemInventario>;

  /**
   * Buscar un item por su ID
   */
  buscarPorId(id: string): Promise<ItemInventario | null>;

  /**
   * Obtener todos los items
   */
  obtenerTodos(): Promise<ItemInventario[]>;

  /**
   * Buscar items por nivel de stock
   */
  buscarPorNivelStock(nivel: NivelStock): Promise<ItemInventario[]>;

  /**
   * Buscar items que necesitan reposición
   */
  buscarQueNecesitanReposicion(): Promise<ItemInventario[]>;

  /**
   * Buscar items vencidos o próximos a vencer
   */
  buscarVencidos(): Promise<ItemInventario[]>;

  /**
   * Eliminar un item
   */
  eliminar(id: string): Promise<void>;

  /**
   * Buscar items por nombre (búsqueda parcial)
   */
  buscarPorNombre(nombre: string): Promise<ItemInventario[]>;
}
