import { NivelNegocio } from './ItemInventario';

/**
 * Indicador de Crecimiento - Métricas que determinan si el negocio está listo para la siguiente etapa
 */
export interface IndicadorCrecimiento {
  nombre: string;
  valorActual: number;
  valorObjetivo: number;
  cumplido: boolean;
  descripcion: string;
}

/**
 * Recomendación de Crecimiento - Sugerencia del sistema para evolucionar
 */
export interface RecomendacionCrecimiento {
  tipo: 'INVERSION' | 'OPERACION' | 'PRODUCTO' | 'CLIENTE';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  titulo: string;
  descripcion: string;
  inversionEstimada?: number;
  retornoEstimado?: number;
  plazoMeses?: number;
}

/**
 * Entidad Etapa de Crecimiento - Representa el nivel actual del negocio y su progresión
 */
export class EtapaCrecimiento {
  constructor(
    public readonly id: string,
    public nivelActual: NivelNegocio,
    public fechaInicio: Date,
    public indicadores: IndicadorCrecimiento[],
    public recomendaciones: RecomendacionCrecimiento[],
    public capitalDisponible: number,
    public fechaUltimaEvaluacion: Date = new Date()
  ) {}

  /**
   * Calcular el progreso hacia la siguiente etapa (0-100%)
   */
  calcularProgreso(): number {
    if (this.indicadores.length === 0) return 0;
    
    const indicadoresCumplidos = this.indicadores.filter(i => i.cumplido).length;
    return (indicadoresCumplidos / this.indicadores.length) * 100;
  }

  /**
   * Verificar si está listo para avanzar a la siguiente etapa
   */
  listoParaSiguienteEtapa(): boolean {
    // Requiere que al menos 80% de los indicadores estén cumplidos
    return this.calcularProgreso() >= 80;
  }

  /**
   * Obtener la siguiente etapa recomendada
   */
  obtenerSiguienteEtapa(): NivelNegocio | null {
    const etapas = [
      NivelNegocio.ETAPA_1_INICIO,
      NivelNegocio.ETAPA_2_PROCESAMIENTO,
      NivelNegocio.ETAPA_3_PRODUCCION,
      NivelNegocio.ETAPA_4_INTEGRACION
    ];

    const indiceActual = etapas.indexOf(this.nivelActual);
    if (indiceActual === -1 || indiceActual === etapas.length - 1) {
      return null; // Ya está en la última etapa
    }

    return etapas[indiceActual + 1];
  }

  /**
   * Actualizar indicador específico
   */
  actualizarIndicador(nombre: string, valorActual: number): void {
    const indicador = this.indicadores.find(i => i.nombre === nombre);
    if (indicador) {
      indicador.valorActual = valorActual;
      indicador.cumplido = valorActual >= indicador.valorObjetivo;
    }
  }

  /**
   * Agregar recomendación
   */
  agregarRecomendacion(recomendacion: RecomendacionCrecimiento): void {
    this.recomendaciones.push(recomendacion);
  }

  /**
   * Avanzar a la siguiente etapa
   */
  avanzarEtapa(): NivelNegocio {
    if (!this.listoParaSiguienteEtapa()) {
      throw new Error('No se cumplen los requisitos para avanzar a la siguiente etapa');
    }

    const siguienteEtapa = this.obtenerSiguienteEtapa();
    if (!siguienteEtapa) {
      throw new Error('Ya se encuentra en la etapa más avanzada');
    }

    this.nivelActual = siguienteEtapa;
    this.fechaInicio = new Date();
    this.indicadores = []; // Se reinician para la nueva etapa
    this.recomendaciones = [];
    
    return this.nivelActual;
  }

  /**
   * Obtener descripción de la etapa actual
   */
  obtenerDescripcionEtapa(): string {
    const descripciones: Record<NivelNegocio, string> = {
      [NivelNegocio.ETAPA_1_INICIO]: 'Inicio Básico - Venta de Cortes Específicos',
      [NivelNegocio.ETAPA_2_PROCESAMIENTO]: 'Expansión - Compra y Procesamiento de Pollos Enteros',
      [NivelNegocio.ETAPA_3_PRODUCCION]: 'Consolidación - Producción y Venta de Pollos Asados',
      [NivelNegocio.ETAPA_4_INTEGRACION]: 'Integración Vertical - Producción Propia'
    };

    return descripciones[this.nivelActual] || 'Etapa Desconocida';
  }

  /**
   * Obtener capital requerido para siguiente etapa
   */
  obtenerCapitalRequeridoSiguienteEtapa(): number {
    const capitalPorEtapa: Record<NivelNegocio, number> = {
      [NivelNegocio.ETAPA_1_INICIO]: 0,
      [NivelNegocio.ETAPA_2_PROCESAMIENTO]: 5000000,   // $5M COP
      [NivelNegocio.ETAPA_3_PRODUCCION]: 15000000,      // $15M COP
      [NivelNegocio.ETAPA_4_INTEGRACION]: 50000000      // $50M COP
    };

    const siguienteEtapa = this.obtenerSiguienteEtapa();
    return siguienteEtapa ? capitalPorEtapa[siguienteEtapa] : 0;
  }

  /**
   * Verificar si tiene capital suficiente para siguiente etapa
   */
  tieneCapitalSuficiente(): boolean {
    return this.capitalDisponible >= this.obtenerCapitalRequeridoSiguienteEtapa();
  }

  /**
   * Obtener resumen del estado actual
   */
  obtenerResumen(): {
    etapa: string;
    progreso: number;
    listoParaAvanzar: boolean;
    capitalDisponible: number;
    capitalRequerido: number;
    indicadoresCumplidos: number;
    totalIndicadores: number;
    recomendacionesPendientes: number;
  } {
    return {
      etapa: this.obtenerDescripcionEtapa(),
      progreso: this.calcularProgreso(),
      listoParaAvanzar: this.listoParaSiguienteEtapa(),
      capitalDisponible: this.capitalDisponible,
      capitalRequerido: this.obtenerCapitalRequeridoSiguienteEtapa(),
      indicadoresCumplidos: this.indicadores.filter(i => i.cumplido).length,
      totalIndicadores: this.indicadores.length,
      recomendacionesPendientes: this.recomendaciones.length
    };
  }
}
