/**
 * PollosHermanos - Sistema de Gestión para Pollerías
 * Archivo principal de demostración
 */

import { ServicioPedidos } from './application/services/ServicioPedidos';
import { ServicioInventario } from './application/services/ServicioInventario';
import { ServicioClientes } from './application/services/ServicioClientes';
import { ServicioRutas } from './application/services/ServicioRutas';
import { ServicioFinanzas } from './application/services/ServicioFinanzas';
import { ServicioMarketing } from './application/services/ServicioMarketing';

import { RepositorioPedidosMemoria } from './infrastructure/persistence/RepositorioPedidosMemoria';
import { RepositorioInventarioMemoria } from './infrastructure/persistence/RepositorioInventarioMemoria';
import { RepositorioClientesMemoria } from './infrastructure/persistence/RepositorioClientesMemoria';
import { RepositorioRutasMemoria } from './infrastructure/persistence/RepositorioRutasMemoria';
import { RepositorioFinanzasMemoria } from './infrastructure/persistence/RepositorioFinanzasMemoria';
import { RepositorioMarketingMemoria } from './infrastructure/persistence/RepositorioMarketingMemoria';

import { CategoriaProducto, UnidadMedida } from './domain/entities/ItemInventario';
import { TipoCliente } from './domain/entities/Cliente';
import { PrioridadPedido, EstadoPedido } from './domain/entities/Pedido';
import { TipoTransaccion, MetodoPago } from './domain/entities/TransaccionFinanciera';
import { TipoActivoProductivo } from './domain/entities/OportunidadExpansion';

/**
 * Función principal de demostración
 */
async function main() {
  console.log('=== POLLOS HERMANOS - Sistema de Gestión ===\n');

  // Inicializar repositorios
  const repoPedidos = new RepositorioPedidosMemoria();
  const repoInventario = new RepositorioInventarioMemoria();
  const repoClientes = new RepositorioClientesMemoria();
  const repoRutas = new RepositorioRutasMemoria();
  const repoFinanzas = new RepositorioFinanzasMemoria();
  const repoMarketing = new RepositorioMarketingMemoria();

  // Inicializar servicios
  const servicioInventario = new ServicioInventario(repoInventario);
  const servicioClientes = new ServicioClientes(repoClientes);
  const servicioPedidos = new ServicioPedidos(repoPedidos, repoInventario, repoClientes);
  const servicioRutas = new ServicioRutas(repoRutas, repoPedidos);
  const servicioFinanzas = new ServicioFinanzas(repoFinanzas);
  const servicioMarketing = new ServicioMarketing(repoMarketing, repoClientes, repoPedidos);

  try {
    // 1. AGREGAR PRODUCTOS AL INVENTARIO
    console.log('📦 1. Agregando productos al inventario...');
    
    const polloEntero = await servicioInventario.agregarProducto(
      'Pollo Entero',
      CategoriaProducto.POLLO,
      50,
      UnidadMedida.KG,
      10,
      100,
      8000,
      12000
    );
    console.log(`   ✓ Producto agregado: ${polloEntero.nombreProducto} (${polloEntero.stockActual} ${polloEntero.unidad})`);

    const huevos = await servicioInventario.agregarProducto(
      'Huevos Frescos',
      CategoriaProducto.HUEVOS,
      30,
      UnidadMedida.DOCENA,
      5,
      50,
      4000,
      6000
    );
    console.log(`   ✓ Producto agregado: ${huevos.nombreProducto} (${huevos.stockActual} ${huevos.unidad})`);

    // 2. REGISTRAR CLIENTES
    console.log('\n👥 2. Registrando clientes...');
    
    const cliente1 = await servicioClientes.registrarCliente(
      'Restaurante El Buen Sabor',
      TipoCliente.RESTAURANTE,
      { telefono: '3001234567', email: 'elbuensabor@email.com' },
      [{ 
        calle: 'Calle 50 #30-20', 
        ciudad: 'Bogotá',
        coordenadas: { latitud: 4.6097, longitud: -74.0817 }
      }],
      500000,
      'Cliente mayorista preferencial'
    );
    console.log(`   ✓ Cliente registrado: ${cliente1.nombre} (${cliente1.tipo})`);

    const cliente2 = await servicioClientes.registrarCliente(
      'María García',
      TipoCliente.MINORISTA,
      { telefono: '3109876543' },
      [{ 
        calle: 'Carrera 15 #80-45', 
        ciudad: 'Bogotá',
        coordenadas: { latitud: 4.6667, longitud: -74.0549 }
      }]
    );
    console.log(`   ✓ Cliente registrado: ${cliente2.nombre} (${cliente2.tipo})`);

    // 3. CREAR PEDIDOS
    console.log('\n📝 3. Creando pedidos...');
    
    const pedido1 = await servicioPedidos.crearPedido(
      cliente1.id,
      [
        {
          idProducto: polloEntero.id,
          nombreProducto: polloEntero.nombreProducto,
          cantidad: 10,
          precioUnitario: polloEntero.precioVenta,
          subtotal: 10 * polloEntero.precioVenta
        },
        {
          idProducto: huevos.id,
          nombreProducto: huevos.nombreProducto,
          cantidad: 5,
          precioUnitario: huevos.precioVenta,
          subtotal: 5 * huevos.precioVenta
        }
      ],
      PrioridadPedido.ALTA,
      cliente1.direcciones[0]?.calle,
      new Date(),
      'Entrega en la mañana'
    );
    console.log(`   ✓ Pedido creado: ${pedido1.id} - Total: $${pedido1.montoTotal}`);

    const pedido2 = await servicioPedidos.crearPedido(
      cliente2.id,
      [
        {
          idProducto: polloEntero.id,
          nombreProducto: polloEntero.nombreProducto,
          cantidad: 2,
          precioUnitario: polloEntero.precioVenta,
          subtotal: 2 * polloEntero.precioVenta
        }
      ],
      PrioridadPedido.NORMAL,
      cliente2.direcciones[0]?.calle
    );
    console.log(`   ✓ Pedido creado: ${pedido2.id} - Total: $${pedido2.montoTotal}`);

    // 4. CONFIRMAR PEDIDOS (descuenta del inventario)
    console.log('\n✅ 4. Confirmando pedidos...');
    
    await servicioPedidos.confirmarPedido(pedido1.id);
    console.log(`   ✓ Pedido ${pedido1.id} confirmado`);
    
    await servicioPedidos.confirmarPedido(pedido2.id);
    console.log(`   ✓ Pedido ${pedido2.id} confirmado`);

    // Verificar stock después de confirmar
    const stockPollo = await servicioInventario.obtenerPorId(polloEntero.id);
    console.log(`   📊 Stock restante de ${polloEntero.nombreProducto}: ${stockPollo?.stockActual} ${polloEntero.unidad}`);

    // 5. CREAR RUTA DE ENTREGA
    console.log('\n🚚 5. Creando ruta de entrega...');
    
    const ruta = await servicioRutas.crearRuta(
      'Ruta Norte - Mañana',
      new Date(),
      'COND-001',
      'Juan Pérez',
      'VEH-001'
    );
    console.log(`   ✓ Ruta creada: ${ruta.nombreRuta}`);

    // Agregar pedidos a la ruta
    await servicioRutas.agregarParada(ruta.id, {
      idPedido: pedido1.id,
      idCliente: cliente1.id,
      nombreCliente: cliente1.nombre,
      direccion: cliente1.direcciones[0]?.calle || '',
      coordenadas: cliente1.direcciones[0]?.coordenadas,
      completada: false,
      secuencia: 1
    });
    console.log(`   ✓ Parada agregada: ${cliente1.nombre}`);

    await servicioRutas.agregarParada(ruta.id, {
      idPedido: pedido2.id,
      idCliente: cliente2.id,
      nombreCliente: cliente2.nombre,
      direccion: cliente2.direcciones[0]?.calle || '',
      coordenadas: cliente2.direcciones[0]?.coordenadas,
      completada: false,
      secuencia: 2
    });
    console.log(`   ✓ Parada agregada: ${cliente2.nombre}`);

    // Iniciar la ruta
    await servicioRutas.iniciarRuta(ruta.id);
    console.log(`   ✓ Ruta iniciada - Estado: EN_PROGRESO`);

    // 6. REGISTRAR TRANSACCIONES FINANCIERAS
    console.log('\n💰 6. Registrando transacciones financieras...');
    
    const venta1 = await servicioFinanzas.registrarTransaccion(
      TipoTransaccion.VENTA,
      pedido1.montoTotal,
      MetodoPago.CREDITO,
      `Venta - Pedido ${pedido1.id}`,
      pedido1.id,
      cliente1.id
    );
    await servicioFinanzas.completarTransaccion(venta1.id);
    console.log(`   ✓ Venta registrada: $${venta1.monto} (${venta1.metodoPago})`);

    const venta2 = await servicioFinanzas.registrarTransaccion(
      TipoTransaccion.VENTA,
      pedido2.montoTotal,
      MetodoPago.EFECTIVO,
      `Venta - Pedido ${pedido2.id}`,
      pedido2.id,
      cliente2.id
    );
    await servicioFinanzas.completarTransaccion(venta2.id);
    console.log(`   ✓ Venta registrada: $${venta2.monto} (${venta2.metodoPago})`);

    // 7. COMPLETAR ENTREGAS
    console.log('\n📍 7. Completando entregas...');
    
    await servicioRutas.completarParada(ruta.id, pedido1.id);
    console.log(`   ✓ Entrega completada: ${cliente1.nombre}`);
    
    await servicioRutas.completarParada(ruta.id, pedido2.id);
    console.log(`   ✓ Entrega completada: ${cliente2.nombre}`);

    await servicioRutas.completarRuta(ruta.id);
    console.log(`   ✓ Ruta completada`);

    // 8. REPORTES Y RESÚMENES
    console.log('\n📊 8. Generando reportes...');
    
    // Resumen de inventario
    const todosLosProductos = await servicioInventario.obtenerTodos();
    console.log(`\n   INVENTARIO ACTUAL:`);
    todosLosProductos.forEach(producto => {
      console.log(`   - ${producto.nombreProducto}: ${producto.stockActual} ${producto.unidad} (Nivel: ${producto.obtenerNivelStock()})`);
    });

    // Resumen financiero
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const resumenFinanciero = await servicioFinanzas.generarResumen(inicioMes, hoy);
    console.log(`\n   RESUMEN FINANCIERO (este mes):`);
    console.log(`   - Ingresos: $${resumenFinanciero.totalIngresos}`);
    console.log(`   - Egresos: $${resumenFinanciero.totalEgresos}`);
    console.log(`   - Balance: $${resumenFinanciero.balance}`);
    console.log(`   - Transacciones completadas: ${resumenFinanciero.transaccionesCompletadas}`);

    // Estado de clientes
    const todosLosClientes = await servicioClientes.obtenerTodos();
    console.log(`\n   CLIENTES:`);
    todosLosClientes.forEach(cliente => {
      console.log(`   - ${cliente.nombre} (${cliente.tipo})`);
      console.log(`     Pedidos: ${cliente.totalPedidos} | Total gastado: $${cliente.totalGastado}`);
    });

    // 9. MÓDULO DE MARKETING Y CONVERSIÓN
    console.log('\n🎯 9. Análisis de Marketing y Conversión...');
    
    // Analizar clientes para detectar potencial de conversión
    const analisisCliente1 = await servicioMarketing.analizarCliente(cliente1.id);
    console.log(`   ✓ Análisis de ${cliente1.nombre}:`);
    console.log(`     - Potencial: ${analisisCliente1.potencialConversion}`);
    console.log(`     - Puntaje: ${analisisCliente1.puntaje}/100`);
    console.log(`     - Frecuencia de compra: ${analisisCliente1.patronDemanda.frecuenciaCompra.toFixed(1)} pedidos/mes`);
    console.log(`     - Recomendaciones: ${analisisCliente1.recomendaciones.length}`);
    
    // Análisis por zona geográfica
    const analisisZonas = await servicioMarketing.analizarDemandaPorZona();
    console.log(`\n   📍 ANÁLISIS POR ZONA:`);
    analisisZonas.slice(0, 2).forEach(zona => {
      console.log(`   - ${zona.zona}:`);
      console.log(`     Clientes: ${zona.numeroClientes} | Rentabilidad: $${zona.rentabilidadPromedio.toFixed(0)}`);
    });

    // Clientes con potencial alto
    const clientesPotenciales = await servicioMarketing.obtenerClientesPotenciales();
    console.log(`\n   ⭐ CLIENTES CON ALTO POTENCIAL: ${clientesPotenciales.length}`);

    // 10. MÓDULO DE EXPANSIÓN VERTICAL
    console.log('\n🏗️ 10. Evaluación de Expansión Vertical...');
    
    // Evaluar producción propia vs compra externa
    const evaluacionProduccion = servicioMarketing.evaluarProduccionPropia(
      12000, // 12,000 kg/año demanda
      8000,  // $8,000/kg precio compra
      5000,  // $5,000/kg costo producción
      50000000, // $50M inversión inicial
      3000000   // $3M/mes costos operacionales
    );

    console.log(`   📊 EVALUACIÓN FINANCIERA:`);
    console.log(`     - Inversión inicial: $${evaluacionProduccion.inversionInicial.toLocaleString()}`);
    console.log(`     - ROI: ${evaluacionProduccion.roi.toFixed(1)}%`);
    console.log(`     - Período de retorno: ${evaluacionProduccion.periodoRetorno} meses`);
    console.log(`     - Ahorro estimado (2 años): $${evaluacionProduccion.ahorroEstimado.toLocaleString()}`);
    console.log(`     - VAN: $${evaluacionProduccion.valorActualNeto.toFixed(0).toLocaleString()}`);

    // Crear oportunidad de expansión
    const oportunidadGranjas = await servicioMarketing.crearOportunidadExpansion(
      'Adquisición de Granja Avícola',
      'Inversión en producción propia de pollo para reducir dependencia de proveedores',
      TipoActivoProductivo.ANIMALES,
      {
        capacidadAnualKg: 12000,
        tiempoProduccionMeses: 3,
        costosOperacionalesMensuales: 3000000,
        ventaEstimadaMensual: 8000000,
        puntoEquilibrio: 12
      },
      evaluacionProduccion,
      'Finca en Cundinamarca - 5 hectáreas'
    );

    console.log(`\n   ✓ Oportunidad creada: ${oportunidadGranjas.nombre}`);
    console.log(`     - Tipo: ${oportunidadGranjas.tipoActivo}`);
    console.log(`     - Estado: ${oportunidadGranjas.estado}`);
    console.log(`     - Prioridad: ${oportunidadGranjas.calcularPrioridad()}/100`);
    console.log(`     - ¿Viable?: ${oportunidadGranjas.esViableFinancieramente() ? 'SÍ ✅' : 'NO ❌'}`);

    // 11. REPORTE DE INTELIGENCIA DE MERCADO
    console.log('\n📈 11. Reporte de Inteligencia de Mercado...');
    
    const reporteInteligencia = await servicioMarketing.generarReporteInteligencia();
    console.log(`\n   RESUMEN ESTRATÉGICO:`);
    console.log(`   - Total clientes: ${reporteInteligencia.totalClientes}`);
    console.log(`   - Clientes con potencial: ${reporteInteligencia.clientesConPotencial}`);
    console.log(`   - Zonas analizadas: ${reporteInteligencia.analisisPorZona.length}`);
    console.log(`   - Oportunidades viables: ${reporteInteligencia.mejoresOportunidades.length}`);
    
    console.log(`\n   RECOMENDACIONES ESTRATÉGICAS:`);
    reporteInteligencia.recomendacionesEstrategicas.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec}`);
    });

    console.log('\n✅ ¡Sistema funcionando correctamente!\n');
    console.log('=== FIN DE LA DEMOSTRACIÓN ===\n');

  } catch (error) {
    console.error('❌ Error en la demostración:', error);
    if (error instanceof Error) {
      console.error('   Mensaje:', error.message);
    }
  }
}

// Ejecutar la demostración
main().catch(console.error);
