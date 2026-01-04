/**
 * PollosHermanos - WebUI Server Entry Point
 * Inicia el servidor web con datos de demostración
 */

import { WebUIServer } from './infrastructure/api/server';
import { CategoriaProducto, UnidadMedida } from './domain/entities/ItemInventario';
import { TipoCliente } from './domain/entities/Cliente';
import { PrioridadPedido } from './domain/entities/Pedido';
import { TipoTransaccion, MetodoPago } from './domain/entities/TransaccionFinanciera';

async function iniciarConDatosDemostracion() {
  console.log('=== INICIANDO POLLOS HERMANOS - WebUI ===\n');
  
  // Crear servidor
  const server = new WebUIServer(3000);
  const servicios = server.getServicios();

  try {
    // Agregar productos al inventario
    console.log('📦 Agregando productos al inventario...');
    const polloEntero = await servicios.inventario.agregarProducto(
      'Pollo Entero',
      CategoriaProducto.POLLO,
      50,
      UnidadMedida.KG,
      10,
      100,
      8000,
      12000
    );
    console.log(`   ✓ ${polloEntero.nombreProducto}`);

    const polloPresa = await servicios.inventario.agregarProducto(
      'Pollo en Presas',
      CategoriaProducto.POLLO,
      30,
      UnidadMedida.KG,
      8,
      80,
      9000,
      13500
    );
    console.log(`   ✓ ${polloPresa.nombreProducto}`);

    const huevos = await servicios.inventario.agregarProducto(
      'Huevos Frescos',
      CategoriaProducto.HUEVOS,
      30,
      UnidadMedida.DOCENA,
      5,
      50,
      4000,
      6000
    );
    console.log(`   ✓ ${huevos.nombreProducto}`);

    const visceras = await servicios.inventario.agregarProducto(
      'Vísceras',
      CategoriaProducto.PROCESADOS,
      15,
      UnidadMedida.KG,
      5,
      30,
      3000,
      5000
    );
    console.log(`   ✓ ${visceras.nombreProducto}`);

    // Registrar clientes
    console.log('\n👥 Registrando clientes...');
    const cliente1 = await servicios.clientes.registrarCliente(
      'Restaurante El Buen Sabor',
      TipoCliente.RESTAURANTE,
      { telefono: '3001234567', email: 'elbuensabor@email.com' },
      [{ 
        calle: 'Calle 50 #30-20', 
        ciudad: 'Bogotá',
        coordenadas: { latitud: 4.6097, longitud: -74.0817 }
      }],
      500000
    );
    console.log(`   ✓ ${cliente1.nombre}`);

    const cliente2 = await servicios.clientes.registrarCliente(
      'Supermercado La Esquina',
      TipoCliente.MAYORISTA,
      { telefono: '3109876543', email: 'laesquina@email.com' },
      [{ 
        calle: 'Carrera 15 #80-45', 
        ciudad: 'Bogotá',
        coordenadas: { latitud: 4.6667, longitud: -74.0549 }
      }],
      1000000
    );
    console.log(`   ✓ ${cliente2.nombre}`);

    const cliente3 = await servicios.clientes.registrarCliente(
      'María García',
      TipoCliente.MINORISTA,
      { telefono: '3201112233' },
      [{ 
        calle: 'Calle 100 #20-15', 
        ciudad: 'Bogotá',
        coordenadas: { latitud: 4.6855, longitud: -74.0476 }
      }]
    );
    console.log(`   ✓ ${cliente3.nombre}`);

    const cliente4 = await servicios.clientes.registrarCliente(
      'Restaurante Las Delicias',
      TipoCliente.RESTAURANTE,
      { telefono: '3154445566', email: 'lasdelicias@email.com' },
      [{ 
        calle: 'Carrera 7 #45-30', 
        ciudad: 'Bogotá',
        coordenadas: { latitud: 4.6280, longitud: -74.0704 }
      }],
      300000
    );
    console.log(`   ✓ ${cliente4.nombre}`);

    // Crear pedidos
    console.log('\n📝 Creando pedidos...');
    const pedido1 = await servicios.pedidos.crearPedido(
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
    await servicios.pedidos.confirmarPedido(pedido1.id);
    console.log(`   ✓ Pedido ${pedido1.id} - ${cliente1.nombre}`);

    const pedido2 = await servicios.pedidos.crearPedido(
      cliente2.id,
      [
        {
          idProducto: polloPresa.id,
          nombreProducto: polloPresa.nombreProducto,
          cantidad: 15,
          precioUnitario: polloPresa.precioVenta,
          subtotal: 15 * polloPresa.precioVenta
        },
        {
          idProducto: visceras.id,
          nombreProducto: visceras.nombreProducto,
          cantidad: 5,
          precioUnitario: visceras.precioVenta,
          subtotal: 5 * visceras.precioVenta
        }
      ],
      PrioridadPedido.ALTA,
      cliente2.direcciones[0]?.calle
    );
    await servicios.pedidos.confirmarPedido(pedido2.id);
    console.log(`   ✓ Pedido ${pedido2.id} - ${cliente2.nombre}`);

    const pedido3 = await servicios.pedidos.crearPedido(
      cliente3.id,
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
      cliente3.direcciones[0]?.calle
    );
    await servicios.pedidos.confirmarPedido(pedido3.id);
    console.log(`   ✓ Pedido ${pedido3.id} - ${cliente3.nombre}`);

    // Crear rutas de entrega
    console.log('\n🚚 Creando rutas de entrega...');
    const ruta1 = await servicios.rutas.crearRuta(
      'Ruta Norte - Mañana',
      new Date(),
      'COND-001',
      'Juan Pérez',
      'VEH-001'
    );

    await servicios.rutas.agregarParada(ruta1.id, {
      idPedido: pedido1.id,
      idCliente: cliente1.id,
      nombreCliente: cliente1.nombre,
      direccion: cliente1.direcciones[0]?.calle || '',
      coordenadas: cliente1.direcciones[0]?.coordenadas,
      completada: false,
      secuencia: 1
    });

    await servicios.rutas.agregarParada(ruta1.id, {
      idPedido: pedido2.id,
      idCliente: cliente2.id,
      nombreCliente: cliente2.nombre,
      direccion: cliente2.direcciones[0]?.calle || '',
      coordenadas: cliente2.direcciones[0]?.coordenadas,
      completada: false,
      secuencia: 2
    });

    await servicios.rutas.iniciarRuta(ruta1.id);
    console.log(`   ✓ ${ruta1.nombreRuta} - ${ruta1.paradas.length} paradas`);

    const ruta2 = await servicios.rutas.crearRuta(
      'Ruta Sur - Tarde',
      new Date(),
      'COND-002',
      'María López',
      'VEH-002'
    );

    await servicios.rutas.agregarParada(ruta2.id, {
      idPedido: pedido3.id,
      idCliente: cliente3.id,
      nombreCliente: cliente3.nombre,
      direccion: cliente3.direcciones[0]?.calle || '',
      coordenadas: cliente3.direcciones[0]?.coordenadas,
      completada: false,
      secuencia: 1
    });

    console.log(`   ✓ ${ruta2.nombreRuta} - ${ruta2.paradas.length} paradas`);

    // Registrar transacciones financieras
    console.log('\n💰 Registrando transacciones...');
    const venta1 = await servicios.finanzas.registrarTransaccion(
      TipoTransaccion.VENTA,
      pedido1.montoTotal,
      MetodoPago.CREDITO,
      `Venta - Pedido ${pedido1.id}`,
      pedido1.id,
      cliente1.id
    );
    await servicios.finanzas.completarTransaccion(venta1.id);
    console.log(`   ✓ Venta: $${venta1.monto.toLocaleString()}`);

    const venta2 = await servicios.finanzas.registrarTransaccion(
      TipoTransaccion.VENTA,
      pedido2.montoTotal,
      MetodoPago.TRANSFERENCIA,
      `Venta - Pedido ${pedido2.id}`,
      pedido2.id,
      cliente2.id
    );
    await servicios.finanzas.completarTransaccion(venta2.id);
    console.log(`   ✓ Venta: $${venta2.monto.toLocaleString()}`);

    const venta3 = await servicios.finanzas.registrarTransaccion(
      TipoTransaccion.VENTA,
      pedido3.montoTotal,
      MetodoPago.EFECTIVO,
      `Venta - Pedido ${pedido3.id}`,
      pedido3.id,
      cliente3.id
    );
    await servicios.finanzas.completarTransaccion(venta3.id);
    console.log(`   ✓ Venta: $${venta3.monto.toLocaleString()}`);

    console.log('\n✅ Datos de demostración cargados exitosamente!\n');

  } catch (error) {
    console.error('❌ Error al cargar datos de demostración:', error);
  }

  // Iniciar servidor
  server.iniciar();
}

// Ejecutar
iniciarConDatosDemostracion().catch(console.error);
