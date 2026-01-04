import { IRepositorioProcesamiento } from '../../domain/repositories/IRepositorioProcesamiento';
import { ProcesamientoPollo } from '../../domain/entities/ProcesamientoPollo';

/**
 * Implementación en memoria del repositorio de procesamiento de pollo
 */
export class RepositorioProcesamientoMemoria implements IRepositorioProcesamiento {
  private procesamientos: Map<string, ProcesamientoPollo> = new Map();

  async guardar(procesamiento: ProcesamientoPollo): Promise<ProcesamientoPollo> {
    this.procesamientos.set(procesamiento.id, procesamiento);
    return procesamiento;
  }

  async buscarPorId(id: string): Promise<ProcesamientoPollo | null> {
    return this.procesamientos.get(id) || null;
  }

  async obtenerTodos(): Promise<ProcesamientoPollo[]> {
    return Array.from(this.procesamientos.values());
  }

  async buscarPorFecha(fechaInicio: Date, fechaFin: Date): Promise<ProcesamientoPollo[]> {
    return Array.from(this.procesamientos.values()).filter(p => 
      p.fechaProcesamiento >= fechaInicio && p.fechaProcesamiento <= fechaFin
    );
  }

  async buscarPorLote(numeroLote: string): Promise<ProcesamientoPollo[]> {
    return Array.from(this.procesamientos.values()).filter(p => 
      p.numeroLote === numeroLote
    );
  }

  async obtenerEstadisticas(): Promise<{
    totalProcesados: number;
    aprovechamientoPromedio: number;
    gananciaPromedioTotal: number;
  }> {
    const todos = Array.from(this.procesamientos.values());
    const totalProcesados = todos.length;

    if (totalProcesados === 0) {
      return {
        totalProcesados: 0,
        aprovechamientoPromedio: 0,
        gananciaPromedioTotal: 0
      };
    }

    const aprovechamientoPromedio = todos.reduce((sum, p) => 
      sum + p.calcularPorcentajeAprovechamiento(), 0
    ) / totalProcesados;

    const gananciaPromedioTotal = todos.reduce((sum, p) => 
      sum + p.calcularGananciaPotencial(), 0
    ) / totalProcesados;

    return {
      totalProcesados,
      aprovechamientoPromedio,
      gananciaPromedioTotal
    };
  }
}
