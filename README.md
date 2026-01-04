# PollosHermanos 🐔

Sistema tecnológico y operativo modular para pollerías y negocios de distribución local. Incluye control de pedidos, inventario, rutas de entrega, base de datos de clientes y seguimiento financiero básico. Diseñado desde la operación real para convertir un negocio tradicional en un modelo eficiente, escalable y replicable.

## 📚 Documentación

- **[ROADMAP.md](./ROADMAP.md)** - Plan de desarrollo completo 2025-2027 con fases, features y objetivos estratégicos
- **[ARQUITECTURA.md](./docs/ARQUITECTURA.md)** - Documentación técnica de la arquitectura del sistema
- **[GUIA_USO.md](./docs/GUIA_USO.md)** - Guía práctica de uso y ejemplos de código

## 🎯 Características Principales

- **Gestión de Pedidos**: Creación, seguimiento y actualización de pedidos con estados y prioridades
- **Control de Inventario**: Gestión de stock con alertas automáticas de reposición y control de vencimientos
- **Base de Datos de Clientes**: Registro completo con historial de compras y gestión de crédito
- **Rutas de Entrega**: Planificación y optimización de rutas con seguimiento en tiempo real
- **Seguimiento Financiero**: Registro de transacciones, reportes de ingresos/egresos y balance
- **Marketing y Conversión**: Análisis de clientes, detección de potencial y estrategias de conversión a mayoristas
- **Expansión Vertical**: Evaluación de oportunidades productivas y planificación de integración vertical
- **Arquitectura Limpia**: Código modular, escalable y fácil de mantener
- **Mobile-First**: Diseñado para operaciones móviles y en campo

## 🏗️ Arquitectura

El proyecto sigue los principios de **Arquitectura Limpia** (Clean Architecture):

```
src/
├── domain/              # Núcleo del negocio (sin dependencias)
│   ├── entities/        # Entidades del dominio
│   └── repositories/    # Interfaces de repositorios
├── application/         # Lógica de aplicación
│   └── services/        # Servicios de negocio
├── infrastructure/      # Implementaciones técnicas
│   ├── persistence/     # Repositorios en memoria/BD
│   └── api/            # API REST (futuro)
└── presentation/        # Capa de presentación (futuro)
```

## 📦 Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Blackmvmba88/PollosHermanos.git
cd PollosHermanos

# Instalar dependencias
npm install

# Compilar el proyecto
npm run build

# Ejecutar el sistema de demostración
npm start
```

## 🚀 Inicio Rápido

### Ejecución del Demo

```bash
# Ejecutar en modo desarrollo
npm run dev
```

El sistema ejecutará un flujo completo que demuestra:
1. Agregar productos al inventario
2. Registrar clientes
3. Crear y confirmar pedidos
4. Crear rutas de entrega
5. Registrar transacciones financieras
6. Completar entregas
7. Generar reportes

### Ejemplo de Código

```typescript
import { ServicioInventario } from './application/services/ServicioInventario';
import { RepositorioInventarioMemoria } from './infrastructure/persistence/RepositorioInventarioMemoria';
import { CategoriaProducto, UnidadMedida } from './domain/entities/ItemInventario';

// Inicializar el servicio
const repoInventario = new RepositorioInventarioMemoria();
const servicioInventario = new ServicioInventario(repoInventario);

// Agregar un producto
const producto = await servicioInventario.agregarProducto(
  'Pollo Entero',
  CategoriaProducto.POLLO,
  50,  // stock inicial
  UnidadMedida.KG,
  10,  // stock mínimo
  100, // stock máximo
  8000,  // costo unitario
  12000  // precio de venta
);

console.log(`Producto agregado: ${producto.nombreProducto}`);
```

## 📚 Módulos Principales

### 1. Gestión de Pedidos (ServicioPedidos)

```typescript
// Crear un pedido
const pedido = await servicioPedidos.crearPedido(
  idCliente,
  items,
  PrioridadPedido.ALTA,
  direccionEntrega,
  fechaEntrega
);

// Confirmar pedido (descuenta del inventario)
await servicioPedidos.confirmarPedido(pedido.id);

// Actualizar estado
await servicioPedidos.actualizarEstado(pedido.id, EstadoPedido.EN_CAMINO);
```

**Estados de Pedido:**
- `PENDIENTE`: Pedido creado, esperando confirmación
- `CONFIRMADO`: Pedido confirmado, stock descontado
- `PREPARANDO`: En preparación
- `LISTO_PARA_ENTREGA`: Listo para ser recogido
- `EN_CAMINO`: En ruta de entrega
- `ENTREGADO`: Entregado al cliente
- `CANCELADO`: Pedido cancelado

### 2. Control de Inventario (ServicioInventario)

```typescript
// Agregar stock
await servicioInventario.agregarStock(
  idProducto,
  cantidad,
  numeroLote,
  fechaVencimiento
);

// Verificar disponibilidad
const disponible = await servicioInventario.verificarDisponibilidad(
  idProducto,
  cantidadRequerida
);

// Obtener productos que necesitan reposición
const productosParaReponer = await servicioInventario.obtenerProductosParaReponer();
```

**Niveles de Stock:**
- `SIN_STOCK`: Sin existencias
- `STOCK_BAJO`: Por debajo del nivel mínimo
- `NORMAL`: Stock adecuado
- `SOBRESTOCK`: Por encima del nivel máximo

### 3. Gestión de Clientes (ServicioClientes)

```typescript
// Registrar cliente
const cliente = await servicioClientes.registrarCliente(
  nombre,
  TipoCliente.RESTAURANTE,
  { telefono: '3001234567', email: 'cliente@email.com' },
  [direccion],
  limiteCredito
);

// Agregar dirección
await servicioClientes.agregarDireccion(cliente.id, nuevaDireccion);

// Registrar pago
await servicioClientes.registrarPago(cliente.id, monto);
```

**Tipos de Cliente:**
- `MINORISTA`: Cliente individual
- `MAYORISTA`: Cliente por volumen
- `RESTAURANTE`: Negocio de alimentos
- `REGULAR`: Cliente frecuente

### 4. Rutas de Entrega (ServicioRutas)

```typescript
// Crear ruta
const ruta = await servicioRutas.crearRuta(
  'Ruta Norte',
  fechaPlanificada,
  idConductor,
  nombreConductor,
  idVehiculo
);

// Agregar parada
await servicioRutas.agregarParada(ruta.id, parada);

// Iniciar ruta
await servicioRutas.iniciarRuta(ruta.id);

// Completar parada
await servicioRutas.completarParada(ruta.id, idPedido);
```

### 5. Seguimiento Financiero (ServicioFinanzas)

```typescript
// Registrar transacción
const transaccion = await servicioFinanzas.registrarTransaccion(
  TipoTransaccion.VENTA,
  monto,
  MetodoPago.EFECTIVO,
  descripcion
);

// Generar resumen financiero
const resumen = await servicioFinanzas.generarResumen(
  fechaInicio,
  fechaFin
);

console.log(`Balance: $${resumen.balance}`);
```

### 6. Marketing y Conversión (ServicioMarketing)

```typescript
// Analizar cliente para detectar potencial de conversión
const analisis = await servicioMarketing.analizarCliente(idCliente);

console.log(`Potencial: ${analisis.potencialConversion}`);
console.log(`Puntaje: ${analisis.puntaje}/100`);
console.log(`Recomendaciones: ${analisis.recomendaciones.length}`);

// Análisis de demanda por zona geográfica
const analisisZonas = await servicioMarketing.analizarDemandaPorZona();

// Obtener clientes con alto potencial
const clientesPotenciales = await servicioMarketing.obtenerClientesPotenciales();

// Evaluar producción propia vs compra externa
const evaluacion = servicioMarketing.evaluarProduccionPropia(
  demandaAnualKg,
  precioCompraKg,
  costoProduccionKg,
  inversionInicial,
  costosOperacionalesMensuales
);

// Crear oportunidad de expansión vertical
const oportunidad = await servicioMarketing.crearOportunidadExpansion(
  'Adquisición de Granja Avícola',
  'Inversión en producción propia',
  TipoActivoProductivo.ANIMALES,
  proyeccion,
  evaluacion,
  ubicacion
);

// Generar reporte de inteligencia de mercado
const reporte = await servicioMarketing.generarReporteInteligencia();
```

**Funcionalidades Clave:**
- Análisis de patrones de demanda y comportamiento de compra
- Clasificación automática de potencial de conversión
- Identificación de candidatos a mayoristas y distribuidores
- Análisis geográfico de mercado por zona
- Evaluación financiera de integración vertical
- Planificación de activos productivos (terrenos, granjas, equipamiento)
- Comparativa producción propia vs compra externa
- Inteligencia de mercado para decisiones estratégicas

## 🔧 Configuración

El sistema actualmente usa repositorios en memoria para facilitar el desarrollo y testing. Para usar persistencia real:

1. Implementar repositorios con tu base de datos preferida (MongoDB, PostgreSQL, etc.)
2. Inyectar los nuevos repositorios en los servicios
3. La interfaz se mantiene igual gracias a la inversión de dependencias

## 📊 Casos de Uso

### Caso 1: Pollería Local
- Gestionar pedidos diarios de pollo fresco
- Controlar stock de productos perecederos
- Optimizar rutas de entrega en la ciudad
- Seguimiento de ventas diarias

### Caso 2: Distribuidora de Alimentos
- Gestión de múltiples productos
- Clientes mayoristas con crédito
- Rutas de entrega programadas
- Control financiero detallado

### Caso 3: Mini-Market
- Inventario de productos variados
- Clientes minoristas
- Ventas en mostrador y a domicilio
- Reportes de rentabilidad

## 🛣️ Roadmap

> 📋 **[Ver Roadmap Completo →](./ROADMAP.md)** - Plan detallado de desarrollo 2025-2027

### Versión Actual (v1.0 - Fundación) ✅
- ✅ Entidades del dominio completas
- ✅ Servicios de aplicación funcionales
- ✅ Repositorios en memoria
- ✅ Sistema de demostración completo
- ✅ Arquitectura limpia implementada
- ✅ Documentación técnica completa
- ✅ Módulo de Marketing y Conversión
- ✅ Módulo de Expansión Vertical
- ✅ Análisis de inteligencia de mercado

### Próximas Fases

#### Fase 1: API y Persistencia (v1.5) - Q1 2025
- [ ] API REST completa con OpenAPI/Swagger
- [ ] Persistencia con PostgreSQL
- [ ] Autenticación JWT y RBAC
- [ ] Tests completos (>80% coverage)

#### Fase 2: Interfaz Web (v2.0) - Q2 2025
- [ ] Dashboard de administración
- [ ] Gestión visual de pedidos e inventario
- [ ] Mapas interactivos para rutas
- [ ] Reportes y analytics avanzados

#### Fase 3: Aplicación Móvil (v2.5) - Q3 2025
- [ ] App para conductores (iOS/Android)
- [ ] App para vendedores en campo
- [ ] Funcionalidad offline
- [ ] Tracking GPS en tiempo real

#### Fase 4: Inteligencia (v3.0) - Q4 2025
- [ ] Optimización de rutas con IA
- [ ] Predicción de demanda
- [ ] Analytics predictivos
- [ ] Automatización de procesos

#### Fases Futuras (2026+)
- [ ] Sistema Multi-tenant SaaS
- [ ] Expansión a Latinoamérica
- [ ] E-commerce integrado
- [ ] Gestión avanzada de flota

📈 **Visión**: Convertir PollosHermanos en la plataforma líder para digitalización de negocios de distribución de alimentos en Latinoamérica.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Equipo PollosHermanos** - Desarrollo inicial

## 🙏 Agradecimientos

- Inspirado en necesidades reales de negocios locales de distribución
- Diseñado con principios de Clean Architecture y SOLID
- Construido con TypeScript para mayor seguridad de tipos

## 📧 Contacto

Para preguntas, sugerencias o soporte, por favor abre un issue en GitHub.

---

**PollosHermanos** - Transformando negocios tradicionales en operaciones eficientes y escalables 🚀
