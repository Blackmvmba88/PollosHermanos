# Guía de Uso - PollosHermanos

Esta guía te ayudará a entender cómo usar el sistema PollosHermanos en diferentes escenarios del día a día de un negocio de distribución de alimentos.

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Escenarios Comunes](#escenarios-comunes)
3. [Flujos de Trabajo](#flujos-de-trabajo)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Solución de Problemas](#solución-de-problemas)

## Configuración Inicial

### 1. Configurar el Sistema

```typescript
// Inicializar repositorios
const repoPedidos = new RepositorioPedidosMemoria();
const repoInventario = new RepositorioInventarioMemoria();
const repoClientes = new RepositorioClientesMemoria();
const repoRutas = new RepositorioRutasMemoria();
const repoFinanzas = new RepositorioFinanzasMemoria();

// Inicializar servicios
const servicioInventario = new ServicioInventario(repoInventario);
const servicioClientes = new ServicioClientes(repoClientes);
const servicioPedidos = new ServicioPedidos(repoPedidos, repoInventario, repoClientes);
const servicioRutas = new ServicioRutas(repoRutas, repoPedidos);
const servicioFinanzas = new ServicioFinanzas(repoFinanzas);
```

### 2. Cargar Inventario Inicial

```typescript
// Productos de pollo
await servicioInventario.agregarProducto(
  'Pollo Entero',
  CategoriaProducto.POLLO,
  100,  // stock inicial
  UnidadMedida.KG,
  20,   // stock mínimo
  200,  // stock máximo
  8000, // costo
  12000 // precio venta
);

await servicioInventario.agregarProducto(
  'Pechuga de Pollo',
  CategoriaProducto.POLLO,
  50,
  UnidadMedida.KG,
  10,
  100,
  12000,
  18000
);

// Huevos
await servicioInventario.agregarProducto(
  'Huevos AA',
  CategoriaProducto.HUEVOS,
  50,
  UnidadMedida.DOCENA,
  10,
  100,
  4000,
  6000
);
```

### 3. Registrar Clientes Iniciales

```typescript
// Cliente mayorista (restaurante)
await servicioClientes.registrarCliente(
  'Restaurante La Esquina',
  TipoCliente.RESTAURANTE,
  { 
    telefono: '3001234567', 
    email: 'laesquina@email.com' 
  },
  [{
    calle: 'Calle 50 #30-20',
    ciudad: 'Bogotá',
    coordenadas: { latitud: 4.6097, longitud: -74.0817 }
  }],
  1000000, // límite de crédito
  'Cliente VIP - entrega prioritaria'
);

// Cliente minorista
await servicioClientes.registrarCliente(
  'Juan Pérez',
  TipoCliente.MINORISTA,
  { telefono: '3109876543' },
  [{
    calle: 'Carrera 15 #80-45',
    ciudad: 'Bogotá'
  }]
);
```

## Escenarios Comunes

### Escenario 1: Recibir un Pedido por Teléfono

```typescript
// 1. Buscar el cliente
const clientes = await servicioClientes.buscarPorTelefono('3001234567');
const cliente = clientes[0];

if (!cliente) {
  // Registrar nuevo cliente si no existe
  const nuevoCliente = await servicioClientes.registrarCliente(
    'Nombre del Cliente',
    TipoCliente.MINORISTA,
    { telefono: '3001234567' },
    [{ calle: 'Dirección', ciudad: 'Ciudad' }]
  );
}

// 2. Verificar disponibilidad de productos
const polloEntero = await servicioInventario.buscarPorNombre('Pollo Entero');
const disponible = await servicioInventario.verificarDisponibilidad(
  polloEntero[0].id,
  5
);

if (!disponible) {
  console.log('⚠️ Stock insuficiente');
  // Ofrecer alternativas o fecha posterior
}

// 3. Crear el pedido
const pedido = await servicioPedidos.crearPedido(
  cliente.id,
  [
    {
      idProducto: polloEntero[0].id,
      nombreProducto: polloEntero[0].nombreProducto,
      cantidad: 5,
      precioUnitario: polloEntero[0].precioVenta,
      subtotal: 5 * polloEntero[0].precioVenta
    }
  ],
  PrioridadPedido.NORMAL,
  cliente.direcciones[0].calle,
  new Date(), // fecha de entrega hoy
  'Llamar antes de llegar'
);

console.log(`✅ Pedido creado: ${pedido.id}`);
console.log(`   Total: $${pedido.montoTotal}`);
```

### Escenario 2: Confirmar Pedidos de la Mañana

```typescript
// 1. Obtener todos los pedidos pendientes
const pedidosPendientes = await servicioPedidos.obtenerPedidosPorEstado(
  EstadoPedido.PENDIENTE
);

console.log(`📋 Pedidos pendientes: ${pedidosPendientes.length}`);

// 2. Confirmar cada pedido (descuenta del inventario)
for (const pedido of pedidosPendientes) {
  try {
    await servicioPedidos.confirmarPedido(pedido.id);
    console.log(`✅ Pedido ${pedido.id} confirmado`);
    
    // Registrar la venta
    await servicioFinanzas.registrarTransaccion(
      TipoTransaccion.VENTA,
      pedido.montoTotal,
      MetodoPago.CREDITO, // o el método que corresponda
      `Venta - Pedido ${pedido.id}`,
      pedido.id,
      pedido.idCliente
    );
  } catch (error) {
    console.error(`❌ Error con pedido ${pedido.id}:`, error.message);
    // Notificar al cliente sobre el problema
  }
}

// 3. Verificar el inventario después de confirmar
const productosParaReponer = await servicioInventario.obtenerProductosParaReponer();
if (productosParaReponer.length > 0) {
  console.log('⚠️ Productos que necesitan reposición:');
  productosParaReponer.forEach(p => {
    console.log(`   - ${p.nombreProducto}: ${p.stockActual} ${p.unidad}`);
  });
}
```

### Escenario 3: Planificar Rutas de Entrega

```typescript
// 1. Obtener pedidos listos para entrega
const pedidosListos = await servicioPedidos.obtenerPedidosPorEstado(
  EstadoPedido.CONFIRMADO
);

// 2. Crear rutas por zona
const ruta1 = await servicioRutas.crearRuta(
  'Ruta Norte - Mañana',
  new Date(),
  'COND-001',
  'Carlos Rodríguez',
  'VEH-001'
);

// 3. Agregar pedidos a la ruta
for (const pedido of pedidosListos) {
  const cliente = await servicioClientes.obtenerPorId(pedido.idCliente);
  
  if (cliente) {
    await servicioRutas.agregarParada(ruta1.id, {
      idPedido: pedido.id,
      idCliente: cliente.id,
      nombreCliente: cliente.nombre,
      direccion: pedido.direccionEntrega || cliente.direcciones[0].calle,
      coordenadas: cliente.direcciones[0].coordenadas,
      completada: false,
      secuencia: 0 // se asigna automáticamente
    });
    
    // Actualizar estado del pedido
    await servicioPedidos.actualizarEstado(
      pedido.id,
      EstadoPedido.LISTO_PARA_ENTREGA
    );
  }
}

console.log(`✅ Ruta creada con ${ruta1.paradas.length} paradas`);

// 4. Optimizar orden de paradas (manualmente o con algoritmo)
// const nuevoOrden = optimizarRuta(ruta1.paradas);
// await servicioRutas.reordenarParadas(ruta1.id, nuevoOrden);

// 5. Iniciar la ruta
await servicioRutas.iniciarRuta(ruta1.id);
console.log('🚚 Ruta iniciada');
```

### Escenario 4: Completar Entregas (Desde Móvil)

```typescript
// 1. Obtener la ruta activa del conductor
const rutasActivas = await servicioRutas.obtenerPorConductor('COND-001');
const miRuta = rutasActivas.find(r => r.estado === EstadoRuta.EN_PROGRESO);

if (!miRuta) {
  console.log('No hay rutas activas');
  return;
}

// 2. Obtener siguiente parada
const siguienteParada = miRuta.obtenerSiguienteParada();

if (siguienteParada) {
  console.log('📍 Siguiente parada:');
  console.log(`   Cliente: ${siguienteParada.nombreCliente}`);
  console.log(`   Dirección: ${siguienteParada.direccion}`);
  console.log(`   Pedido: ${siguienteParada.idPedido}`);
}

// 3. Al llegar al cliente, completar la entrega
await servicioRutas.completarParada(miRuta.id, siguienteParada.idPedido);
console.log('✅ Entrega completada');

// 4. Ver progreso
const progreso = miRuta.obtenerProgreso();
console.log(`Progreso: ${progreso.toFixed(0)}%`);
console.log(`Paradas completadas: ${miRuta.obtenerNumeroParadasCompletadas()}`);
console.log(`Paradas pendientes: ${miRuta.obtenerNumeroParadasPendientes()}`);

// 5. Al completar todas, finalizar la ruta
if (miRuta.obtenerNumeroParadasPendientes() === 0) {
  await servicioRutas.completarRuta(miRuta.id);
  console.log('🎉 ¡Ruta completada!');
}
```

### Escenario 5: Cierre del Día

```typescript
// 1. Verificar pedidos pendientes
const pedidosPendientes = await servicioPedidos.obtenerPedidosPorEstado(
  EstadoPedido.PENDIENTE
);

if (pedidosPendientes.length > 0) {
  console.log(`⚠️ Hay ${pedidosPendientes.length} pedidos sin confirmar`);
}

// 2. Verificar rutas
const rutasEnProgreso = await servicioRutas.obtenerPorEstado(
  EstadoRuta.EN_PROGRESO
);

if (rutasEnProgreso.length > 0) {
  console.log(`⚠️ Hay ${rutasEnProgreso.length} rutas aún en curso`);
}

// 3. Generar resumen financiero del día
const hoy = new Date();
const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);

const resumen = await servicioFinanzas.generarResumen(inicioDia, finDia);

console.log('\n📊 RESUMEN DEL DÍA');
console.log('═══════════════════════════');
console.log(`Ingresos:      $${resumen.totalIngresos.toLocaleString()}`);
console.log(`Egresos:       $${resumen.totalEgresos.toLocaleString()}`);
console.log(`Balance:       $${resumen.balance.toLocaleString()}`);
console.log(`Transacciones: ${resumen.transaccionesCompletadas}`);

// 4. Verificar inventario
const productosStockBajo = await servicioInventario.obtenerPorNivelStock(
  NivelStock.STOCK_BAJO
);

console.log('\n📦 INVENTARIO');
console.log('═══════════════════════════');
if (productosStockBajo.length > 0) {
  console.log('Productos con stock bajo:');
  productosStockBajo.forEach(p => {
    console.log(`  - ${p.nombreProducto}: ${p.stockActual} ${p.unidad}`);
  });
} else {
  console.log('✅ Stock en niveles normales');
}

// 5. Verificar productos vencidos
const productosVencidos = await servicioInventario.obtenerProductosVencidos();
if (productosVencidos.length > 0) {
  console.log('\n⚠️ PRODUCTOS VENCIDOS:');
  productosVencidos.forEach(p => {
    console.log(`  - ${p.nombreProducto} (Lote: ${p.numeroLote})`);
  });
}
```

### Escenario 6: Gestionar Inventario

```typescript
// Recibir mercancía del proveedor
const productos = await servicioInventario.buscarPorNombre('Pollo Entero');
const producto = productos[0];

await servicioInventario.agregarStock(
  producto.id,
  50, // cantidad
  'LOTE-2024-001', // número de lote
  new Date(2024, 11, 31) // fecha de vencimiento
);

// Registrar la compra en finanzas
await servicioFinanzas.registrarTransaccion(
  TipoTransaccion.COMPRA,
  50 * producto.costoUnitario,
  MetodoPago.TRANSFERENCIA,
  'Compra de pollo al proveedor',
  undefined,
  undefined,
  'PROV-001',
  'Factura #12345'
);

console.log('✅ Stock actualizado y compra registrada');
```

## Flujos de Trabajo

### Flujo Completo: Del Pedido a la Entrega

```typescript
async function flujoCompleto() {
  // 1. Cliente llama para hacer un pedido
  const cliente = await servicioClientes.buscarPorTelefono('3001234567');
  
  // 2. Crear pedido
  const pedido = await servicioPedidos.crearPedido(
    cliente[0].id,
    items,
    PrioridadPedido.NORMAL
  );
  
  // 3. Confirmar pedido
  await servicioPedidos.confirmarPedido(pedido.id);
  
  // 4. Agregar a ruta de entrega
  const ruta = await servicioRutas.crearRuta('Ruta 1', new Date());
  await servicioRutas.agregarParada(ruta.id, paradaDelPedido);
  
  // 5. Iniciar ruta
  await servicioRutas.iniciarRuta(ruta.id);
  
  // 6. Completar entrega
  await servicioRutas.completarParada(ruta.id, pedido.id);
  
  // 7. Registrar transacción
  const transaccion = await servicioFinanzas.registrarTransaccion(
    TipoTransaccion.VENTA,
    pedido.montoTotal,
    MetodoPago.EFECTIVO,
    `Venta - Pedido ${pedido.id}`
  );
  await servicioFinanzas.completarTransaccion(transaccion.id);
  
  console.log('✅ Flujo completado exitosamente');
}
```

## Mejores Prácticas

### 1. Gestión de Inventario

- ✅ Confirmar pedidos solo cuando estés seguro de poder cumplir
- ✅ Revisar productos que necesitan reposición diariamente
- ✅ Establecer alertas de stock mínimo realistas
- ✅ Registrar siempre números de lote y fechas de vencimiento

### 2. Gestión de Pedidos

- ✅ Verificar disponibilidad antes de confirmar
- ✅ Establecer prioridades claras
- ✅ Confirmar pedidos en horarios específicos
- ✅ Cancelar con devolución de stock si es necesario

### 3. Rutas de Entrega

- ✅ Agrupar pedidos por zona geográfica
- ✅ Considerar ventanas horarias de clientes
- ✅ Asignar rutas a conductores con experiencia en la zona
- ✅ Optimizar el orden de paradas

### 4. Gestión Financiera

- ✅ Registrar todas las transacciones inmediatamente
- ✅ Completar transacciones solo cuando se confirme el pago
- ✅ Revisar el resumen financiero diariamente
- ✅ Hacer respaldos regulares

## Solución de Problemas

### Problema: "Stock insuficiente"

```typescript
// Verificar el stock actual
const producto = await servicioInventario.obtenerPorId(idProducto);
console.log(`Stock actual: ${producto?.stockActual}`);

// Opciones:
// 1. Reponer stock
await servicioInventario.agregarStock(idProducto, cantidad);

// 2. Ofrecer fecha de entrega posterior
// 3. Sugerir producto alternativo
```

### Problema: "Cliente excede límite de crédito"

```typescript
const cliente = await servicioClientes.obtenerPorId(idCliente);
console.log(`Saldo actual: $${cliente?.saldoActual}`);
console.log(`Límite: $${cliente?.limiteCredito}`);

// Opciones:
// 1. Solicitar pago de saldo pendiente
await servicioClientes.registrarPago(idCliente, montoPago);

// 2. Aumentar límite de crédito
await servicioClientes.actualizarCliente(idCliente, {
  limiteCredito: nuevoLimite
});

// 3. Solicitar pago en efectivo
```

### Problema: "No se puede cancelar el pedido"

```typescript
const pedido = await servicioPedidos.obtenerPorId(idPedido);

if (!pedido?.puedeCancelarse()) {
  console.log(`Estado actual: ${pedido?.estado}`);
  // Los pedidos EN_CAMINO o ENTREGADOS no se pueden cancelar
  // Considerar devolución en su lugar
}
```

## Conclusión

Esta guía cubre los escenarios más comunes en la operación diaria. Para casos más específicos o preguntas, consulta la [documentación de arquitectura](./ARQUITECTURA.md) o abre un issue en GitHub.

¡Éxito con tu negocio! 🚀

## Módulo de Marketing, Conversión y Expansión Vertical

### ¿Qué es?

El módulo de marketing y expansión vertical es un sistema estratégico que transforma datos operativos en inteligencia de mercado. Permite:

1. **Análisis de Conversión**: Identificar clientes con potencial para convertirse en mayoristas o distribuidores
2. **Inteligencia de Mercado**: Analizar patrones de demanda por zona geográfica
3. **Expansión Vertical**: Evaluar la viabilidad de producción propia vs compra externa
4. **Planificación de Activos**: Gestionar oportunidades de inversión en infraestructura productiva

### Caso de Uso: De Minorista a Mayorista

#### Paso 1: Analizar Cliente

```typescript
// Analizar un cliente específico
const analisis = await servicioMarketing.analizarCliente(idCliente);

console.log(`Cliente: ${analisis.nombreCliente}`);
console.log(`Potencial: ${analisis.potencialConversion}`);
console.log(`Puntaje: ${analisis.puntaje}/100`);

// Ver patrón de demanda
console.log(`Zona: ${analisis.patronDemanda.zonaGeografica}`);
console.log(`Volumen promedio: ${analisis.patronDemanda.volumenPromedio}`);
console.log(`Frecuencia: ${analisis.patronDemanda.frecuenciaCompra} pedidos/mes`);
console.log(`Productos preferidos: ${analisis.patronDemanda.productosPreferidos.join(', ')}`);

// Ver recomendaciones
analisis.recomendaciones.forEach((rec, idx) => {
  console.log(`${idx + 1}. ${rec}`);
});
```

**Criterios de Clasificación:**

- **BAJO**: < 10 unidades/pedido promedio
- **MEDIO**: 10-20 unidades/pedido, compra ocasionalmente
- **ALTO**: 20-50 unidades/pedido, compra regularmente (2+ veces/mes)
- **MAYORISTA**: 50-100 unidades/pedido, compra frecuentemente (4+ veces/mes)
- **DISTRIBUIDOR**: 100+ unidades/pedido, compra muy frecuentemente (8+ veces/mes)

#### Paso 2: Identificar Clientes con Alto Potencial

```typescript
// Obtener todos los clientes con alto potencial (puntaje >= 70)
const clientesPotenciales = await servicioMarketing.obtenerClientesPotenciales();

console.log(`Encontrados ${clientesPotenciales.length} clientes con alto potencial:`);
clientesPotenciales.forEach(analisis => {
  console.log(`- ${analisis.nombreCliente}: ${analisis.puntaje}/100`);
  console.log(`  Potencial: ${analisis.potencialConversion}`);
  console.log(`  Compra ${analisis.patronDemanda.frecuenciaCompra.toFixed(1)} veces/mes`);
});
```

#### Paso 3: Estrategia de Conversión

```typescript
// Para cada cliente potencial, implementar estrategia
for (const analisis of clientesPotenciales) {
  if (analisis.esCandidatoDistribuidor()) {
    console.log(`Acción: Contactar para distribución exclusiva`);
    console.log(`Propuesta: Precios especiales + crédito ampliado`);
  } else if (analisis.esCandidatoMayorista()) {
    console.log(`Acción: Ofrecer programa de mayoristas`);
    console.log(`Propuesta: Descuentos por volumen`);
  } else {
    console.log(`Acción: Programa de lealtad para aumentar frecuencia`);
  }
}
```

### Caso de Uso: Análisis Geográfico de Mercado

```typescript
// Analizar demanda por zona
const analisisZonas = await servicioMarketing.analizarDemandaPorZona();

console.log('ANÁLISIS POR ZONA GEOGRÁFICA:');
analisisZonas.forEach(zona => {
  console.log(`\nZona: ${zona.zona}`);
  console.log(`  Clientes: ${zona.numeroClientes}`);
  console.log(`  Volumen total: ${zona.volumenTotal} pedidos`);
  console.log(`  Rentabilidad total: $${zona.rentabilidadTotal.toLocaleString()}`);
  console.log(`  Rentabilidad promedio: $${zona.rentabilidadPromedio.toFixed(0)}`);
  
  if (zona.clientesPotenciales.length > 0) {
    console.log(`  Clientes potenciales: ${zona.clientesPotenciales.join(', ')}`);
  }
});

// Identificar zonas de expansión
const mejorZona = analisisZonas[0];
if (mejorZona.rentabilidadTotal >= 1000000) {
  console.log(`\n💡 Recomendación: Expandir operaciones en ${mejorZona.zona}`);
  console.log(`   Justificación: Mayor rentabilidad y demanda establecida`);
}
```

### Caso de Uso: Evaluación de Producción Propia

#### Paso 1: Calcular Demanda Actual

```typescript
// Calcular demanda anual basada en histórico
const clientes = await servicioClientes.obtenerTodos();
const demandaTotalAnual = clientes.reduce((sum, c) => {
  // Asumir que cada pedido representa X kg de producto
  return sum + (c.totalPedidos * 10); // ejemplo: 10 kg por pedido promedio
}, 0);

console.log(`Demanda anual estimada: ${demandaTotalAnual} kg`);
```

#### Paso 2: Evaluar Producción vs Compra

```typescript
// Evaluar viabilidad financiera
const evaluacion = servicioMarketing.evaluarProduccionPropia(
  demandaTotalAnual,    // 12,000 kg/año
  8000,                  // $8,000/kg precio compra actual
  5000,                  // $5,000/kg costo producción estimado
  50000000,              // $50M inversión inicial (terreno + galpones)
  3000000                // $3M/mes costos operacionales
);

console.log('EVALUACIÓN FINANCIERA:');
console.log(`Inversión inicial: $${evaluacion.inversionInicial.toLocaleString()}`);
console.log(`ROI: ${evaluacion.roi.toFixed(1)}%`);
console.log(`Período de retorno: ${evaluacion.periodoRetorno} meses`);
console.log(`Ahorro estimado (2 años): $${evaluacion.ahorroEstimado.toLocaleString()}`);
console.log(`VAN: $${evaluacion.valorActualNeto.toFixed(0).toLocaleString()}`);
console.log(`TIR: ${evaluacion.tasaInternaRetorno.toFixed(1)}%`);

// Comparativa
const ahorroPorcentaje = ((evaluacion.ahorroEstimado / evaluacion.costoCompraExterna) * 100).toFixed(1);
console.log(`\nAhorro vs compra externa: ${ahorroPorcentaje}%`);
```

#### Paso 3: Crear Oportunidad de Expansión

```typescript
// Si la evaluación es positiva, crear oportunidad
if (evaluacion.roi > 20 && evaluacion.periodoRetorno <= 24) {
  const oportunidad = await servicioMarketing.crearOportunidadExpansion(
    'Adquisición de Granja Avícola',
    'Inversión en producción propia de pollo para reducir costos y asegurar suministro',
    TipoActivoProductivo.ANIMALES,
    {
      capacidadAnualKg: demandaTotalAnual,
      tiempoProduccionMeses: 3,
      costosOperacionalesMensuales: 3000000,
      ventaEstimadaMensual: 8000000,
      puntoEquilibrio: evaluacion.periodoRetorno
    },
    evaluacion,
    'Finca en Cundinamarca - 5 hectáreas con acceso a agua'
  );

  console.log(`\n✓ Oportunidad creada: ${oportunidad.nombre}`);
  console.log(`  ID: ${oportunidad.id}`);
  console.log(`  Prioridad: ${oportunidad.calcularPrioridad()}/100`);
  console.log(`  Estado: ${oportunidad.estado}`);
  console.log(`  ¿Viable?: ${oportunidad.esViableFinancieramente() ? 'SÍ ✅' : 'NO ❌'}`);
}
```

### Caso de Uso: Reporte de Inteligencia de Mercado

```typescript
// Generar reporte completo
const reporte = await servicioMarketing.generarReporteInteligencia();

console.log('═══════════════════════════════════════════');
console.log('   REPORTE DE INTELIGENCIA DE MERCADO');
console.log('═══════════════════════════════════════════\n');

console.log('RESUMEN GENERAL:');
console.log(`  Total clientes: ${reporte.totalClientes}`);
console.log(`  Clientes con potencial: ${reporte.clientesConPotencial}`);
console.log(`  Tasa de conversión potencial: ${((reporte.clientesConPotencial / reporte.totalClientes) * 100).toFixed(1)}%`);

console.log('\nTOP 5 ZONAS POR RENTABILIDAD:');
reporte.analisisPorZona.forEach((zona, idx) => {
  console.log(`  ${idx + 1}. ${zona.zona}`);
  console.log(`     Rentabilidad: $${zona.rentabilidadTotal.toLocaleString()}`);
  console.log(`     Clientes: ${zona.numeroClientes}`);
});

console.log('\nMEJORES OPORTUNIDADES DE EXPANSIÓN:');
reporte.mejoresOportunidades.forEach((oport, idx) => {
  console.log(`  ${idx + 1}. ${oport.nombre}`);
  console.log(`     ROI: ${oport.evaluacion.roi.toFixed(1)}%`);
  console.log(`     Ahorro estimado: $${oport.evaluacion.ahorroEstimado.toLocaleString()}`);
});

console.log('\nRECOMENDACIONES ESTRATÉGICAS:');
reporte.recomendacionesEstrategicas.forEach((rec, idx) => {
  console.log(`  ${idx + 1}. ${rec}`);
});
```

### Actualización Automática de Análisis

```typescript
// Actualizar análisis después de cada venta importante
async function registrarVentaYActualizar(idCliente: string, pedido: any) {
  // 1. Registrar el pedido normalmente
  const pedidoCreado = await servicioPedidos.crearPedido(...);
  
  // 2. Actualizar análisis del cliente
  const analisisActualizado = await servicioMarketing.actualizarAnalisisCliente(idCliente);
  
  // 3. Verificar si cambió el potencial
  if (analisisActualizado.potencialConversion === 'MAYORISTA' || 
      analisisActualizado.potencialConversion === 'DISTRIBUIDOR') {
    console.log(`🎯 ¡ATENCIÓN! Cliente ${analisisActualizado.nombreCliente} alcanzó potencial ${analisisActualizado.potencialConversion}`);
    console.log('   Acción recomendada: Contactar para oferta especial');
  }
  
  return pedidoCreado;
}
```

### Tipos de Activos Productivos

El sistema contempla diferentes tipos de activos para expansión vertical:

1. **TERRENO**: Adquisición de tierra para futura infraestructura
2. **GALPONES**: Construcción de instalaciones para producción
3. **ANIMALES**: Compra de aves para producción propia
4. **EQUIPAMIENTO**: Maquinaria, incubadoras, sistemas de alimentación
5. **INFRAESTRUCTURA**: Sistemas de agua, electricidad, refrigeración

```typescript
// Ejemplo: Crear múltiples oportunidades para análisis completo
const oportunidades = [
  {
    nombre: 'Compra de Terreno Agrícola',
    tipo: TipoActivoProductivo.TERRENO,
    inversion: 30000000
  },
  {
    nombre: 'Construcción de Galpones',
    tipo: TipoActivoProductivo.GALPONES,
    inversion: 80000000
  },
  {
    nombre: 'Adquisición de Aves',
    tipo: TipoActivoProductivo.ANIMALES,
    inversion: 50000000
  }
];

for (const oport of oportunidades) {
  const evaluacion = servicioMarketing.evaluarProduccionPropia(
    demandaAnual,
    precioCompra,
    costoProduccion,
    oport.inversion,
    costosOperacionales
  );
  
  await servicioMarketing.crearOportunidadExpansion(
    oport.nombre,
    `Inversión en ${oport.tipo.toLowerCase()}`,
    oport.tipo,
    proyeccion,
    evaluacion
  );
}
```

### Mejores Prácticas

1. **Análisis Regular**: Actualizar análisis de clientes mensualmente
2. **Seguimiento de Tendencias**: Monitorear cambios en patrones de demanda
3. **Evaluación Continua**: Revisar oportunidades de expansión trimestralmente
4. **Datos Reales**: Basar decisiones en datos históricos sólidos (mínimo 6 meses)
5. **Validación Múltiple**: Evaluar múltiples escenarios financieros
6. **Enfoque Gradual**: Comenzar con inversiones pequeñas antes de grandes expansiones

### Indicadores Clave (KPIs)

```typescript
// Dashboard de KPIs de marketing
async function generarDashboardMarketing() {
  const reporte = await servicioMarketing.generarReporteInteligencia();
  const analisis = await servicioMarketing.obtenerTodosAnalisis();
  const oportunidades = await servicioMarketing.obtenerOportunidadesViables();
  
  return {
    // Conversión
    tasaConversionPotencial: (reporte.clientesConPotencial / reporte.totalClientes) * 100,
    clientesMayoristas: analisis.filter(a => a.potencialConversion === 'MAYORISTA').length,
    clientesDistribuidores: analisis.filter(a => a.potencialConversion === 'DISTRIBUIDOR').length,
    
    // Geografía
    zonaMayorDemanda: reporte.analisisPorZona[0]?.zona,
    concentracionGeografica: reporte.analisisPorZona.length,
    
    // Expansión
    oportunidadesViables: oportunidades.length,
    inversionTotalPotencial: oportunidades.reduce((sum, o) => sum + o.evaluacion.inversionInicial, 0),
    roiPromedio: oportunidades.reduce((sum, o) => sum + o.evaluacion.roi, 0) / oportunidades.length
  };
}
```

### Integración con Otros Módulos

El módulo de marketing se integra con:

- **ServicioClientes**: Obtiene historial y datos demográficos
- **ServicioPedidos**: Analiza patrones de compra y frecuencia
- **ServicioFinanzas**: Utiliza datos de rentabilidad y gastos

```typescript
// Ejemplo de integración completa
async function analizarYActuar(idCliente: string) {
  // 1. Análisis de marketing
  const analisis = await servicioMarketing.analizarCliente(idCliente);
  
  // 2. Si tiene alto potencial, ajustar límite de crédito
  if (analisis.puntaje >= 70) {
    const cliente = await servicioClientes.obtenerPorId(idCliente);
    const nuevoLimite = (cliente?.limiteCredito || 0) * 1.5;
    
    await servicioClientes.actualizarCliente(idCliente, {
      limiteCredito: nuevoLimite
    });
    
    console.log(`✓ Límite de crédito aumentado a $${nuevoLimite.toLocaleString()}`);
  }
  
  // 3. Si es candidato a mayorista, crear promoción especial
  if (analisis.esCandidatoMayorista()) {
    console.log(`✓ Cliente calificado para programa de mayoristas`);
    console.log(`  Próxima acción: Contactar con oferta especial`);
  }
}
```

---

Este módulo convierte PollosHermanos en una plataforma inteligente que no solo gestiona operaciones, sino que impulsa el crecimiento estratégico del negocio desde la venta inicial hasta la producción autónoma.
