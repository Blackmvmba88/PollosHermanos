import { Cliente, EstadoCliente } from '../entities/Cliente';

/**
 * Interfaz del Repositorio de Clientes
 * Define las operaciones de persistencia para clientes
 */
export interface IRepositorioClientes {
  /**
   * Guardar un nuevo cliente o actualizar uno existente
   */
  guardar(cliente: Cliente): Promise<Cliente>;

  /**
   * Buscar un cliente por su ID
   */
  buscarPorId(id: string): Promise<Cliente | null>;

  /**
   * Obtener todos los clientes
   */
  obtenerTodos(): Promise<Cliente[]>;

  /**
   * Buscar clientes por estado
   */
  buscarPorEstado(estado: EstadoCliente): Promise<Cliente[]>;

  /**
   * Buscar clientes por nombre (búsqueda parcial)
   */
  buscarPorNombre(nombre: string): Promise<Cliente[]>;

  /**
   * Buscar clientes por teléfono
   */
  buscarPorTelefono(telefono: string): Promise<Cliente[]>;

  /**
   * Eliminar un cliente
   */
  eliminar(id: string): Promise<void>;

  /**
   * Buscar clientes con saldo pendiente
   */
  buscarConSaldoPendiente(): Promise<Cliente[]>;
}
