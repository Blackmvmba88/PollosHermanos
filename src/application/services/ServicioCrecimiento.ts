import { IRepositorioCrecimiento } from '../../domain/repositories/IRepositorioCrecimiento';
import { IRepositorioProcesamiento } from '../../domain/repositories/IRepositorioProcesamiento';
import { IRepositorioInventario } from '../../domain/repositories/IRepositorioInventario';
import { IRepositorioPedidos } from '../../domain/repositories/IRepositorioPedidos';
import { ServicioFinanzas } from './ServicioFinanzas';
import { 
  EtapaCrecimiento, 
  IndicadorCrecimiento, 
  RecomendacionCrecimiento 
} from '../../domain/entities/EtapaCrecimiento';
import { 
  ProcesamientoPollo, 
  CortePollo 
} from '../../domain/entities/ProcesamientoPollo';
import { 
  NivelNegocio, 
  SubcategoriaPollo,
  CategoriaProducto,
  UnidadMedida
} from '../../domain/entities/ItemInventario';
import { ItemInventario } from '../../domain/entities/ItemInventario';

/**
 * Servicio de Crecimiento - Gestiona la evolución progresiva del negocio
 */
export class ServicioCrecimiento {
  constructor(
    private repositorioCrecimiento: IRepositorioCrecimiento,
    private repositorioProcesamiento: IRepositorioProcesamiento,
    private repositorioInventario: IRepositorioInventario,
    private repositorioPedidos: IRepositorioPedidos,
    private servicioFinanzas: ServicioFinanzas
  ) {}

  /**
   * Inicializar una nueva etapa de crecimiento
   */
  async inicializarEtapa(
    nivelInicial: NivelNegocio,
    capitalDisponible: number
  ): Promise<EtapaCrecimiento> {
    const indicadores = this.generarIndicadoresParaEtapa(nivelInicial);
    
    const etapa = new EtapaCrecimiento(
      this.generarId(),
      nivelInicial,
      new Date(),
      indicadores,
      [],
      capitalDisponible
    );

    return await this.repositorioCrecimiento.guardar(etapa);
  }

  /**
   * Evaluar el progreso actual del negocio
   */
  async evaluarProgreso(): Promise<EtapaCrecimiento> {
    const etapaActual = await this.repositorioCrecimiento.obtenerEtapaActual();
    if (!etapaActual) {
      throw new Error('No hay etapa de crecimiento inicializada');
    }

    // Actualizar indicadores basados en datos reales
    await this.actualizarIndicadores(etapaActual);

    // Generar recomendaciones si está cerca de avanzar
    if (etapaActual.calcularProgreso() >= 60) {
      await this.generarRecomendaciones(etapaActual);
    }

    etapaActual.fechaUltimaEvaluacion = new Date();
    return await this.repositorioCrecimiento.guardar(etapaActual);
  }

  /**
   * Procesar un pollo entero y registrar los cortes obtenidos
   */
  async procesarPolloEntero(
    pesoGramos: number,
    costoTotal: number,
    numeroLote?: string
  ): Promise<ProcesamientoPollo> {
    // Crear procesamiento con proporciones estándar
    const preciosPorKg = new Map<SubcategoriaPollo, number>([
      [SubcategoriaPollo.PECHUGA, 18000],
      [SubcategoriaPollo.ALITAS, 15000],
      [SubcategoriaPollo.PIERNAS, 14000],
      [SubcategoriaPollo.MUSLOS, 14000],
      [SubcategoriaPollo.MENUDENCIAS, 5000],
      [SubcategoriaPollo.CARCASA, 2000]
    ]);

    const procesamiento = ProcesamientoPollo.crearProcesamientoEstandar(
      this.generarId(),
      pesoGramos,
      costoTotal,
      preciosPorKg
    );

    if (numeroLote) {
      procesamiento.numeroLote = numeroLote;
    }

    // Guardar procesamiento
    await this.repositorioProcesamiento.guardar(procesamiento);

    // Agregar cortes al inventario
    await this.agregarCortesAlInventario(procesamiento);

    return procesamiento;
  }

  /**
   * Agregar los cortes obtenidos del procesamiento al inventario
   */
  private async agregarCortesAlInventario(
    procesamiento: ProcesamientoPollo
  ): Promise<void> {
    // Optimización: Cargar todos los productos una sola vez
    const todosLosProductos = await this.repositorioInventario.obtenerTodos();
    
    for (const corte of procesamiento.cortes) {
      const pesoKg = corte.pesoGramos / 1000;
      
      // Buscar producto existente en la lista pre-cargada
      const productoExistente = todosLosProductos.find(p => 
        p.subcategoria === corte.subcategoria
      );

      if (productoExistente) {
        // Agregar stock al producto existente
        productoExistente.agregarStock(
          pesoKg,
          procesamiento.numeroLote,
          undefined
        );
        await this.repositorioInventario.guardar(productoExistente);
      } else {
        // Crear nuevo producto
        const nuevoProducto = new ItemInventario(
          this.generarId(),
          this.obtenerNombreProducto(corte.subcategoria),
          CategoriaProducto.POLLO,
          pesoKg,
          UnidadMedida.KG,
          5, // stock mínimo
          50, // stock máximo
          corte.costoAsignado / pesoKg,
          corte.precioVenta,
          undefined,
          new Date(),
          undefined,
          procesamiento.numeroLote,
          corte.subcategoria,
          procesamiento.id
        );
        await this.repositorioInventario.guardar(nuevoProducto);
        // Agregar al cache local para evitar recrear en el mismo procesamiento
        todosLosProductos.push(nuevoProducto);
      }
    }
  }

  /**
   * Obtener estadísticas de procesamiento
   */
  async obtenerEstadisticasProcesamiento(): Promise<{
    totalProcesados: number;
    aprovechamientoPromedio: number;
    gananciaPromedioTotal: number;
    eficienciaGeneral: string;
  }> {
    const stats = await this.repositorioProcesamiento.obtenerEstadisticas();
    
    let eficiencia = 'BAJA';
    if (stats.aprovechamientoPromedio >= 90) eficiencia = 'EXCELENTE';
    else if (stats.aprovechamientoPromedio >= 85) eficiencia = 'BUENA';
    else if (stats.aprovechamientoPromedio >= 80) eficiencia = 'ACEPTABLE';

    return {
      ...stats,
      eficienciaGeneral: eficiencia
    };
  }

  /**
   * Generar indicadores para una etapa específica
   */
  private generarIndicadoresParaEtapa(nivel: NivelNegocio): IndicadorCrecimiento[] {
    const indicadoresPorEtapa: Record<NivelNegocio, IndicadorCrecimiento[]> = {
      [NivelNegocio.ETAPA_1_INICIO]: [
        {
          nombre: 'Venta Diaria',
          valorActual: 0,
          valorObjetivo: 200000,
          cumplido: false,
          descripcion: 'Venta diaria consistente > $200,000 COP'
        },
        {
          nombre: 'Clientes Frecuentes',
          valorActual: 0,
          valorObjetivo: 20,
          cumplido: false,
          descripcion: 'Más de 20 clientes por semana'
        },
        {
          nombre: 'Capital Acumulado',
          valorActual: 0,
          valorObjetivo: 5000000,
          cumplido: false,
          descripcion: 'Capital disponible > $5M COP'
        }
      ],
      [NivelNegocio.ETAPA_2_PROCESAMIENTO]: [
        {
          nombre: 'Volumen Semanal',
          valorActual: 0,
          valorObjetivo: 100,
          cumplido: false,
          descripcion: 'Más de 100 pollos procesados por semana'
        },
        {
          nombre: 'Aprovechamiento',
          valorActual: 0,
          valorObjetivo: 85,
          cumplido: false,
          descripcion: 'Aprovechamiento >= 85%'
        },
        {
          nombre: 'Capital Disponible',
          valorActual: 0,
          valorObjetivo: 15000000,
          cumplido: false,
          descripcion: 'Capital para siguiente etapa > $15M COP'
        }
      ],
      [NivelNegocio.ETAPA_3_PRODUCCION]: [
        {
          nombre: 'Clientes Mayoristas',
          valorActual: 0,
          valorObjetivo: 5,
          cumplido: false,
          descripcion: 'Más de 5 clientes mayoristas regulares'
        },
        {
          nombre: 'Volumen Semanal Kg',
          valorActual: 0,
          valorObjetivo: 500,
          cumplido: false,
          descripcion: 'Más de 500 kg por semana'
        },
        {
          nombre: 'Capital Disponible',
          valorActual: 0,
          valorObjetivo: 50000000,
          cumplido: false,
          descripcion: 'Capital para integración vertical > $50M COP'
        }
      ],
      [NivelNegocio.ETAPA_4_INTEGRACION]: [
        {
          nombre: 'Demanda Anual',
          valorActual: 0,
          valorObjetivo: 12000,
          cumplido: false,
          descripcion: 'Demanda anual > 12,000 kg'
        },
        {
          nombre: 'ROI Esperado',
          valorActual: 0,
          valorObjetivo: 50,
          cumplido: false,
          descripcion: 'ROI de producción propia > 50%'
        }
      ]
    };

    return indicadoresPorEtapa[nivel] || [];
  }

  /**
   * Actualizar indicadores basados en datos reales del negocio
   */
  private async actualizarIndicadores(etapa: EtapaCrecimiento): Promise<void> {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Obtener resumen financiero
    const resumenFinanciero = await this.servicioFinanzas.generarResumen(inicioMes, hoy);
    const diasDelMes = hoy.getDate();
    const ventaDiaria = resumenFinanciero.totalIngresos / diasDelMes;

    // Obtener datos de inventario y procesamiento
    const estadisticasProcesamiento = await this.repositorioProcesamiento.obtenerEstadisticas();

    switch (etapa.nivelActual) {
      case NivelNegocio.ETAPA_1_INICIO:
        etapa.actualizarIndicador('Venta Diaria', ventaDiaria);
        etapa.actualizarIndicador('Capital Acumulado', etapa.capitalDisponible);
        break;

      case NivelNegocio.ETAPA_2_PROCESAMIENTO:
        etapa.actualizarIndicador('Aprovechamiento', estadisticasProcesamiento.aprovechamientoPromedio);
        etapa.actualizarIndicador('Capital Disponible', etapa.capitalDisponible);
        break;

      case NivelNegocio.ETAPA_3_PRODUCCION:
      case NivelNegocio.ETAPA_4_INTEGRACION:
        etapa.actualizarIndicador('Capital Disponible', etapa.capitalDisponible);
        break;
    }
  }

  /**
   * Generar recomendaciones basadas en el progreso actual
   */
  private async generarRecomendaciones(etapa: EtapaCrecimiento): Promise<void> {
    const siguienteEtapa = etapa.obtenerSiguienteEtapa();
    if (!siguienteEtapa) return;

    const capitalRequerido = etapa.obtenerCapitalRequeridoSiguienteEtapa();
    const tieneCapital = etapa.tieneCapitalSuficiente();

    if (!tieneCapital) {
      etapa.agregarRecomendacion({
        tipo: 'INVERSION',
        prioridad: 'ALTA',
        titulo: 'Acumular Capital',
        descripcion: `Necesitas $${capitalRequerido.toLocaleString()} COP para avanzar a la siguiente etapa. Actualmente tienes $${etapa.capitalDisponible.toLocaleString()} COP.`,
        inversionEstimada: capitalRequerido - etapa.capitalDisponible
      });
    }

    if (etapa.listoParaSiguienteEtapa() && tieneCapital) {
      etapa.agregarRecomendacion({
        tipo: 'OPERACION',
        prioridad: 'CRITICA',
        titulo: '¡Listo para Avanzar!',
        descripcion: `Has cumplido todos los requisitos para avanzar a: ${this.obtenerDescripcionEtapa(siguienteEtapa)}`,
        inversionEstimada: capitalRequerido
      });
    }
  }

  /**
   * Obtener descripción de etapa
   */
  private obtenerDescripcionEtapa(nivel: NivelNegocio): string {
    const descripciones: Record<NivelNegocio, string> = {
      [NivelNegocio.ETAPA_1_INICIO]: 'Inicio Básico - Venta de Cortes',
      [NivelNegocio.ETAPA_2_PROCESAMIENTO]: 'Procesamiento de Pollos Enteros',
      [NivelNegocio.ETAPA_3_PRODUCCION]: 'Producción de Pollos Asados',
      [NivelNegocio.ETAPA_4_INTEGRACION]: 'Integración Vertical - Granja Propia'
    };
    return descripciones[nivel] || 'Desconocida';
  }

  /**
   * Obtener nombre del producto para una subcategoría
   */
  private obtenerNombreProducto(subcategoria: SubcategoriaPollo): string {
    const nombres: Record<SubcategoriaPollo, string> = {
      [SubcategoriaPollo.POLLO_ENTERO]: 'Pollo Entero',
      [SubcategoriaPollo.PECHUGA]: 'Pechuga de Pollo',
      [SubcategoriaPollo.ALITAS]: 'Alitas de Pollo',
      [SubcategoriaPollo.PIERNAS]: 'Piernas de Pollo',
      [SubcategoriaPollo.MUSLOS]: 'Muslos de Pollo',
      [SubcategoriaPollo.CONTRAMUSLOS]: 'Contramuslos de Pollo',
      [SubcategoriaPollo.RABADILLA]: 'Rabadilla de Pollo',
      [SubcategoriaPollo.MENUDENCIAS]: 'Menudencias de Pollo',
      [SubcategoriaPollo.HIGADO]: 'Hígado de Pollo',
      [SubcategoriaPollo.MOLLEJA]: 'Molleja de Pollo',
      [SubcategoriaPollo.CORAZON]: 'Corazón de Pollo',
      [SubcategoriaPollo.CARCASA]: 'Carcasa de Pollo',
      [SubcategoriaPollo.HUESOS]: 'Huesos de Pollo',
      [SubcategoriaPollo.POLLO_ASADO]: 'Pollo Asado',
      [SubcategoriaPollo.CHICHARRON]: 'Chicharrón de Pollo',
      [SubcategoriaPollo.CALDO]: 'Caldo de Pollo'
    };
    return nombres[subcategoria] || 'Producto de Pollo';
  }

  /**
   * Generar ID único con timestamp y caracteres aleatorios
   * Formato: CREC-{timestamp}-{random}
   */
  private generarId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `CREC-${timestamp}-${random}`;
  }
}
