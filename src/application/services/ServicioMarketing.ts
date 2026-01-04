import { IRepositorioMarketing } from '../../domain/repositories/IRepositorioMarketing';
import { IRepositorioClientes } from '../../domain/repositories/IRepositorioClientes';
import { IRepositorioPedidos } from '../../domain/repositories/IRepositorioPedidos';
import { 
  AnalisisCliente, 
  PotencialConversion, 
  PatronDemanda 
} from '../../domain/entities/AnalisisCliente';
import {
  OportunidadExpansion,
  TipoActivoProductivo,
  EstadoOportunidad,
  ProyeccionCapacidad,
  EvaluacionFinanciera
} from '../../domain/entities/OportunidadExpansion';

/**
 * Análisis de zona geográfica
 */
interface AnalisisZona {
  zona: string;
  volumenTotal: number;
  numeroClientes: number;
  rentabilidadTotal: number;
  rentabilidadPromedio: number;
  clientesPotenciales: string[];
}

/**
 * Servicio de Marketing, Conversión y Expansión Vertical
 */
export class ServicioMarketing {
  constructor(
    private repoMarketing: IRepositorioMarketing,
    private repoClientes: IRepositorioClientes,
    private repoPedidos: IRepositorioPedidos
  ) {}

  /**
   * Crear análisis de cliente basado en historial de compras
   */
  async analizarCliente(idCliente: string): Promise<AnalisisCliente> {
    const cliente = await this.repoClientes.buscarPorId(idCliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Obtener pedidos del cliente
    const pedidos = await this.repoPedidos.buscarPorCliente(idCliente);
    
    // Calcular patrón de demanda
    const patron: PatronDemanda = {
      zonaGeografica: cliente.direcciones[0]?.ciudad || 'No especificada',
      volumenPromedio: this.calcularVolumenPromedio(pedidos),
      frecuenciaCompra: this.calcularFrecuenciaCompra(pedidos),
      rentabilidadPromedio: cliente.totalGastado / (cliente.totalPedidos || 1),
      productosPreferidos: this.identificarProductosPreferidos(pedidos)
    };

    // Determinar potencial de conversión
    const potencial = this.determinarPotencialConversion(patron);

    // Generar recomendaciones
    const recomendaciones = this.generarRecomendaciones(patron, potencial);

    const analisis = new AnalisisCliente(
      this.generarIdAnalisis(),
      idCliente,
      cliente.nombre,
      potencial,
      patron,
      new Date(),
      0,
      recomendaciones,
      new Date()
    );

    // Calcular puntaje
    analisis.calcularPuntajeConversion();

    return await this.repoMarketing.guardarAnalisis(analisis);
  }

  /**
   * Analizar patrones de demanda por zona geográfica
   */
  async analizarDemandaPorZona(): Promise<AnalisisZona[]> {
    const clientes = await this.repoClientes.obtenerTodos();
    const zonas = new Map<string, AnalisisZona>();

    for (const cliente of clientes) {
      const zona = cliente.direcciones[0]?.ciudad || 'Sin zona';
      const pedidos = await this.repoPedidos.buscarPorCliente(cliente.id);
      
      if (!zonas.has(zona)) {
        zonas.set(zona, {
          zona,
          volumenTotal: 0,
          numeroClientes: 0,
          rentabilidadTotal: 0,
          rentabilidadPromedio: 0,
          clientesPotenciales: []
        });
      }

      const analisisZona = zonas.get(zona)!;
      analisisZona.numeroClientes++;
      analisisZona.rentabilidadTotal += cliente.totalGastado;
      analisisZona.volumenTotal += pedidos.length;

      // Identificar clientes con alto potencial
      if (cliente.totalPedidos >= 5 && cliente.totalGastado >= 100000) {
        analisisZona.clientesPotenciales.push(cliente.nombre);
      }
    }

    // Calcular promedios
    zonas.forEach(zona => {
      zona.rentabilidadPromedio = zona.rentabilidadTotal / zona.numeroClientes;
    });

    return Array.from(zonas.values())
      .sort((a, b) => b.rentabilidadTotal - a.rentabilidadTotal);
  }

  /**
   * Obtener clientes con potencial de conversión alto
   */
  async obtenerClientesPotenciales(): Promise<AnalisisCliente[]> {
    const analisis = await this.repoMarketing.obtenerTodosAnalisis();
    return analisis
      .filter(a => a.puntaje >= 70)
      .sort((a, b) => b.puntaje - a.puntaje);
  }

  /**
   * Crear oportunidad de expansión vertical
   */
  async crearOportunidadExpansion(
    nombre: string,
    descripcion: string,
    tipoActivo: TipoActivoProductivo,
    proyeccion: ProyeccionCapacidad,
    evaluacion: EvaluacionFinanciera,
    ubicacion?: string
  ): Promise<OportunidadExpansion> {
    const oportunidad = new OportunidadExpansion(
      this.generarIdOportunidad(),
      nombre,
      descripcion,
      tipoActivo,
      EstadoOportunidad.ANALISIS,
      new Date(),
      proyeccion,
      evaluacion,
      ubicacion
    );

    return await this.repoMarketing.guardarOportunidad(oportunidad);
  }

  /**
   * Evaluar viabilidad de producción propia vs compra externa
   */
  evaluarProduccionPropia(
    demandaAnualKg: number,
    precioCompraKg: number,
    costoProduccionKg: number,
    inversionInicial: number,
    costosOperacionalesMensuales: number
  ): EvaluacionFinanciera {
    const mesesAnalisis = 24; // 2 años

    // Costo compra externa
    const costoCompraExterna = (demandaAnualKg / 12) * precioCompraKg * (mesesAnalisis / 12);

    // Costo producción propia
    const costoProduccionTotal = inversionInicial + 
      (costosOperacionalesMensuales * mesesAnalisis) +
      ((demandaAnualKg / 12) * costoProduccionKg * (mesesAnalisis / 12));

    // Ahorro
    const ahorroEstimado = costoCompraExterna - costoProduccionTotal;

    // ROI
    const roi = (ahorroEstimado / inversionInicial) * 100;

    // Período de retorno
    const ahorroMensual = ahorroEstimado / mesesAnalisis;
    const periodoRetorno = ahorroMensual > 0 ? 
      Math.ceil(inversionInicial / ahorroMensual) : 999;

    // VAN simplificado (tasa descuento 10% anual)
    const tasaDescuentoMensual = 0.10 / 12;
    let van = -inversionInicial;
    for (let mes = 1; mes <= mesesAnalisis; mes++) {
      van += ahorroMensual / Math.pow(1 + tasaDescuentoMensual, mes);
    }

    // TIR simplificada
    const tir = (ahorroEstimado / inversionInicial) / (mesesAnalisis / 12) * 100;

    return {
      inversionInicial,
      costoProduccionPropia: costoProduccionTotal,
      costoCompraExterna,
      ahorroEstimado,
      roi,
      periodoRetorno,
      valorActualNeto: van,
      tasaInternaRetorno: tir
    };
  }

  /**
   * Obtener oportunidades viables ordenadas por prioridad
   */
  async obtenerOportunidadesViables(): Promise<OportunidadExpansion[]> {
    const oportunidades = await this.repoMarketing.obtenerTodasOportunidades();
    return oportunidades
      .filter(o => o.esViableFinancieramente())
      .sort((a, b) => b.calcularPrioridad() - a.calcularPrioridad());
  }

  /**
   * Generar reporte de inteligencia de mercado
   */
  async generarReporteInteligencia(): Promise<{
    totalClientes: number;
    clientesConPotencial: number;
    analisisPorZona: AnalisisZona[];
    mejoresOportunidades: OportunidadExpansion[];
    recomendacionesEstrategicas: string[];
  }> {
    const clientes = await this.repoClientes.obtenerTodos();
    const potenciales = await this.obtenerClientesPotenciales();
    const analisisZona = await this.analizarDemandaPorZona();
    const oportunidades = await this.obtenerOportunidadesViables();

    const recomendaciones: string[] = [];

    // Generar recomendaciones estratégicas
    if (potenciales.length >= 5) {
      recomendaciones.push(
        `Hay ${potenciales.length} clientes con alto potencial de conversión a mayoristas`
      );
    }

    const zonaMayorDemanda = analisisZona[0];
    if (zonaMayorDemanda) {
      recomendaciones.push(
        `La zona "${zonaMayorDemanda.zona}" tiene la mayor demanda con ${zonaMayorDemanda.numeroClientes} clientes`
      );
    }

    if (oportunidades.length > 0) {
      recomendaciones.push(
        `Se identificaron ${oportunidades.length} oportunidades viables de expansión vertical`
      );
    }

    // Evaluar si es momento de producir
    const ventasTotales = clientes.reduce((sum, c) => sum + c.totalGastado, 0);
    if (ventasTotales >= 10000000 && oportunidades.length > 0) {
      recomendaciones.push(
        'El volumen de ventas justifica considerar la producción propia'
      );
    }

    return {
      totalClientes: clientes.length,
      clientesConPotencial: potenciales.length,
      analisisPorZona: analisisZona.slice(0, 5), // Top 5 zonas
      mejoresOportunidades: oportunidades.slice(0, 3), // Top 3 oportunidades
      recomendacionesEstrategicas: recomendaciones
    };
  }

  // ========== Métodos Privados ==========

  private calcularVolumenPromedio(pedidos: any[]): number {
    if (pedidos.length === 0) return 0;
    const totalItems = pedidos.reduce((sum, p) => sum + p.items.length, 0);
    return totalItems / pedidos.length;
  }

  private calcularFrecuenciaCompra(pedidos: any[]): number {
    if (pedidos.length === 0) return 0;
    
    // Calcular frecuencia por mes
    const fechas = pedidos.map(p => new Date(p.fechaCreacion));
    const mesesUnicos = new Set(fechas.map(f => `${f.getFullYear()}-${f.getMonth()}`));
    
    return pedidos.length / Math.max(mesesUnicos.size, 1);
  }

  private identificarProductosPreferidos(pedidos: any[]): string[] {
    const productos = new Map<string, number>();
    
    pedidos.forEach(pedido => {
      pedido.items.forEach((item: any) => {
        const count = productos.get(item.nombreProducto) || 0;
        productos.set(item.nombreProducto, count + item.cantidad);
      });
    });

    return Array.from(productos.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nombre]) => nombre);
  }

  private determinarPotencialConversion(patron: PatronDemanda): PotencialConversion {
    if (patron.volumenPromedio >= 100 && patron.frecuenciaCompra >= 8) {
      return PotencialConversion.DISTRIBUIDOR;
    } else if (patron.volumenPromedio >= 50 && patron.frecuenciaCompra >= 4) {
      return PotencialConversion.MAYORISTA;
    } else if (patron.volumenPromedio >= 20 && patron.frecuenciaCompra >= 2) {
      return PotencialConversion.ALTO;
    } else if (patron.volumenPromedio >= 10) {
      return PotencialConversion.MEDIO;
    }
    return PotencialConversion.BAJO;
  }

  private generarRecomendaciones(
    patron: PatronDemanda,
    potencial: PotencialConversion
  ): string[] {
    const recomendaciones: string[] = [];

    if (potencial === PotencialConversion.DISTRIBUIDOR) {
      recomendaciones.push('Cliente ideal para conversión a distribuidor');
      recomendaciones.push('Ofrecer precios especiales por volumen');
      recomendaciones.push('Contactar para propuesta de distribución exclusiva');
    } else if (potencial === PotencialConversion.MAYORISTA) {
      recomendaciones.push('Candidato para programa de mayoristas');
      recomendaciones.push('Proponer descuentos por volumen');
      recomendaciones.push('Establecer términos de crédito preferenciales');
    } else if (potencial === PotencialConversion.ALTO) {
      recomendaciones.push('Cliente con buen potencial de crecimiento');
      recomendaciones.push('Mantener contacto frecuente');
      recomendaciones.push('Ofrecer productos complementarios');
    }

    if (patron.frecuenciaCompra < 2) {
      recomendaciones.push('Implementar estrategia de retención');
      recomendaciones.push('Ofrecer programa de puntos o descuentos por frecuencia');
    }

    return recomendaciones;
  }

  /**
   * Actualizar análisis existente de cliente
   */
  async actualizarAnalisisCliente(idCliente: string): Promise<AnalisisCliente> {
    const analisisExistente = await this.repoMarketing.obtenerAnalisisPorCliente(idCliente);
    
    if (analisisExistente) {
      // Eliminar análisis antiguo y crear uno nuevo
      await this.repoMarketing.eliminarAnalisis(analisisExistente.id);
    }

    return await this.analizarCliente(idCliente);
  }

  // ========== Generadores de ID ==========

  private generarIdAnalisis(): string {
    return `ANL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generarIdOportunidad(): string {
    return `OPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
