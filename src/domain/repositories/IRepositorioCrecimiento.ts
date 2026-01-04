import { EtapaCrecimiento } from '../entities/EtapaCrecimiento';
import { NivelNegocio } from '../entities/ItemInventario';

/**
 * Interfaz del Repositorio de Crecimiento
 */
export interface IRepositorioCrecimiento {
  guardar(etapa: EtapaCrecimiento): Promise<EtapaCrecimiento>;
  buscarPorId(id: string): Promise<EtapaCrecimiento | null>;
  obtenerEtapaActual(): Promise<EtapaCrecimiento | null>;
  buscarPorNivel(nivel: NivelNegocio): Promise<EtapaCrecimiento[]>;
  obtenerHistorial(): Promise<EtapaCrecimiento[]>;
}
