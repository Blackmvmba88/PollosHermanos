import { 
  Cliente, 
  TipoCliente, 
  EstadoCliente, 
  InfoContacto, 
  Direccion 
} from '../domain/entities/Cliente';
import { IRepositorioClientes } from '../domain/repositories/IRepositorioClientes';

/**
 * Servicio de Clientes - Gestiona la lógica de negocio relacionada con clientes
 */
export class ServicioClientes {
  constructor(private repositorioClientes: IRepositorioClientes) {}

  /**
   * Registrar un nuevo cliente
   */
  async registrarCliente(
    nombre: string,
    tipo: TipoCliente,
    contacto: InfoContacto,
    direcciones: Direccion[],
    limiteCredito?: number,
    notas?: string
  ): Promise<Cliente> {
    // Verificar que no exista otro cliente con el mismo teléfono
    const clientesExistentes = await this.repositorioClientes.buscarPorTelefono(contacto.telefono);
    if (clientesExistentes.length > 0) {
      throw new Error('Ya existe un cliente registrado con este teléfono');
    }

    const cliente = new Cliente(
      this.generarId(),
      nombre,
      tipo,
      EstadoCliente.ACTIVO,
      contacto,
      direcciones,
      new Date(),
      undefined,
      0,
      0,
      limiteCredito,
      0,
      notas
    );

    return await this.repositorioClientes.guardar(cliente);
  }

  /**
   * Actualizar información de un cliente
   */
  async actualizarCliente(
    idCliente: string,
    datos: {
      nombre?: string;
      tipo?: TipoCliente;
      contacto?: InfoContacto;
      limiteCredito?: number;
      notas?: string;
    }
  ): Promise<Cliente> {
    const cliente = await this.repositorioClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    if (datos.nombre) cliente.nombre = datos.nombre;
    if (datos.tipo) cliente.tipo = datos.tipo;
    if (datos.contacto) cliente.contacto = datos.contacto;
    if (datos.limiteCredito !== undefined) cliente.limiteCredito = datos.limiteCredito;
    if (datos.notas) cliente.notas = datos.notas;

    return await this.repositorioClientes.guardar(cliente);
  }

  /**
   * Agregar una dirección a un cliente
   */
  async agregarDireccion(idCliente: string, direccion: Direccion): Promise<Cliente> {
    const cliente = await this.repositorioClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    cliente.agregarDireccion(direccion);
    return await this.repositorioClientes.guardar(cliente);
  }

  /**
   * Registrar un pago de cliente
   */
  async registrarPago(idCliente: string, monto: number): Promise<Cliente> {
    const cliente = await this.repositorioClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    cliente.deducirDelSaldo(monto);
    return await this.repositorioClientes.guardar(cliente);
  }

  /**
   * Agregar al saldo de un cliente
   */
  async agregarAlSaldo(idCliente: string, monto: number): Promise<Cliente> {
    const cliente = await this.repositorioClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    cliente.agregarAlSaldo(monto);
    return await this.repositorioClientes.guardar(cliente);
  }

  /**
   * Desactivar un cliente
   */
  async desactivarCliente(idCliente: string): Promise<Cliente> {
    const cliente = await this.repositorioClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    cliente.desactivar();
    return await this.repositorioClientes.guardar(cliente);
  }

  /**
   * Activar un cliente
   */
  async activarCliente(idCliente: string): Promise<Cliente> {
    const cliente = await this.repositorioClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    cliente.activar();
    return await this.repositorioClientes.guardar(cliente);
  }

  /**
   * Suspender un cliente
   */
  async suspenderCliente(idCliente: string): Promise<Cliente> {
    const cliente = await this.repositorioClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    cliente.suspender();
    return await this.repositorioClientes.guardar(cliente);
  }

  /**
   * Obtener clientes con saldo pendiente
   */
  async obtenerClientesConSaldoPendiente(): Promise<Cliente[]> {
    return await this.repositorioClientes.buscarConSaldoPendiente();
  }

  /**
   * Obtener clientes por estado
   */
  async obtenerPorEstado(estado: EstadoCliente): Promise<Cliente[]> {
    return await this.repositorioClientes.buscarPorEstado(estado);
  }

  /**
   * Buscar clientes por nombre
   */
  async buscarPorNombre(nombre: string): Promise<Cliente[]> {
    return await this.repositorioClientes.buscarPorNombre(nombre);
  }

  /**
   * Obtener todos los clientes
   */
  async obtenerTodos(): Promise<Cliente[]> {
    return await this.repositorioClientes.obtenerTodos();
  }

  /**
   * Obtener un cliente por ID
   */
  async obtenerPorId(id: string): Promise<Cliente | null> {
    return await this.repositorioClientes.buscarPorId(id);
  }

  /**
   * Eliminar un cliente
   */
  async eliminarCliente(idCliente: string): Promise<void> {
    const cliente = await this.repositorioClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    if (cliente.saldoActual > 0) {
      throw new Error('No se puede eliminar un cliente con saldo pendiente');
    }

    await this.repositorioClientes.eliminar(idCliente);
  }

  /**
   * Generar un ID único (simplificado para el ejemplo)
   */
  private generarId(): string {
    return `CLI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
