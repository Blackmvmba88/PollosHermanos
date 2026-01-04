import { ProcesamientoPollo } from '../entities/ProcesamientoPollo';

/**
 * Interfaz del Repositorio de Procesamiento de Pollo
 */
export interface IRepositorioProcesamiento {
  guardar(procesamiento: ProcesamientoPollo): Promise<ProcesamientoPollo>;
  buscarPorId(id: string): Promise<ProcesamientoPollo | null>;
  obtenerTodos(): Promise<ProcesamientoPollo[]>;
  buscarPorFecha(fechaInicio: Date, fechaFin: Date): Promise<ProcesamientoPollo[]>;
  buscarPorLote(numeroLote: string): Promise<ProcesamientoPollo[]>;
  obtenerEstadisticas(): Promise<{
    totalProcesados: number;
    aprovechamientoPromedio: number;
    gananciaPromedioTotal: number;
  }>;
}
