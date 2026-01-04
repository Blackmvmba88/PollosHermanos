/**
 * Tipo de Cliente para segmentación
 */
export enum TipoCliente {
  MINORISTA = 'MINORISTA',
  MAYORISTA = 'MAYORISTA',
  RESTAURANTE = 'RESTAURANTE',
  REGULAR = 'REGULAR'
}

/**
 * Estado del Cliente
 */
export enum EstadoCliente {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  SUSPENDIDO = 'SUSPENDIDO'
}

/**
 * Información de Contacto
 */
export interface InfoContacto {
  telefono: string;
  email?: string;
  telefonoAlterno?: string;
}

/**
 * Dirección del Cliente
 */
export interface Direccion {
  calle: string;
  ciudad: string;
  estado?: string;
  codigoPostal?: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  notasEntrega?: string;
}

/**
 * Entidad Cliente - Entidad principal del dominio para gestión de clientes
 */
export class Cliente {
  constructor(
    public readonly id: string,
    public nombre: string,
    public tipo: TipoCliente,
    public estado: EstadoCliente,
    public contacto: InfoContacto,
    public direcciones: Direccion[],
    public fechaCreacion: Date,
    public fechaUltimoPedido?: Date,
    public totalPedidos: number = 0,
    public totalGastado: number = 0,
    public limiteCredito?: number,
    public saldoActual: number = 0,
    public notas?: string
  ) {}

  /**
   * Agregar una nueva dirección
   */
  agregarDireccion(direccion: Direccion): void {
    this.direcciones.push(direccion);
  }

  /**
   * Actualizar información de contacto del cliente
   */
  actualizarContacto(contacto: InfoContacto): void {
    this.contacto = contacto;
  }

  /**
   * Registrar un nuevo pedido
   */
  registrarPedido(montoPedido: number): void {
    this.totalPedidos += 1;
    this.totalGastado += montoPedido;
    this.fechaUltimoPedido = new Date();
  }

  /**
   * Verificar si el cliente tiene crédito disponible
   */
  tieneCreditoDisponible(monto: number): boolean {
    if (!this.limiteCredito) return false;
    return (this.saldoActual + monto) <= this.limiteCredito;
  }

  /**
   * Agregar al saldo del cliente (crédito)
   */
  agregarAlSaldo(monto: number): void {
    this.saldoActual += monto;
  }

  /**
   * Deducir del saldo del cliente (pago)
   */
  deducirDelSaldo(monto: number): void {
    if (monto > this.saldoActual) {
      throw new Error('El monto del pago excede el saldo actual');
    }
    this.saldoActual -= monto;
  }

  /**
   * Verificar si el cliente está en buen estado
   */
  estaEnBuenEstado(): boolean {
    if (!this.limiteCredito) return true;
    return this.saldoActual < this.limiteCredito && this.estado === EstadoCliente.ACTIVO;
  }

  /**
   * Calcular el valor promedio de pedido
   */
  obtenerValorPromediopedido(): number {
    if (this.totalPedidos === 0) return 0;
    return this.totalGastado / this.totalPedidos;
  }

  /**
   * Desactivar cliente
   */
  desactivar(): void {
    this.estado = EstadoCliente.INACTIVO;
  }

  /**
   * Suspender cliente
   */
  suspender(): void {
    this.estado = EstadoCliente.SUSPENDIDO;
  }

  /**
   * Activar cliente
   */
  activar(): void {
    this.estado = EstadoCliente.ACTIVO;
  }
}
