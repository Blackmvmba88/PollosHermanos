import { AnalisisCliente } from '../entities/AnalisisCliente';
import { OportunidadExpansion } from '../entities/OportunidadExpansion';

/**
 * Interfaz de Repositorio de Marketing y Expansión
 * Define las operaciones de persistencia para análisis de clientes y oportunidades
 */
export interface IRepositorioMarketing {
  // Análisis de Clientes
  guardarAnalisis(analisis: AnalisisCliente): Promise<AnalisisCliente>;
  obtenerAnalisisPorId(id: string): Promise<AnalisisCliente | null>;
  obtenerAnalisisPorCliente(idCliente: string): Promise<AnalisisCliente | null>;
  obtenerTodosAnalisis(): Promise<AnalisisCliente[]>;
  obtenerAnalisisPorPotencial(potencial: string): Promise<AnalisisCliente[]>;
  actualizarAnalisis(analisis: AnalisisCliente): Promise<AnalisisCliente>;
  eliminarAnalisis(id: string): Promise<void>;

  // Oportunidades de Expansión
  guardarOportunidad(oportunidad: OportunidadExpansion): Promise<OportunidadExpansion>;
  obtenerOportunidadPorId(id: string): Promise<OportunidadExpansion | null>;
  obtenerTodasOportunidades(): Promise<OportunidadExpansion[]>;
  obtenerOportunidadesPorEstado(estado: string): Promise<OportunidadExpansion[]>;
  obtenerOportunidadesPorTipo(tipo: string): Promise<OportunidadExpansion[]>;
  actualizarOportunidad(oportunidad: OportunidadExpansion): Promise<OportunidadExpansion>;
  eliminarOportunidad(id: string): Promise<void>;
}
