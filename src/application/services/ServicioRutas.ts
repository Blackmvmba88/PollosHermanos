import { 
  RutaEntrega, 
  EstadoRuta, 
  ParadaEntrega 
} from '../domain/entities/RutaEntrega';
import { IRepositorioRutas } from '../domain/repositories/IRepositorioRutas';
import { IRepositorioPedidos } from '../domain/repositories/IRepositorioPedidos';
import { EstadoPedido } from '../domain/entities/Pedido';

/**
 * Servicio de Rutas de Entrega - Gestiona la lógica de negocio relacionada con rutas
 */
export class ServicioRutas {
  constructor(
    private repositorioRutas: IRepositorioRutas,
    private repositorioPedidos: IRepositorioPedidos
  ) {}

  /**
   * Crear una nueva ruta de entrega
   */
  async crearRuta(
    nombreRuta: string,
    fechaPlanificada: Date,
    idConductor?: string,
    nombreConductor?: string,
    idVehiculo?: string,
    notas?: string
  ): Promise<RutaEntrega> {
    const ruta = new RutaEntrega(
      this.generarId(),
      nombreRuta,
      idConductor,
      nombreConductor,
      idVehiculo,
      [],
      EstadoRuta.PLANIFICADA,
      fechaPlanificada,
      undefined,
      undefined,
      undefined,
      undefined,
      notas
    );

    return await this.repositorioRutas.guardar(ruta);
  }

  /**
   * Agregar una parada a una ruta
   */
  async agregarParada(idRuta: string, parada: ParadaEntrega): Promise<RutaEntrega> {
    const ruta = await this.repositorioRutas.buscarPorId(idRuta);
    if (!ruta) {
      throw new Error('Ruta no encontrada');
    }

    if (ruta.estado !== EstadoRuta.PLANIFICADA) {
      throw new Error('Solo se pueden agregar paradas a rutas planificadas');
    }

    // Verificar que el pedido existe y está listo para entrega
    const pedido = await this.repositorioPedidos.buscarPorId(parada.idPedido);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    if (pedido.estado !== EstadoPedido.LISTO_PARA_ENTREGA && 
        pedido.estado !== EstadoPedido.CONFIRMADO &&
        pedido.estado !== EstadoPedido.PREPARANDO) {
      throw new Error('El pedido no está listo para ser agregado a una ruta');
    }

    ruta.agregarParada(parada);

    // Asignar el pedido a esta ruta
    pedido.asignarARuta(idRuta);
    await this.repositorioPedidos.guardar(pedido);

    return await this.repositorioRutas.guardar(ruta);
  }

  /**
   * Eliminar una parada de una ruta
   */
  async eliminarParada(idRuta: string, idPedido: string): Promise<RutaEntrega> {
    const ruta = await this.repositorioRutas.buscarPorId(idRuta);
    if (!ruta) {
      throw new Error('Ruta no encontrada');
    }

    if (ruta.estado !== EstadoRuta.PLANIFICADA) {
      throw new Error('Solo se pueden eliminar paradas de rutas planificadas');
    }

    ruta.eliminarParada(idPedido);

    // Desasignar el pedido de esta ruta
    const pedido = await this.repositorioPedidos.buscarPorId(idPedido);
    if (pedido) {
      pedido.idRutaAsignada = undefined;
      await this.repositorioPedidos.guardar(pedido);
    }

    return await this.repositorioRutas.guardar(ruta);
  }

  /**
   * Iniciar una ruta
   */
  async iniciarRuta(idRuta: string): Promise<RutaEntrega> {
    const ruta = await this.repositorioRutas.buscarPorId(idRuta);
    if (!ruta) {
      throw new Error('Ruta no encontrada');
    }

    if (ruta.paradas.length === 0) {
      throw new Error('No se puede iniciar una ruta sin paradas');
    }

    ruta.iniciar();

    // Actualizar el estado de todos los pedidos a EN_CAMINO
    for (const parada of ruta.paradas) {
      const pedido = await this.repositorioPedidos.buscarPorId(parada.idPedido);
      if (pedido) {
        pedido.actualizarEstado(EstadoPedido.EN_CAMINO);
        await this.repositorioPedidos.guardar(pedido);
      }
    }

    return await this.repositorioRutas.guardar(ruta);
  }

  /**
   * Completar una parada
   */
  async completarParada(idRuta: string, idPedido: string): Promise<RutaEntrega> {
    const ruta = await this.repositorioRutas.buscarPorId(idRuta);
    if (!ruta) {
      throw new Error('Ruta no encontrada');
    }

    if (ruta.estado !== EstadoRuta.EN_PROGRESO) {
      throw new Error('Solo se pueden completar paradas de rutas en progreso');
    }

    ruta.completarParada(idPedido);

    // Actualizar el estado del pedido a ENTREGADO
    const pedido = await this.repositorioPedidos.buscarPorId(idPedido);
    if (pedido) {
      pedido.actualizarEstado(EstadoPedido.ENTREGADO);
      await this.repositorioPedidos.guardar(pedido);
    }

    return await this.repositorioRutas.guardar(ruta);
  }

  /**
   * Completar una ruta
   */
  async completarRuta(idRuta: string): Promise<RutaEntrega> {
    const ruta = await this.repositorioRutas.buscarPorId(idRuta);
    if (!ruta) {
      throw new Error('Ruta no encontrada');
    }

    ruta.completar();
    return await this.repositorioRutas.guardar(ruta);
  }

  /**
   * Asignar conductor a una ruta
   */
  async asignarConductor(
    idRuta: string,
    idConductor: string,
    nombreConductor: string
  ): Promise<RutaEntrega> {
    const ruta = await this.repositorioRutas.buscarPorId(idRuta);
    if (!ruta) {
      throw new Error('Ruta no encontrada');
    }

    ruta.asignarConductor(idConductor, nombreConductor);
    return await this.repositorioRutas.guardar(ruta);
  }

  /**
   * Asignar vehículo a una ruta
   */
  async asignarVehiculo(idRuta: string, idVehiculo: string): Promise<RutaEntrega> {
    const ruta = await this.repositorioRutas.buscarPorId(idRuta);
    if (!ruta) {
      throw new Error('Ruta no encontrada');
    }

    ruta.asignarVehiculo(idVehiculo);
    return await this.repositorioRutas.guardar(ruta);
  }

  /**
   * Reordenar paradas en una ruta
   */
  async reordenarParadas(idRuta: string, nuevoOrden: string[]): Promise<RutaEntrega> {
    const ruta = await this.repositorioRutas.buscarPorId(idRuta);
    if (!ruta) {
      throw new Error('Ruta no encontrada');
    }

    if (ruta.estado !== EstadoRuta.PLANIFICADA) {
      throw new Error('Solo se pueden reordenar paradas de rutas planificadas');
    }

    ruta.reordenarParadas(nuevoOrden);
    return await this.repositorioRutas.guardar(ruta);
  }

  /**
   * Obtener rutas activas
   */
  async obtenerRutasActivas(): Promise<RutaEntrega[]> {
    return await this.repositorioRutas.buscarActivas();
  }

  /**
   * Obtener rutas por estado
   */
  async obtenerPorEstado(estado: EstadoRuta): Promise<RutaEntrega[]> {
    return await this.repositorioRutas.buscarPorEstado(estado);
  }

  /**
   * Obtener rutas por conductor
   */
  async obtenerPorConductor(idConductor: string): Promise<RutaEntrega[]> {
    return await this.repositorioRutas.buscarPorConductor(idConductor);
  }

  /**
   * Obtener rutas por fecha
   */
  async obtenerPorFecha(fecha: Date): Promise<RutaEntrega[]> {
    return await this.repositorioRutas.buscarPorFecha(fecha);
  }

  /**
   * Obtener todas las rutas
   */
  async obtenerTodas(): Promise<RutaEntrega[]> {
    return await this.repositorioRutas.obtenerTodas();
  }

  /**
   * Obtener una ruta por ID
   */
  async obtenerPorId(id: string): Promise<RutaEntrega | null> {
    return await this.repositorioRutas.buscarPorId(id);
  }

  /**
   * Generar un ID único (simplificado para el ejemplo)
   */
  private generarId(): string {
    return `RUT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
