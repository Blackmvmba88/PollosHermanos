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
    public numeroLote?: string
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
}
