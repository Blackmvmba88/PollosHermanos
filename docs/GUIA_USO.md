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
