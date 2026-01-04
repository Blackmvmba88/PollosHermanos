/**
 * Categoría de Producto para clasificación del inventario
 */
export enum CategoriaProducto {
  POLLO = 'POLLO',
  HUEVOS = 'HUEVOS',
  PROCESADOS = 'PROCESADOS',
  INSUMOS = 'INSUMOS',
  OTROS = 'OTROS'
}

/**
 * Subcategoría de Pollo - Para aprovechamiento total según filosofía de crecimiento
 */
export enum SubcategoriaPollo {
  // Productos Premium
  POLLO_ENTERO = 'POLLO_ENTERO',
  PECHUGA = 'PECHUGA',
  ALITAS = 'ALITAS',
  PIERNAS = 'PIERNAS',
  
  // Productos Estándar
  MUSLOS = 'MUSLOS',
  CONTRAMUSLOS = 'CONTRAMUSLOS',
  RABADILLA = 'RABADILLA',
  
  // Subproductos
  MENUDENCIAS = 'MENUDENCIAS',
  HIGADO = 'HIGADO',
  MOLLEJA = 'MOLLEJA',
  CORAZON = 'CORAZON',
  
  // Para caldo y derivados
  CARCASA = 'CARCASA',
  HUESOS = 'HUESOS',
  
  // Productos procesados
  POLLO_ASADO = 'POLLO_ASADO',
  CHICHARRON = 'CHICHARRON',
  CALDO = 'CALDO'
}

/**
 * Nivel de Negocio - Etapas de crecimiento progresivo
 */
export enum NivelNegocio {
  ETAPA_1_INICIO = 'ETAPA_1_INICIO',                    // Venta de cortes específicos
  ETAPA_2_PROCESAMIENTO = 'ETAPA_2_PROCESAMIENTO',      // Compra y procesamiento de pollos enteros
  ETAPA_3_PRODUCCION = 'ETAPA_3_PRODUCCION',            // Producción de pollos asados
  ETAPA_4_INTEGRACION = 'ETAPA_4_INTEGRACION'           // Producción propia (granja)
}

/**
 * Nivel de Alerta de Stock
 */
export enum NivelStock {
  SIN_STOCK = 'SIN_STOCK',
  STOCK_BAJO = 'STOCK_BAJO',
  NORMAL = 'NORMAL',
  SOBRESTOCK = 'SOBRESTOCK'
}

/**
 * Unidad de Medida
 */
export enum UnidadMedida {
  KG = 'KG',
  UNIDAD = 'UNIDAD',
  PAQUETE = 'PAQUETE',
  DOCENA = 'DOCENA'
}

/**
 * Entidad Item de Inventario - Entidad principal del dominio para gestión de inventario
 */
export class ItemInventario {
  constructor(
    public readonly id: string,
    public nombreProducto: string,
    public categoria: CategoriaProducto,
    public stockActual: number,
    public unidad: UnidadMedida,
    public nivelStockMinimo: number,
    public nivelStockMaximo: number,
    public costoUnitario: number,
    public precioVenta: number,
    public idProveedor?: string,
    public fechaUltimaReposicion?: Date,
    public fechaVencimiento?: Date,
    public numeroLote?: string,
    public subcategoria?: SubcategoriaPollo,
    public idPolloOrigen?: string  // Para rastrear de qué pollo entero proviene un corte
  ) {}

  /**
   * Obtener el nivel actual de stock
   */
  obtenerNivelStock(): NivelStock {
    if (this.stockActual <= 0) {
      return NivelStock.SIN_STOCK;
    } else if (this.stockActual < this.nivelStockMinimo) {
      return NivelStock.STOCK_BAJO;
    } else if (this.stockActual > this.nivelStockMaximo) {
      return NivelStock.SOBRESTOCK;
    }
    return NivelStock.NORMAL;
  }

  /**
   * Agregar stock al inventario
   */
  agregarStock(cantidad: number, numeroLote?: string, fechaVencimiento?: Date): void {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser positiva');
    }
    this.stockActual += cantidad;
    this.fechaUltimaReposicion = new Date();
    if (numeroLote) this.numeroLote = numeroLote;
    if (fechaVencimiento) this.fechaVencimiento = fechaVencimiento;
  }

  /**
   * Retirar stock del inventario
   */
  retirarStock(cantidad: number): void {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser positiva');
    }
    if (cantidad > this.stockActual) {
      throw new Error('Stock insuficiente disponible');
    }
    this.stockActual -= cantidad;
  }

  /**
   * Verificar si hay stock disponible
   */
  hayDisponible(cantidad: number): boolean {
    return this.stockActual >= cantidad;
  }

  /**
   * Verificar si el item necesita reposición
   */
  necesitaReposicion(): boolean {
    return this.obtenerNivelStock() === NivelStock.STOCK_BAJO || 
           this.obtenerNivelStock() === NivelStock.SIN_STOCK;
  }

  /**
   * Verificar si el item está vencido
   */
  estaVencido(): boolean {
    if (!this.fechaVencimiento) return false;
    return this.fechaVencimiento < new Date();
  }

  /**
   * Calcular el valor del inventario
   */
  calcularValor(): number {
    return this.stockActual * this.costoUnitario;
  }

  /**
   * Calcular ganancia potencial
   */
  calcularGananciaPotencial(): number {
    return this.stockActual * (this.precioVenta - this.costoUnitario);
  }

  /**
   * Verificar si es un producto de pollo
   */
  esProductoPollo(): boolean {
    return this.categoria === CategoriaProducto.POLLO;
  }

  /**
   * Obtener porcentaje de margen
   */
  calcularPorcentajeMargen(): number {
    if (this.costoUnitario === 0) return 0;
    return ((this.precioVenta - this.costoUnitario) / this.costoUnitario) * 100;
  }
}
