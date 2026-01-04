import { 
  TransaccionFinanciera, 
  TipoTransaccion, 
  EstadoTransaccion, 
  MetodoPago,
  ResumenFinanciero
} from '../../domain/entities/TransaccionFinanciera';
import { IRepositorioFinanzas } from '../../domain/repositories/IRepositorioFinanzas';

/**
 * Servicio de Finanzas - Gestiona la lógica de negocio relacionada con transacciones financieras
 */
export class ServicioFinanzas {
  constructor(private repositorioFinanzas: IRepositorioFinanzas) {}

  /**
   * Registrar una nueva transacción
   */
  async registrarTransaccion(
    tipo: TipoTransaccion,
    monto: number,
    metodoPago: MetodoPago,
    descripcion: string,
    idRelacionado?: string,
    idCliente?: string,
    idProveedor?: string,
    referencia?: string,
    notas?: string
  ): Promise<TransaccionFinanciera> {
    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }

    const transaccion = new TransaccionFinanciera(
      this.generarId(),
      tipo,
      monto,
      metodoPago,
      EstadoTransaccion.PENDIENTE,
      new Date(),
      descripcion,
      idRelacionado,
      idCliente,
      idProveedor,
      referencia,
      notas
    );

    return await this.repositorioFinanzas.guardar(transaccion);
  }

  /**
   * Completar una transacción
   */
  async completarTransaccion(idTransaccion: string): Promise<TransaccionFinanciera> {
    const transaccion = await this.repositorioFinanzas.buscarPorId(idTransaccion);
    if (!transaccion) {
      throw new Error('Transacción no encontrada');
    }

    transaccion.completar();
    return await this.repositorioFinanzas.guardar(transaccion);
  }

  /**
   * Cancelar una transacción
   */
  async cancelarTransaccion(idTransaccion: string): Promise<TransaccionFinanciera> {
    const transaccion = await this.repositorioFinanzas.buscarPorId(idTransaccion);
    if (!transaccion) {
      throw new Error('Transacción no encontrada');
    }

    transaccion.cancelar();
    return await this.repositorioFinanzas.guardar(transaccion);
  }

  /**
   * Obtener transacciones por tipo
   */
  async obtenerPorTipo(tipo: TipoTransaccion): Promise<TransaccionFinanciera[]> {
    return await this.repositorioFinanzas.buscarPorTipo(tipo);
  }

  /**
   * Obtener transacciones por estado
   */
  async obtenerPorEstado(estado: EstadoTransaccion): Promise<TransaccionFinanciera[]> {
    return await this.repositorioFinanzas.buscarPorEstado(estado);
  }

  /**
   * Obtener transacciones por cliente
   */
  async obtenerPorCliente(idCliente: string): Promise<TransaccionFinanciera[]> {
    return await this.repositorioFinanzas.buscarPorCliente(idCliente);
  }

  /**
   * Obtener transacciones por rango de fechas
   */
  async obtenerPorRangoFechas(
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<TransaccionFinanciera[]> {
    return await this.repositorioFinanzas.buscarPorRangoFechas(fechaInicio, fechaFin);
  }

  /**
   * Generar resumen financiero para un período
   */
  async generarResumen(fechaInicio: Date, fechaFin: Date): Promise<ResumenFinanciero> {
    const transacciones = await this.obtenerPorRangoFechas(fechaInicio, fechaFin);
    
    const transaccionesCompletadas = transacciones.filter(
      t => t.estado === EstadoTransaccion.COMPLETADA
    );
    
    const totalIngresos = transaccionesCompletadas
      .filter(t => t.esIngreso())
      .reduce((sum, t) => sum + t.monto, 0);
    
    const totalEgresos = transaccionesCompletadas
      .filter(t => t.esEgreso())
      .reduce((sum, t) => sum + t.monto, 0);
    
    const transaccionesPendientes = transacciones.filter(
      t => t.estado === EstadoTransaccion.PENDIENTE
    ).length;

    return {
      totalIngresos,
      totalEgresos,
      balance: totalIngresos - totalEgresos,
      transaccionesCompletadas: transaccionesCompletadas.length,
      transaccionesPendientes,
      periodo: {
        fechaInicio,
        fechaFin
      }
    };
  }

  /**
   * Calcular ingresos totales
   */
  async calcularIngresosTotal(fechaInicio?: Date, fechaFin?: Date): Promise<number> {
    let transacciones: TransaccionFinanciera[];
    
    if (fechaInicio && fechaFin) {
      transacciones = await this.obtenerPorRangoFechas(fechaInicio, fechaFin);
    } else {
      transacciones = await this.repositorioFinanzas.obtenerTodas();
    }

    return transacciones
      .filter(t => t.esIngreso() && t.estado === EstadoTransaccion.COMPLETADA)
      .reduce((sum, t) => sum + t.monto, 0);
  }

  /**
   * Calcular egresos totales
   */
  async calcularEgresosTotal(fechaInicio?: Date, fechaFin?: Date): Promise<number> {
    let transacciones: TransaccionFinanciera[];
    
    if (fechaInicio && fechaFin) {
      transacciones = await this.obtenerPorRangoFechas(fechaInicio, fechaFin);
    } else {
      transacciones = await this.repositorioFinanzas.obtenerTodas();
    }

    return transacciones
      .filter(t => t.esEgreso() && t.estado === EstadoTransaccion.COMPLETADA)
      .reduce((sum, t) => sum + t.monto, 0);
  }

  /**
   * Calcular balance
   */
  async calcularBalance(fechaInicio?: Date, fechaFin?: Date): Promise<number> {
    const ingresos = await this.calcularIngresosTotal(fechaInicio, fechaFin);
    const egresos = await this.calcularEgresosTotal(fechaInicio, fechaFin);
    return ingresos - egresos;
  }

  /**
   * Obtener todas las transacciones
   */
  async obtenerTodas(): Promise<TransaccionFinanciera[]> {
    return await this.repositorioFinanzas.obtenerTodas();
  }

  /**
   * Obtener una transacción por ID
   */
  async obtenerPorId(id: string): Promise<TransaccionFinanciera | null> {
    return await this.repositorioFinanzas.buscarPorId(id);
  }

  /**
   * Generar un ID único (simplificado para el ejemplo)
   */
  private generarId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
