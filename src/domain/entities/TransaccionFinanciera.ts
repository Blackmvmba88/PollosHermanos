/**
 * Tipo de Transacción
 */
export enum TipoTransaccion {
  VENTA = 'VENTA',
  COMPRA = 'COMPRA',
  PAGO = 'PAGO',
  GASTO = 'GASTO',
  DEVOLUCION = 'DEVOLUCION'
}

/**
 * Método de Pago
 */
export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  CREDITO = 'CREDITO'
}

/**
 * Estado de Transacción
 */
export enum EstadoTransaccion {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA'
}

/**
 * Entidad Transacción Financiera - Registra todas las transacciones del negocio
 */
export class TransaccionFinanciera {
  constructor(
    public readonly id: string,
    public tipo: TipoTransaccion,
    public monto: number,
    public metodoPago: MetodoPago,
    public estado: EstadoTransaccion,
    public fecha: Date,
    public descripcion: string,
    public idRelacionado?: string, // ID del pedido, compra, etc.
    public idCliente?: string,
    public idProveedor?: string,
    public referencia?: string,
    public notas?: string
  ) {}

  /**
   * Completar la transacción
   */
  completar(): void {
    if (this.estado !== EstadoTransaccion.PENDIENTE) {
      throw new Error('Solo se pueden completar transacciones pendientes');
    }
    this.estado = EstadoTransaccion.COMPLETADA;
  }

  /**
   * Cancelar la transacción
   */
  cancelar(): void {
    if (this.estado === EstadoTransaccion.COMPLETADA) {
      throw new Error('No se pueden cancelar transacciones completadas');
    }
    this.estado = EstadoTransaccion.CANCELADA;
  }

  /**
   * Verificar si es una transacción de ingreso
   */
  esIngreso(): boolean {
    return this.tipo === TipoTransaccion.VENTA;
  }

  /**
   * Verificar si es una transacción de egreso
   */
  esEgreso(): boolean {
    return this.tipo === TipoTransaccion.COMPRA || 
           this.tipo === TipoTransaccion.GASTO ||
           this.tipo === TipoTransaccion.DEVOLUCION;
  }
}

/**
 * Resumen Financiero - Vista consolidada de las finanzas
 */
export interface ResumenFinanciero {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  transaccionesCompletadas: number;
  transaccionesPendientes: number;
  periodo: {
    fechaInicio: Date;
    fechaFin: Date;
  };
}
