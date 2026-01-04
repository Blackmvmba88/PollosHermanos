import { Pedido, EstadoPedido, PrioridadPedido, ItemPedido } from '../../domain/entities/Pedido';
import { IRepositorioPedidos } from '../../domain/repositories/IRepositorioPedidos';
import { IRepositorioInventario } from '../../domain/repositories/IRepositorioInventario';
import { IRepositorioClientes } from '../../domain/repositories/IRepositorioClientes';

/**
 * Servicio de Pedidos - Gestiona la lógica de negocio relacionada con pedidos
 */
export class ServicioPedidos {
  constructor(
    private repositorioPedidos: IRepositorioPedidos,
    private repositorioInventario: IRepositorioInventario,
    private repositorioClientes: IRepositorioClientes
  ) {}

  /**
   * Crear un nuevo pedido
   */
  async crearPedido(
    idCliente: string,
    items: ItemPedido[],
    prioridad: PrioridadPedido = PrioridadPedido.NORMAL,
    direccionEntrega?: string,
    fechaEntrega?: Date,
    notas?: string
  ): Promise<Pedido> {
    // Verificar que el cliente existe
    const cliente = await this.repositorioClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Verificar disponibilidad de stock para cada item
    for (const item of items) {
      const itemInventario = await this.repositorioInventario.buscarPorId(item.idProducto);
      if (!itemInventario) {
        throw new Error(`Producto no encontrado: ${item.nombreProducto}`);
      }
      if (!itemInventario.hayDisponible(item.cantidad)) {
        throw new Error(`Stock insuficiente para: ${item.nombreProducto}`);
      }
    }

    // Calcular monto total
    const montoTotal = items.reduce((suma, item) => suma + item.subtotal, 0);

    // Verificar límite de crédito si aplica
    if (cliente.limiteCredito) {
      if (!cliente.tieneCreditoDisponible(montoTotal)) {
        throw new Error('El cliente ha excedido su límite de crédito');
      }
    }

    // Crear el pedido
    const pedido = new Pedido(
      this.generarId(),
      idCliente,
      items,
      EstadoPedido.PENDIENTE,
      prioridad,
      montoTotal,
      new Date(),
      new Date(),
      direccionEntrega,
      fechaEntrega,
      notas
    );

    // Guardar el pedido
    const pedidoGuardado = await this.repositorioPedidos.guardar(pedido);

    // Actualizar el registro del cliente
    cliente.registrarPedido(montoTotal);
    await this.repositorioClientes.guardar(cliente);

    return pedidoGuardado;
  }

  /**
   * Confirmar un pedido y descontar del inventario
   */
  async confirmarPedido(idPedido: string): Promise<Pedido> {
    const pedido = await this.repositorioPedidos.buscarPorId(idPedido);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    if (pedido.estado !== EstadoPedido.PENDIENTE) {
      throw new Error('Solo se pueden confirmar pedidos pendientes');
    }

    // Descontar del inventario
    for (const item of pedido.items) {
      const itemInventario = await this.repositorioInventario.buscarPorId(item.idProducto);
      if (itemInventario) {
        itemInventario.retirarStock(item.cantidad);
        await this.repositorioInventario.guardar(itemInventario);
      }
    }

    pedido.actualizarEstado(EstadoPedido.CONFIRMADO);
    return await this.repositorioPedidos.guardar(pedido);
  }

  /**
   * Actualizar el estado de un pedido
   */
  async actualizarEstado(idPedido: string, nuevoEstado: EstadoPedido): Promise<Pedido> {
    const pedido = await this.repositorioPedidos.buscarPorId(idPedido);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    pedido.actualizarEstado(nuevoEstado);
    return await this.repositorioPedidos.guardar(pedido);
  }

  /**
   * Cancelar un pedido
   */
  async cancelarPedido(idPedido: string): Promise<Pedido> {
    const pedido = await this.repositorioPedidos.buscarPorId(idPedido);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    if (!pedido.puedeCancelarse()) {
      throw new Error('Este pedido no puede ser cancelado');
    }

    // Si el pedido fue confirmado, devolver stock al inventario
    if (pedido.estado === EstadoPedido.CONFIRMADO || 
        pedido.estado === EstadoPedido.PREPARANDO ||
        pedido.estado === EstadoPedido.LISTO_PARA_ENTREGA) {
      for (const item of pedido.items) {
        const itemInventario = await this.repositorioInventario.buscarPorId(item.idProducto);
        if (itemInventario) {
          itemInventario.agregarStock(item.cantidad);
          await this.repositorioInventario.guardar(itemInventario);
        }
      }
    }

    pedido.actualizarEstado(EstadoPedido.CANCELADO);
    return await this.repositorioPedidos.guardar(pedido);
  }

  /**
   * Obtener pedidos por cliente
   */
  async obtenerPedidosPorCliente(idCliente: string): Promise<Pedido[]> {
    return await this.repositorioPedidos.buscarPorCliente(idCliente);
  }

  /**
   * Obtener pedidos por estado
   */
  async obtenerPedidosPorEstado(estado: EstadoPedido): Promise<Pedido[]> {
    return await this.repositorioPedidos.buscarPorEstado(estado);
  }

  /**
   * Obtener todos los pedidos
   */
  async obtenerTodos(): Promise<Pedido[]> {
    return await this.repositorioPedidos.obtenerTodos();
  }

  /**
   * Obtener un pedido por ID
   */
  async obtenerPorId(id: string): Promise<Pedido | null> {
    return await this.repositorioPedidos.buscarPorId(id);
  }

  /**
   * Asignar pedido a una ruta de entrega
   */
  async asignarARuta(idPedido: string, idRuta: string): Promise<Pedido> {
    const pedido = await this.repositorioPedidos.buscarPorId(idPedido);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    pedido.asignarARuta(idRuta);
    return await this.repositorioPedidos.guardar(pedido);
  }

  /**
   * Generar un ID único (simplificado para el ejemplo)
   */
  private generarId(): string {
    return `PED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
