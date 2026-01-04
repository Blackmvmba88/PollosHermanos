import { SubcategoriaPollo } from './ItemInventario';

/**
 * Configuración estándar de cortes de pollo
 */
export const CORTES_ESTANDAR = {
  PECHUGA: { porcentaje: 0.26, precioDefecto: 18000 },
  ALITAS: { porcentaje: 0.10, precioDefecto: 15000 },
  PIERNAS: { porcentaje: 0.24, precioDefecto: 14000 },
  MUSLOS: { porcentaje: 0.20, precioDefecto: 14000 },
  MENUDENCIAS: { porcentaje: 0.08, precioDefecto: 5000 },
  CARCASA: { porcentaje: 0.12, precioDefecto: 2000 }
};

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
        pesoGramos: pesoGramos * CORTES_ESTANDAR.PECHUGA.porcentaje,
        porcentaje: CORTES_ESTANDAR.PECHUGA.porcentaje * 100,
        costoAsignado: costoTotal * CORTES_ESTANDAR.PECHUGA.porcentaje,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.PECHUGA) || CORTES_ESTANDAR.PECHUGA.precioDefecto
      },
      {
        subcategoria: SubcategoriaPollo.ALITAS,
        pesoGramos: pesoGramos * CORTES_ESTANDAR.ALITAS.porcentaje,
        porcentaje: CORTES_ESTANDAR.ALITAS.porcentaje * 100,
        costoAsignado: costoTotal * CORTES_ESTANDAR.ALITAS.porcentaje,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.ALITAS) || CORTES_ESTANDAR.ALITAS.precioDefecto
      },
      {
        subcategoria: SubcategoriaPollo.PIERNAS,
        pesoGramos: pesoGramos * CORTES_ESTANDAR.PIERNAS.porcentaje,
        porcentaje: CORTES_ESTANDAR.PIERNAS.porcentaje * 100,
        costoAsignado: costoTotal * CORTES_ESTANDAR.PIERNAS.porcentaje,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.PIERNAS) || CORTES_ESTANDAR.PIERNAS.precioDefecto
      },
      {
        subcategoria: SubcategoriaPollo.MUSLOS,
        pesoGramos: pesoGramos * CORTES_ESTANDAR.MUSLOS.porcentaje,
        porcentaje: CORTES_ESTANDAR.MUSLOS.porcentaje * 100,
        costoAsignado: costoTotal * CORTES_ESTANDAR.MUSLOS.porcentaje,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.MUSLOS) || CORTES_ESTANDAR.MUSLOS.precioDefecto
      },
      {
        subcategoria: SubcategoriaPollo.MENUDENCIAS,
        pesoGramos: pesoGramos * CORTES_ESTANDAR.MENUDENCIAS.porcentaje,
        porcentaje: CORTES_ESTANDAR.MENUDENCIAS.porcentaje * 100,
        costoAsignado: costoTotal * CORTES_ESTANDAR.MENUDENCIAS.porcentaje,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.MENUDENCIAS) || CORTES_ESTANDAR.MENUDENCIAS.precioDefecto
      },
      {
        subcategoria: SubcategoriaPollo.CARCASA,
        pesoGramos: pesoGramos * CORTES_ESTANDAR.CARCASA.porcentaje,
        porcentaje: CORTES_ESTANDAR.CARCASA.porcentaje * 100,
        costoAsignado: costoTotal * CORTES_ESTANDAR.CARCASA.porcentaje,
        precioVenta: preciosPorKg.get(SubcategoriaPollo.CARCASA) || CORTES_ESTANDAR.CARCASA.precioDefecto
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
