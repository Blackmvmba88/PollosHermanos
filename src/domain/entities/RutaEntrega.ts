/**
 * Estado de la Ruta
 */
export enum EstadoRuta {
  PLANIFICADA = 'PLANIFICADA',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA'
}

/**
 * Parada de Entrega - Una parada individual en una ruta de entrega
 */
export interface ParadaEntrega {
  idPedido: string;
  idCliente: string;
  nombreCliente: string;
  direccion: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  llegadaEstimada?: Date;
  llegadaReal?: Date;
  completada: boolean;
  notas?: string;
  secuencia: number;
}

/**
 * Entidad Ruta de Entrega - Entidad principal del dominio para gestión de rutas de entrega
 */
export class RutaEntrega {
  constructor(
    public readonly id: string,
    public nombreRuta: string,
    public idConductor?: string,
    public nombreConductor?: string,
    public idVehiculo?: string,
    public paradas: ParadaEntrega[],
    public estado: EstadoRuta,
    public fechaPlanificada: Date,
    public horaInicio?: Date,
    public horaFin?: Date,
    public distanciaTotal?: number,
    public duracionEstimada?: number,
    public notas?: string
  ) {}

  /**
   * Agregar una parada a la ruta
   */
  agregarParada(parada: ParadaEntrega): void {
    parada.secuencia = this.paradas.length + 1;
    this.paradas.push(parada);
  }

  /**
   * Eliminar una parada de la ruta
   */
  eliminarParada(idPedido: string): void {
    this.paradas = this.paradas.filter(parada => parada.idPedido !== idPedido);
    this.resecuenciarParadas();
  }

  /**
   * Resecuenciar paradas después de eliminación o reordenamiento
   */
  private resecuenciarParadas(): void {
    this.paradas.forEach((parada, index) => {
      parada.secuencia = index + 1;
    });
  }

  /**
   * Iniciar la ruta
   */
  iniciar(): void {
    if (this.estado !== EstadoRuta.PLANIFICADA) {
      throw new Error('Solo se puede iniciar una ruta planificada');
    }
    this.estado = EstadoRuta.EN_PROGRESO;
    this.horaInicio = new Date();
  }

  /**
   * Completar la ruta
   */
  completar(): void {
    if (this.estado !== EstadoRuta.EN_PROGRESO) {
      throw new Error('Solo se puede completar una ruta que está en progreso');
    }
    const todasParadasCompletadas = this.paradas.every(parada => parada.completada);
    if (!todasParadasCompletadas) {
      throw new Error('No todas las paradas han sido completadas');
    }
    this.estado = EstadoRuta.COMPLETADA;
    this.horaFin = new Date();
  }

  /**
   * Marcar una parada como completada
   */
  completarParada(idPedido: string): void {
    const parada = this.paradas.find(p => p.idPedido === idPedido);
    if (!parada) {
      throw new Error('Parada no encontrada en la ruta');
    }
    parada.completada = true;
    parada.llegadaReal = new Date();
  }

  /**
   * Obtener la siguiente parada pendiente
   */
  obtenerSiguienteParada(): ParadaEntrega | undefined {
    return this.paradas.find(parada => !parada.completada);
  }

  /**
   * Obtener el número de paradas completadas
   */
  obtenerNumeroParadasCompletadas(): number {
    return this.paradas.filter(parada => parada.completada).length;
  }

  /**
   * Obtener el número de paradas pendientes
   */
  obtenerNumeroParadasPendientes(): number {
    return this.paradas.filter(parada => !parada.completada).length;
  }

  /**
   * Calcular el porcentaje de progreso de la ruta
   */
  obtenerProgreso(): number {
    if (this.paradas.length === 0) return 0;
    return (this.obtenerNumeroParadasCompletadas() / this.paradas.length) * 100;
  }

  /**
   * Asignar conductor a la ruta
   */
  asignarConductor(idConductor: string, nombreConductor: string): void {
    this.idConductor = idConductor;
    this.nombreConductor = nombreConductor;
  }

  /**
   * Asignar vehículo a la ruta
   */
  asignarVehiculo(idVehiculo: string): void {
    this.idVehiculo = idVehiculo;
  }

  /**
   * Reordenar paradas (para optimización)
   */
  reordenarParadas(nuevoOrden: string[]): void {
    const paradasReordenadas: ParadaEntrega[] = [];
    nuevoOrden.forEach(idPedido => {
      const parada = this.paradas.find(p => p.idPedido === idPedido);
      if (parada) {
        paradasReordenadas.push(parada);
      }
    });
    this.paradas = paradasReordenadas;
    this.resecuenciarParadas();
  }
}
