import { TransaccionFinanciera, TipoTransaccion, EstadoTransaccion } from '../entities/TransaccionFinanciera';

/**
 * Interfaz del Repositorio de Transacciones Financieras
 * Define las operaciones de persistencia para transacciones
 */
export interface IRepositorioFinanzas {
  /**
   * Guardar una nueva transacción o actualizar una existente
   */
  guardar(transaccion: TransaccionFinanciera): Promise<TransaccionFinanciera>;

  /**
   * Buscar una transacción por su ID
   */
  buscarPorId(id: string): Promise<TransaccionFinanciera | null>;

  /**
   * Obtener todas las transacciones
   */
  obtenerTodas(): Promise<TransaccionFinanciera[]>;

  /**
   * Buscar transacciones por tipo
   */
  buscarPorTipo(tipo: TipoTransaccion): Promise<TransaccionFinanciera[]>;

  /**
   * Buscar transacciones por estado
   */
  buscarPorEstado(estado: EstadoTransaccion): Promise<TransaccionFinanciera[]>;

  /**
   * Buscar transacciones por cliente
   */
  buscarPorCliente(idCliente: string): Promise<TransaccionFinanciera[]>;

  /**
   * Buscar transacciones por rango de fechas
   */
  buscarPorRangoFechas(fechaInicio: Date, fechaFin: Date): Promise<TransaccionFinanciera[]>;

  /**
   * Eliminar una transacción
   */
  eliminar(id: string): Promise<void>;
}
