import { SubcategoriaPollo } from './ItemInventario';

/**
 * Corte obtenido de un pollo entero procesado
 */
export interface CortePollo {
  subcategoria: SubcategoriaPollo;
  pesoGramos: number;
  porcentaje: number;
  costoAsignado: number;
  precioVenta: number;
  idProductoInventario?: string;
}

/**
 * Estadísticas de rendimiento de procesamiento
 */
export interface RendimientoProcesamiento {
  totalPollosProcesados: number;
  pesoPromedioPollo: number;
  porcentajeAprovechamiento: number;
  porcentajeDesperdicio: number;
  tiempoPromedioMinutos: number;
  costoPorKg: number;
  valorGeneradoPorKg: number;
}

/**
 * Entidad Procesamiento de Pollo - Representa el procesamiento de un pollo entero en cortes
 */
export class ProcesamientoPollo {
  constructor(
    public readonly id: string,
    public fechaProcesamiento: Date,
    public pesoTotalGramos: number,
    public costoTotal: number,
    public cortes: CortePollo[],
    public numeroLote?: string,
    public procesadoPor?: string,
    public tiempoProcesamientoMinutos?: number
  ) {}

  /**
   * Calcular el peso total de cortes obtenidos
   */
  calcularPesoTotalCortes(): number {
    return this.cortes.reduce((total, corte) => total + corte.pesoGramos, 0);
  }

  /**
   * Calcular el porcentaje de aprovechamiento
   */
  calcularPorcentajeAprovechamiento(): number {
    if (this.pesoTotalGramos === 0) return 0;
    return (this.calcularPesoTotalCortes() / this.pesoTotalGramos) * 100;
  }

  /**
   * Calcular el desperdicio
   */
  calcularDesperdicio(): number {
    return this.pesoTotalGramos - this.calcularPesoTotalCortes();
  }

  /**
   * Calcular porcentaje de desperdicio
   */
  calcularPorcentajeDesperdicio(): number {
    return 100 - this.calcularPorcentajeAprovechamiento();
  }

  /**
   * Calcular valor total generado por los cortes
   */
  calcularValorTotalGenerado(): number {
    return this.cortes.reduce((total, corte) => {
      const pesoKg = corte.pesoGramos / 1000;
      return total + (pesoKg * corte.precioVenta);
    }, 0);
  }

  /**
   * Calcular ganancia potencial
   */
  calcularGananciaPotencial(): number {
    return this.calcularValorTotalGenerado() - this.costoTotal;
  }

  /**
   * Calcular porcentaje de ganancia
   */
  calcularPorcentajeGanancia(): number {
    if (this.costoTotal === 0) return 0;
    return (this.calcularGananciaPotencial() / this.costoTotal) * 100;
  }

  /**
   * Obtener distribución de cortes (qué porcentaje representa cada corte)
   */
  obtenerDistribucionCortes(): Map<SubcategoriaPollo, number> {
    const distribucion = new Map<SubcategoriaPollo, number>();
    const pesoTotal = this.calcularPesoTotalCortes();

    this.cortes.forEach(corte => {
      const porcentaje = (corte.pesoGramos / pesoTotal) * 100;
      distribucion.set(corte.subcategoria, porcentaje);
    });

    return distribucion;
  }

  /**
   * Agregar un corte al procesamiento
   */
  agregarCorte(corte: CortePollo): void {
    this.cortes.push(corte);
  }

  /**
   * Validar que el procesamiento es eficiente (aprovechamiento >= 85%)
   */
  esProcesamientoEficiente(): boolean {
    return this.calcularPorcentajeAprovechamiento() >= 85;
  }

  /**
   * Obtener resumen del procesamiento
   */
  obtenerResumen(): {
    id: string;
    fecha: Date;
    pesoTotal: number;
    costo: number;
    cortesObtenidos: number;
    aprovechamiento: number;
    valorGenerado: number;
    ganancia: number;
    margen: number;
    eficiente: boolean;
  } {
    return {
      id: this.id,
      fecha: this.fechaProcesamiento,
      pesoTotal: this.pesoTotalGramos,
      costo: this.costoTotal,
      cortesObtenidos: this.cortes.length,
      aprovechamiento: this.calcularPorcentajeAprovechamiento(),
      valorGenerado: this.calcularValorTotalGenerado(),
      ganancia: this.calcularGananciaPotencial(),
      margen: this.calcularPorcentajeGanancia(),
      eficiente: this.esProcesamientoEficiente()
    };
  }

  /**
   * Crear un procesamiento estándar de pollo entero
   * Basado en las proporciones típicas de la filosofía de crecimiento
   */
  static crearProcesamientoEstandar(
    id: string,
    pesoGramos: number,
    costoTotal: number,
    preciosPorKg: Map<SubcategoriaPollo, number>
  ): ProcesamientoPollo {
    const cortes: CortePollo[] = [
      {
        subcategoria: SubcategoriaPollo.PECHUGA,
        pesoGramos: pesoGramos * 0.26,
        porcentaje: 26,
        costoAsignado: costoTotal * 0.26,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.PECHUGA) || 18000
      },
      {
        subcategoria: SubcategoriaPollo.ALITAS,
        pesoGramos: pesoGramos * 0.10,
        porcentaje: 10,
        costoAsignado: costoTotal * 0.10,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.ALITAS) || 15000
      },
      {
        subcategoria: SubcategoriaPollo.PIERNAS,
        pesoGramos: pesoGramos * 0.24,
        porcentaje: 24,
        costoAsignado: costoTotal * 0.24,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.PIERNAS) || 14000
      },
      {
        subcategoria: SubcategoriaPollo.MUSLOS,
        pesoGramos: pesoGramos * 0.20,
        porcentaje: 20,
        costoAsignado: costoTotal * 0.20,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.MUSLOS) || 14000
      },
      {
        subcategoria: SubcategoriaPollo.MENUDENCIAS,
        pesoGramos: pesoGramos * 0.08,
        porcentaje: 8,
        costoAsignado: costoTotal * 0.08,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.MENUDENCIAS) || 5000
      },
      {
        subcategoria: SubcategoriaPollo.CARCASA,
        pesoGramos: pesoGramos * 0.12,
        porcentaje: 12,
        costoAsignado: costoTotal * 0.12,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.CARCASA) || 2000
      }
    ];

    return new ProcesamientoPollo(
      id,
      new Date(),
      pesoGramos,
      costoTotal,
      cortes
    );
  }
}
