import { IRepositorioCrecimiento } from '../../domain/repositories/IRepositorioCrecimiento';
import { EtapaCrecimiento } from '../../domain/entities/EtapaCrecimiento';
import { NivelNegocio } from '../../domain/entities/ItemInventario';

/**
 * Implementación en memoria del repositorio de crecimiento
 */
export class RepositorioCrecimientoMemoria implements IRepositorioCrecimiento {
  private etapas: Map<string, EtapaCrecimiento> = new Map();

  async guardar(etapa: EtapaCrecimiento): Promise<EtapaCrecimiento> {
    this.etapas.set(etapa.id, etapa);
    return etapa;
  }

  async buscarPorId(id: string): Promise<EtapaCrecimiento | null> {
    return this.etapas.get(id) || null;
  }

  async obtenerEtapaActual(): Promise<EtapaCrecimiento | null> {
    // Retorna la etapa más reciente
    const todasEtapas = Array.from(this.etapas.values());
    if (todasEtapas.length === 0) return null;
    
    return todasEtapas.reduce((masReciente, actual) => {
      return actual.fechaInicio > masReciente.fechaInicio ? actual : masReciente;
    });
  }

  async buscarPorNivel(nivel: NivelNegocio): Promise<EtapaCrecimiento[]> {
    return Array.from(this.etapas.values()).filter(e => e.nivelActual === nivel);
  }

  async obtenerHistorial(): Promise<EtapaCrecimiento[]> {
    return Array.from(this.etapas.values()).sort((a, b) => 
      b.fechaInicio.getTime() - a.fechaInicio.getTime()
    );
  }
}
