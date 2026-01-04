import { RutaEntrega, EstadoRuta } from '../entities/RutaEntrega';

/**
 * Interfaz del Repositorio de Rutas de Entrega
 * Define las operaciones de persistencia para rutas de entrega
 */
export interface IRepositorioRutas {
  /**
   * Guardar una nueva ruta o actualizar una existente
   */
  guardar(ruta: RutaEntrega): Promise<RutaEntrega>;

  /**
   * Buscar una ruta por su ID
   */
  buscarPorId(id: string): Promise<RutaEntrega | null>;

  /**
   * Obtener todas las rutas
   */
  obtenerTodas(): Promise<RutaEntrega[]>;

  /**
   * Buscar rutas por estado
   */
  buscarPorEstado(estado: EstadoRuta): Promise<RutaEntrega[]>;

  /**
   * Buscar rutas por conductor
   */
  buscarPorConductor(idConductor: string): Promise<RutaEntrega[]>;

  /**
   * Buscar rutas por fecha planificada
   */
  buscarPorFecha(fecha: Date): Promise<RutaEntrega[]>;

  /**
   * Eliminar una ruta
   */
  eliminar(id: string): Promise<void>;

  /**
   * Buscar rutas activas (planificadas o en progreso)
   */
  buscarActivas(): Promise<RutaEntrega[]>;
}
