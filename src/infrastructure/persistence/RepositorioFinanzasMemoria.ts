import { 
  TransaccionFinanciera, 
  TipoTransaccion, 
  EstadoTransaccion 
} from '../../domain/entities/TransaccionFinanciera';
import { IRepositorioFinanzas } from '../../domain/repositories/IRepositorioFinanzas';

/**
 * Repositorio en Memoria para Transacciones Financieras
 * Implementación para desarrollo y testing
 */
export class RepositorioFinanzasMemoria implements IRepositorioFinanzas {
  private transacciones: Map<string, TransaccionFinanciera> = new Map();

  async guardar(transaccion: TransaccionFinanciera): Promise<TransaccionFinanciera> {
    this.transacciones.set(transaccion.id, transaccion);
    return transaccion;
  }

  async buscarPorId(id: string): Promise<TransaccionFinanciera | null> {
    return this.transacciones.get(id) || null;
  }

  async obtenerTodas(): Promise<TransaccionFinanciera[]> {
    return Array.from(this.transacciones.values());
  }

  async buscarPorTipo(tipo: TipoTransaccion): Promise<TransaccionFinanciera[]> {
    return Array.from(this.transacciones.values()).filter(
      transaccion => transaccion.tipo === tipo
    );
  }

  async buscarPorEstado(estado: EstadoTransaccion): Promise<TransaccionFinanciera[]> {
    return Array.from(this.transacciones.values()).filter(
      transaccion => transaccion.estado === estado
    );
  }

  async buscarPorCliente(idCliente: string): Promise<TransaccionFinanciera[]> {
    return Array.from(this.transacciones.values()).filter(
      transaccion => transaccion.idCliente === idCliente
    );
  }

  async buscarPorRangoFechas(
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<TransaccionFinanciera[]> {
    return Array.from(this.transacciones.values()).filter(
      transaccion => transaccion.fecha >= fechaInicio && transaccion.fecha <= fechaFin
    );
  }

  async eliminar(id: string): Promise<void> {
    this.transacciones.delete(id);
  }

  // Método auxiliar para limpiar el repositorio (útil para testing)
  limpiar(): void {
    this.transacciones.clear();
  }
}
