/**
 * Tipo de activo productivo
 */
export enum TipoActivoProductivo {
  TERRENO = 'TERRENO',
  GALPONES = 'GALPONES',
  ANIMALES = 'ANIMALES',
  EQUIPAMIENTO = 'EQUIPAMIENTO',
  INFRAESTRUCTURA = 'INFRAESTRUCTURA'
}

/**
 * Estado de la oportunidad
 */
export enum EstadoOportunidad {
  ANALISIS = 'ANALISIS',
  PLANIFICADA = 'PLANIFICADA',
  EN_PROCESO = 'EN_PROCESO',
  IMPLEMENTADA = 'IMPLEMENTADA',
  DESCARTADA = 'DESCARTADA'
}

/**
 * Proyección de capacidad productiva
 */
export interface ProyeccionCapacidad {
  capacidadAnualKg: number;
  tiempoProduccionMeses: number;
  costosOperacionalesMensuales: number;
  ventaEstimadaMensual: number;
  puntoEquilibrio: number; // meses
}

/**
 * Evaluación financiera
 */
export interface EvaluacionFinanciera {
  inversionInicial: number;
  costoProduccionPropia: number;
  costoCompraExterna: number;
  ahorroEstimado: number;
  roi: number; // Return on Investment (%)
  periodoRetorno: number; // meses
  valorActualNeto: number; // VAN
  tasaInternaRetorno: number; // TIR (%)
}

/**
 * Oportunidad de Expansión - Planificación de integración vertical
 */
export class OportunidadExpansion {
  constructor(
    public readonly id: string,
    public nombre: string,
    public descripcion: string,
    public tipoActivo: TipoActivoProductivo,
    public estado: EstadoOportunidad,
    public fechaCreacion: Date,
    public proyeccion: ProyeccionCapacidad,
    public evaluacion: EvaluacionFinanciera,
    public ubicacion?: string,
    public fechaImplementacion?: Date,
    public notas?: string
  ) {}

  /**
   * Verificar si la oportunidad es viable financieramente
   */
  esViableFinancieramente(): boolean {
    return this.evaluacion.roi > 20 && 
           this.evaluacion.periodoRetorno <= 24 &&
           this.evaluacion.ahorroEstimado > 0;
  }

  /**
   * Calcular prioridad de implementación
   */
  calcularPrioridad(): number {
    let prioridad = 0;

    // ROI (40 puntos)
    if (this.evaluacion.roi >= 50) prioridad += 40;
    else if (this.evaluacion.roi >= 30) prioridad += 30;
    else if (this.evaluacion.roi >= 20) prioridad += 20;
    else prioridad += 10;

    // Periodo de retorno (30 puntos)
    if (this.evaluacion.periodoRetorno <= 12) prioridad += 30;
    else if (this.evaluacion.periodoRetorno <= 18) prioridad += 20;
    else if (this.evaluacion.periodoRetorno <= 24) prioridad += 10;
    else prioridad += 5;

    // Ahorro estimado (30 puntos)
    if (this.evaluacion.ahorroEstimado >= 10000000) prioridad += 30;
    else if (this.evaluacion.ahorroEstimado >= 5000000) prioridad += 20;
    else if (this.evaluacion.ahorroEstimado >= 1000000) prioridad += 10;
    else prioridad += 5;

    return prioridad;
  }

  /**
   * Actualizar estado de la oportunidad
   */
  actualizarEstado(nuevoEstado: EstadoOportunidad): void {
    this.estado = nuevoEstado;
    if (nuevoEstado === EstadoOportunidad.IMPLEMENTADA) {
      this.fechaImplementacion = new Date();
    }
  }

  /**
   * Actualizar evaluación financiera
   */
  actualizarEvaluacion(evaluacion: EvaluacionFinanciera): void {
    this.evaluacion = evaluacion;
  }

  /**
   * Comparar con compra externa
   */
  obtenerComparativaProduccion(): {
    produccionPropia: number;
    compraExterna: number;
    diferencia: number;
    ahorroPorcentaje: number;
  } {
    const diferencia = this.evaluacion.costoCompraExterna - this.evaluacion.costoProduccionPropia;
    const ahorroPorcentaje = (diferencia / this.evaluacion.costoCompraExterna) * 100;

    return {
      produccionPropia: this.evaluacion.costoProduccionPropia,
      compraExterna: this.evaluacion.costoCompraExterna,
      diferencia,
      ahorroPorcentaje
    };
  }

  /**
   * Verificar si está lista para implementar
   */
  estaListaParaImplementar(): boolean {
    return this.estado === EstadoOportunidad.PLANIFICADA && 
           this.esViableFinancieramente();
  }
}
