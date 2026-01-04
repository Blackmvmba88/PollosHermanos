/**
 * Estado del Pedido - representa el estado actual de un pedido en el sistema
 */
export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  PREPARANDO = 'PREPARANDO',
  LISTO_PARA_ENTREGA = 'LISTO_PARA_ENTREGA',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

/**
 * Prioridad del Pedido para la programación de entregas
 */
export enum PrioridadPedido {
  NORMAL = 'NORMAL',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

/**
 * Item del Pedido - representa un producto individual en un pedido
 */
export interface ItemPedido {
  idProducto: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas?: string;
}

/**
 * Entidad Pedido - Entidad principal del dominio para gestión de pedidos
 */
export class Pedido {
  constructor(
    public readonly id: string,
    public idCliente: string,
    public items: ItemPedido[],
    public estado: EstadoPedido,
    public prioridad: PrioridadPedido,
    public montoTotal: number,
    public fechaCreacion: Date,
    public fechaActualizacion: Date,
    public direccionEntrega?: string,
    public fechaEntrega?: Date,
    public notas?: string,
    public idRutaAsignada?: string
  ) {}

  /**
   * Calcular el monto total del pedido
   */
  calcularTotal(): number {
    return this.items.reduce((suma, item) => suma + item.subtotal, 0);
  }

  /**
   * Actualizar el estado del pedido
   */
  actualizarEstado(nuevoEstado: EstadoPedido): void {
    this.estado = nuevoEstado;
    this.fechaActualizacion = new Date();
  }

  /**
   * Agregar un item al pedido
   */
  agregarItem(item: ItemPedido): void {
    this.items.push(item);
    this.montoTotal = this.calcularTotal();
    this.fechaActualizacion = new Date();
  }

  /**
   * Eliminar un item del pedido
   */
  eliminarItem(idProducto: string): void {
    this.items = this.items.filter(item => item.idProducto !== idProducto);
    this.montoTotal = this.calcularTotal();
    this.fechaActualizacion = new Date();
  }

  /**
   * Verificar si el pedido puede ser cancelado
   */
  puedeCancelarse(): boolean {
    return this.estado !== EstadoPedido.ENTREGADO && 
           this.estado !== EstadoPedido.CANCELADO &&
           this.estado !== EstadoPedido.EN_CAMINO;
  }

  /**
   * Asignar pedido a una ruta de entrega
   */
  asignarARuta(idRuta: string): void {
    this.idRutaAsignada = idRuta;
    this.fechaActualizacion = new Date();
  }
}
