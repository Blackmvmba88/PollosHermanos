import { 
  ItemInventario, 
  CategoriaProducto, 
  UnidadMedida, 
  NivelStock 
} from '../../domain/entities/ItemInventario';
import { IRepositorioInventario } from '../../domain/repositories/IRepositorioInventario';

/**
 * Servicio de Inventario - Gestiona la lógica de negocio relacionada con inventario
 */
export class ServicioInventario {
  constructor(private repositorioInventario: IRepositorioInventario) {}

  /**
   * Agregar un nuevo producto al inventario
   */
  async agregarProducto(
    nombreProducto: string,
    categoria: CategoriaProducto,
    stockInicial: number,
    unidad: UnidadMedida,
    nivelStockMinimo: number,
    nivelStockMaximo: number,
    costoUnitario: number,
    precioVenta: number,
    idProveedor?: string
  ): Promise<ItemInventario> {
    const item = new ItemInventario(
      this.generarId(),
      nombreProducto,
      categoria,
      stockInicial,
      unidad,
      nivelStockMinimo,
      nivelStockMaximo,
      costoUnitario,
      precioVenta,
      idProveedor,
      new Date()
    );

    return await this.repositorioInventario.guardar(item);
  }

  /**
   * Agregar stock a un producto existente
   */
  async agregarStock(
    idProducto: string,
    cantidad: number,
    numeroLote?: string,
    fechaVencimiento?: Date
  ): Promise<ItemInventario> {
    const item = await this.repositorioInventario.buscarPorId(idProducto);
    if (!item) {
      throw new Error('Producto no encontrado en el inventario');
    }

    item.agregarStock(cantidad, numeroLote, fechaVencimiento);
    return await this.repositorioInventario.guardar(item);
  }

  /**
   * Retirar stock de un producto
   */
  async retirarStock(idProducto: string, cantidad: number): Promise<ItemInventario> {
    const item = await this.repositorioInventario.buscarPorId(idProducto);
    if (!item) {
      throw new Error('Producto no encontrado en el inventario');
    }

    item.retirarStock(cantidad);
    return await this.repositorioInventario.guardar(item);
  }

  /**
   * Verificar disponibilidad de un producto
   */
  async verificarDisponibilidad(idProducto: string, cantidad: number): Promise<boolean> {
    const item = await this.repositorioInventario.buscarPorId(idProducto);
    if (!item) {
      return false;
    }
    return item.hayDisponible(cantidad);
  }

  /**
   * Obtener productos que necesitan reposición
   */
  async obtenerProductosParaReponer(): Promise<ItemInventario[]> {
    return await this.repositorioInventario.buscarQueNecesitanReposicion();
  }

  /**
   * Obtener productos vencidos
   */
  async obtenerProductosVencidos(): Promise<ItemInventario[]> {
    return await this.repositorioInventario.buscarVencidos();
  }

  /**
   * Obtener productos por nivel de stock
   */
  async obtenerPorNivelStock(nivel: NivelStock): Promise<ItemInventario[]> {
    return await this.repositorioInventario.buscarPorNivelStock(nivel);
  }

  /**
   * Obtener todos los productos
   */
  async obtenerTodos(): Promise<ItemInventario[]> {
    return await this.repositorioInventario.obtenerTodos();
  }

  /**
   * Obtener un producto por ID
   */
  async obtenerPorId(id: string): Promise<ItemInventario | null> {
    return await this.repositorioInventario.buscarPorId(id);
  }

  /**
   * Buscar productos por nombre
   */
  async buscarPorNombre(nombre: string): Promise<ItemInventario[]> {
    return await this.repositorioInventario.buscarPorNombre(nombre);
  }

  /**
   * Actualizar precios de un producto
   */
  async actualizarPrecios(
    idProducto: string,
    costoUnitario?: number,
    precioVenta?: number
  ): Promise<ItemInventario> {
    const item = await this.repositorioInventario.buscarPorId(idProducto);
    if (!item) {
      throw new Error('Producto no encontrado en el inventario');
    }

    if (costoUnitario !== undefined) {
      item.costoUnitario = costoUnitario;
    }
    if (precioVenta !== undefined) {
      item.precioVenta = precioVenta;
    }

    return await this.repositorioInventario.guardar(item);
  }

  /**
   * Calcular el valor total del inventario
   */
  async calcularValorTotal(): Promise<number> {
    const items = await this.repositorioInventario.obtenerTodos();
    return items.reduce((total: number, item) => total + item.calcularValor(), 0);
  }

  /**
   * Calcular la ganancia potencial total
   */
  async calcularGananciaPotencial(): Promise<number> {
    const items = await this.repositorioInventario.obtenerTodos();
    return items.reduce((total: number, item) => total + item.calcularGananciaPotencial(), 0);
  }

  /**
   * Eliminar un producto del inventario
   */
  async eliminarProducto(idProducto: string): Promise<void> {
    const item = await this.repositorioInventario.buscarPorId(idProducto);
    if (!item) {
      throw new Error('Producto no encontrado en el inventario');
    }

    if (item.stockActual > 0) {
      throw new Error('No se puede eliminar un producto con stock disponible');
    }

    await this.repositorioInventario.eliminar(idProducto);
  }

  /**
   * Generar un ID único (simplificado para el ejemplo)
   */
  private generarId(): string {
    return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
