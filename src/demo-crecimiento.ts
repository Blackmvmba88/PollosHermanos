/**
 * Demo: Filosofía de Crecimiento - Aprovechamiento Total del Pollo
 * 
 * Este demo ilustra el crecimiento progresivo de un negocio desde 
 * la venta de cortes específicos hasta la integración vertical completa.
 */

import { ServicioCrecimiento } from './application/services/ServicioCrecimiento';
import { ServicioInventario } from './application/services/ServicioInventario';
import { ServicioFinanzas } from './application/services/ServicioFinanzas';
import { ServicioPedidos } from './application/services/ServicioPedidos';

import { RepositorioCrecimientoMemoria } from './infrastructure/persistence/RepositorioCrecimientoMemoria';
import { RepositorioProcesamientoMemoria } from './infrastructure/persistence/RepositorioProcesamientoMemoria';
import { RepositorioInventarioMemoria } from './infrastructure/persistence/RepositorioInventarioMemoria';
import { RepositorioFinanzasMemoria } from './infrastructure/persistence/RepositorioFinanzasMemoria';
import { RepositorioPedidosMemoria } from './infrastructure/persistence/RepositorioPedidosMemoria';
import { RepositorioClientesMemoria } from './infrastructure/persistence/RepositorioClientesMemoria';

import { 
  NivelNegocio, 
  CategoriaProducto, 
  UnidadMedida,
  SubcategoriaPollo 
} from './domain/entities/ItemInventario';
import { TipoTransaccion, MetodoPago } from './domain/entities/TransaccionFinanciera';

async function main() {
  console.log('=== 🐔 FILOSOFÍA DE CRECIMIENTO: APROVECHAMIENTO TOTAL DEL POLLO ===\n');
  console.log('Demostrando el camino desde un emprendedor con recursos mínimos');
  console.log('hasta una operación completa de procesamiento y distribución.\n');

  // Inicializar repositorios
  const repoCrecimiento = new RepositorioCrecimientoMemoria();
  const repoProcesamiento = new RepositorioProcesamientoMemoria();
  const repoInventario = new RepositorioInventarioMemoria();
  const repoFinanzas = new RepositorioFinanzasMemoria();
  const repoPedidos = new RepositorioPedidosMemoria();
  const repoClientes = new RepositorioClientesMemoria();

  // Inicializar servicios
  const servicioInventario = new ServicioInventario(repoInventario);
  const servicioFinanzas = new ServicioFinanzas(repoFinanzas);
  const servicioPedidos = new ServicioPedidos(repoPedidos, repoInventario, repoClientes);
  const servicioCrecimiento = new ServicioCrecimiento(
    repoCrecimiento,
    repoProcesamiento,
    repoInventario,
    repoPedidos,
    servicioFinanzas
  );

  try {
    // ===================================================================
    // ETAPA 1: INICIO BÁSICO - Venta de Cortes Específicos
    // ===================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 ETAPA 1: INICIO BÁSICO - Venta de Cortes Específicos');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 Contexto: Don José inicia con un puesto en el mercado local');
    console.log('   - Capital inicial: $800,000 COP');
    console.log('   - Infraestructura: Parrilla, hielera, mesa');
    console.log('   - Productos: Alitas y piernas (comprados procesados)\n');

    // Inicializar etapa de crecimiento
    const etapa1 = await servicioCrecimiento.inicializarEtapa(
      NivelNegocio.ETAPA_1_INICIO,
      800000
    );
    console.log('✅ Etapa de crecimiento inicializada');
    console.log(`   Nivel: ${etapa1.obtenerDescripcionEtapa()}\n`);

    // Agregar productos iniciales (cortes comprados)
    console.log('📦 Agregando inventario inicial...');
    const alitas = await servicioInventario.agregarProducto(
      'Alitas de Pollo',
      CategoriaProducto.POLLO,
      10,
      UnidadMedida.KG,
      3,
      20,
      15000, // Costo cuando se compran procesadas
      22000, // Precio de venta
      undefined,
      undefined,
      undefined,
      undefined,
      SubcategoriaPollo.ALITAS
    );
    console.log(`   ✓ ${alitas.nombreProducto}: ${alitas.stockActual} kg`);
    console.log(`     Costo: $${alitas.costoUnitario}/kg | Venta: $${alitas.precioVenta}/kg`);
    console.log(`     Margen: ${alitas.calcularPorcentajeMargen().toFixed(1)}%\n`);

    const piernas = await servicioInventario.agregarProducto(
      'Piernas de Pollo',
      CategoriaProducto.POLLO,
      12,
      UnidadMedida.KG,
      5,
      25,
      14000,
      20000,
      undefined,
      undefined,
      undefined,
      undefined,
      SubcategoriaPollo.PIERNAS
    );
    console.log(`   ✓ ${piernas.nombreProducto}: ${piernas.stockActual} kg`);
    console.log(`     Costo: $${piernas.costoUnitario}/kg | Venta: $${piernas.precioVenta}/kg`);
    console.log(`     Margen: ${piernas.calcularPorcentajeMargen().toFixed(1)}%\n`);

    // Simular ventas del día
    console.log('💰 Simulando ventas del día...');
    await servicioFinanzas.registrarTransaccion(
      TipoTransaccion.VENTA,
      180000,
      MetodoPago.EFECTIVO,
      'Venta diaria de alitas y piernas'
    );
    console.log('   ✓ Venta registrada: $180,000\n');

    // Mostrar resumen de Etapa 1
    const resumenEtapa1 = etapa1.obtenerResumen();
    console.log('📊 RESUMEN ETAPA 1:');
    console.log(`   - Progreso hacia siguiente etapa: ${resumenEtapa1.progreso.toFixed(0)}%`);
    console.log(`   - Capital disponible: $${resumenEtapa1.capitalDisponible.toLocaleString()}`);
    console.log(`   - Capital requerido para siguiente etapa: $${resumenEtapa1.capitalRequerido.toLocaleString()}`);
    console.log(`   - Indicadores cumplidos: ${resumenEtapa1.indicadoresCumplidos}/${resumenEtapa1.totalIndicadores}\n`);

    // ===================================================================
    // ETAPA 2: EXPANSIÓN - Procesamiento de Pollos Enteros
    // ===================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 ETAPA 2: EXPANSIÓN - Procesamiento de Pollos Enteros');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎯 Contexto: Don José ahora invierte en procesamiento propio');
    console.log('   - Capital acumulado: $6,000,000 COP');
    console.log('   - Nueva infraestructura: Espacio de procesamiento, refrigeración');
    console.log('   - Estrategia: Comprar pollos enteros y procesarlos\n');

    // Inicializar Etapa 2
    const etapa2 = await servicioCrecimiento.inicializarEtapa(
      NivelNegocio.ETAPA_2_PROCESAMIENTO,
      6000000
    );
    console.log('✅ Avanzó a Etapa 2 - Procesamiento');
    console.log(`   ${etapa2.obtenerDescripcionEtapa()}\n`);

    // Procesar un pollo entero
    console.log('🔪 Procesando pollo entero...');
    console.log('   Pollo entero: 2,500 gramos @ $8,000/kg = $20,000 total\n');

    const procesamiento = await servicioCrecimiento.procesarPolloEntero(
      2500, // 2.5 kg
      20000, // Costo total
      'LOTE-001'
    );

    console.log('📊 RESULTADOS DEL PROCESAMIENTO:\n');
    console.log('   Cortes obtenidos:');
    procesamiento.cortes.forEach(corte => {
      const nombreCorte = corte.subcategoria.replace(/_/g, ' ');
      const pesoKg = (corte.pesoGramos / 1000).toFixed(2);
      const valorKg = corte.pesoGramos / 1000 * corte.precioVenta;
      console.log(`   • ${nombreCorte}:`);
      console.log(`     - Peso: ${pesoKg} kg (${corte.porcentaje}%)`);
      console.log(`     - Precio venta: $${corte.precioVenta.toLocaleString()}/kg`);
      console.log(`     - Valor generado: $${valorKg.toLocaleString()}`);
    });

    const resumen = procesamiento.obtenerResumen();
    console.log(`\n   💡 ANÁLISIS FINANCIERO:`);
    console.log(`   - Costo total: $${resumen.costo.toLocaleString()}`);
    console.log(`   - Valor generado: $${resumen.valorGenerado.toLocaleString()}`);
    console.log(`   - Ganancia potencial: $${resumen.ganancia.toLocaleString()}`);
    console.log(`   - Margen de ganancia: ${resumen.margen.toFixed(1)}%`);
    console.log(`   - Aprovechamiento: ${resumen.aprovechamiento.toFixed(1)}%`);
    console.log(`   - ¿Eficiente? ${resumen.eficiente ? '✅ SÍ' : '❌ NO'}\n`);

    console.log('   🎯 COMPARATIVA vs Etapa 1:');
    console.log('   • Etapa 1 - Comprar cortes procesados:');
    console.log('     Margen promedio: 40-47%');
    console.log('   • Etapa 2 - Procesar pollos enteros:');
    console.log(`     Margen actual: ${resumen.margen.toFixed(1)}%`);
    console.log(`     ⬆️ Mejora de margen: +${(resumen.margen - 43.5).toFixed(1)}%\n`);

    // Verificar inventario actualizado
    console.log('📦 Verificando inventario actualizado...');
    const inventarioActual = await servicioInventario.obtenerTodos();
    const productosPollo = inventarioActual.filter(p => p.esProductoPollo());
    console.log(`   Total de productos de pollo en inventario: ${productosPollo.length}`);
    productosPollo.forEach(p => {
      if (p.subcategoria) {
        console.log(`   • ${p.nombreProducto}: ${p.stockActual.toFixed(2)} kg`);
      }
    });
    console.log();

    // Estadísticas de procesamiento
    console.log('📈 Estadísticas de procesamiento...');
    const stats = await servicioCrecimiento.obtenerEstadisticasProcesamiento();
    console.log(`   - Total procesados: ${stats.totalProcesados} pollos`);
    console.log(`   - Aprovechamiento promedio: ${stats.aprovechamientoPromedio.toFixed(1)}%`);
    console.log(`   - Ganancia promedio: $${stats.gananciaPromedioTotal.toLocaleString()}`);
    console.log(`   - Eficiencia general: ${stats.eficienciaGeneral}\n`);

    // ===================================================================
    // RESUMEN FINAL Y PRÓXIMOS PASOS
    // ===================================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 RESUMEN Y PRÓXIMOS PASOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ LOGROS ALCANZADOS:');
    console.log('   1. ✓ Sistema de etapas de crecimiento implementado');
    console.log('   2. ✓ Procesamiento de pollo entero con aprovechamiento total');
    console.log('   3. ✓ Tracking automático de cortes en inventario');
    console.log('   4. ✓ Análisis financiero de aprovechamiento');
    console.log('   5. ✓ Mejora de margen de 40% a 62%\n');

    console.log('📋 PRÓXIMAS ETAPAS:');
    console.log('   • Etapa 3: Consolidación - Producción de Pollos Asados');
    console.log('     - Agregar valor mediante cocción');
    console.log('     - Diversificar productos (crudo y cocido)');
    console.log('     - Atender clientes mayoristas');
    console.log();
    console.log('   • Etapa 4: Integración Vertical - Producción Propia');
    console.log('     - Establecer granja avícola');
    console.log('     - Control total de la cadena');
    console.log('     - Reducir costos 30-40%\n');

    console.log('💡 FILOSOFÍA CENTRAL:');
    console.log('   > "Cada parte del pollo es un recurso y debe ser aprovechada."');
    console.log('   > El sistema no asume "nivel pro"; construye el nivel pro.');
    console.log('   > Crecimiento basado en datos reales, no en supuestos.\n');

    console.log('📚 Para más información:');
    console.log('   Ver: docs/FILOSOFIA_CRECIMIENTO.md\n');

    console.log('✅ ¡Demo completado exitosamente!\n');
    console.log('=== FIN DEL DEMO ===\n');

  } catch (error) {
    console.error('❌ Error en el demo:', error);
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
    }
  }
}

// Ejecutar el demo
main().catch(console.error);
