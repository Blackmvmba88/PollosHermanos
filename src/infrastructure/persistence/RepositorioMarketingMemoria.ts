import { IRepositorioMarketing } from '../../domain/repositories/IRepositorioMarketing';
import { AnalisisCliente } from '../../domain/entities/AnalisisCliente';
import { OportunidadExpansion } from '../../domain/entities/OportunidadExpansion';

/**
 * Implementación en memoria del Repositorio de Marketing
 */
export class RepositorioMarketingMemoria implements IRepositorioMarketing {
  private analisis: Map<string, AnalisisCliente> = new Map();
  private oportunidades: Map<string, OportunidadExpansion> = new Map();

  // ========== Análisis de Clientes ==========

  async guardarAnalisis(analisis: AnalisisCliente): Promise<AnalisisCliente> {
    this.analisis.set(analisis.id, analisis);
    return analisis;
  }

  async obtenerAnalisisPorId(id: string): Promise<AnalisisCliente | null> {
    return this.analisis.get(id) || null;
  }

  async obtenerAnalisisPorCliente(idCliente: string): Promise<AnalisisCliente | null> {
    const analisisArray = Array.from(this.analisis.values());
    return analisisArray.find(a => a.idCliente === idCliente) || null;
  }

  async obtenerTodosAnalisis(): Promise<AnalisisCliente[]> {
    return Array.from(this.analisis.values());
  }

  async obtenerAnalisisPorPotencial(potencial: string): Promise<AnalisisCliente[]> {
    return Array.from(this.analisis.values())
      .filter(a => a.potencialConversion === potencial);
  }

  async actualizarAnalisis(analisis: AnalisisCliente): Promise<AnalisisCliente> {
    if (!this.analisis.has(analisis.id)) {
      throw new Error(`Análisis con ID ${analisis.id} no encontrado`);
    }
    this.analisis.set(analisis.id, analisis);
    return analisis;
  }

  async eliminarAnalisis(id: string): Promise<void> {
    this.analisis.delete(id);
  }

  // ========== Oportunidades de Expansión ==========

  async guardarOportunidad(oportunidad: OportunidadExpansion): Promise<OportunidadExpansion> {
    this.oportunidades.set(oportunidad.id, oportunidad);
    return oportunidad;
  }

  async obtenerOportunidadPorId(id: string): Promise<OportunidadExpansion | null> {
    return this.oportunidades.get(id) || null;
  }

  async obtenerTodasOportunidades(): Promise<OportunidadExpansion[]> {
    return Array.from(this.oportunidades.values());
  }

  async obtenerOportunidadesPorEstado(estado: string): Promise<OportunidadExpansion[]> {
    return Array.from(this.oportunidades.values())
      .filter(o => o.estado === estado);
  }

  async obtenerOportunidadesPorTipo(tipo: string): Promise<OportunidadExpansion[]> {
    return Array.from(this.oportunidades.values())
      .filter(o => o.tipoActivo === tipo);
  }

  async actualizarOportunidad(oportunidad: OportunidadExpansion): Promise<OportunidadExpansion> {
    if (!this.oportunidades.has(oportunidad.id)) {
      throw new Error(`Oportunidad con ID ${oportunidad.id} no encontrada`);
    }
    this.oportunidades.set(oportunidad.id, oportunidad);
    return oportunidad;
  }

  async eliminarOportunidad(id: string): Promise<void> {
    this.oportunidades.delete(id);
  }
}
