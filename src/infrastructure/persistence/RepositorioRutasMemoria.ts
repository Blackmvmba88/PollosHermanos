import { RutaEntrega, EstadoRuta } from '../../domain/entities/RutaEntrega';
import { IRepositorioRutas } from '../../domain/repositories/IRepositorioRutas';

/**
 * Repositorio en Memoria para Rutas de Entrega
 * Implementación para desarrollo y testing
 */
export class RepositorioRutasMemoria implements IRepositorioRutas {
  private rutas: Map<string, RutaEntrega> = new Map();

  async guardar(ruta: RutaEntrega): Promise<RutaEntrega> {
    this.rutas.set(ruta.id, ruta);
    return ruta;
  }

  async buscarPorId(id: string): Promise<RutaEntrega | null> {
    return this.rutas.get(id) || null;
  }

  async obtenerTodas(): Promise<RutaEntrega[]> {
    return Array.from(this.rutas.values());
  }

  async buscarPorEstado(estado: EstadoRuta): Promise<RutaEntrega[]> {
    return Array.from(this.rutas.values()).filter(
      ruta => ruta.estado === estado
    );
  }

  async buscarPorConductor(idConductor: string): Promise<RutaEntrega[]> {
    return Array.from(this.rutas.values()).filter(
      ruta => ruta.idConductor === idConductor
    );
  }

  async buscarPorFecha(fecha: Date): Promise<RutaEntrega[]> {
    return Array.from(this.rutas.values()).filter(
      ruta => {
        const fechaRuta = new Date(ruta.fechaPlanificada);
        return fechaRuta.toDateString() === fecha.toDateString();
      }
    );
  }

  async eliminar(id: string): Promise<void> {
    this.rutas.delete(id);
  }

  async buscarActivas(): Promise<RutaEntrega[]> {
    return Array.from(this.rutas.values()).filter(
      ruta => ruta.estado === EstadoRuta.PLANIFICADA || ruta.estado === EstadoRuta.EN_PROGRESO
    );
  }

  // Método auxiliar para limpiar el repositorio (útil para testing)
  limpiar(): void {
    this.rutas.clear();
  }
}
