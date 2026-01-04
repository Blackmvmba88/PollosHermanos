# Arquitectura del Sistema PollosHermanos

## Visión General

PollosHermanos está construido siguiendo los principios de **Clean Architecture** (Arquitectura Limpia), lo que garantiza:

- **Independencia de frameworks**: El núcleo del negocio no depende de librerías externas
- **Testabilidad**: Cada capa puede ser probada de forma independiente
- **Independencia de la UI**: La lógica de negocio es agnóstica a la interfaz
- **Independencia de la base de datos**: Los detalles de persistencia están aislados
- **Independencia de servicios externos**: Las reglas de negocio no conocen el mundo exterior

## Capas de la Arquitectura

```
┌─────────────────────────────────────────┐
│         PRESENTACIÓN / API              │  ← Interfaz con el usuario
│    (Controllers, Routes, Views)         │
├─────────────────────────────────────────┤
│          APLICACIÓN                     │  ← Casos de uso
│       (Services, Use Cases)             │
├─────────────────────────────────────────┤
│            DOMINIO                      │  ← Lógica de negocio
│    (Entities, Value Objects, Rules)     │
├─────────────────────────────────────────┤
│        INFRAESTRUCTURA                  │  ← Detalles técnicos
│   (Repositories, Database, External)    │
└─────────────────────────────────────────┘
```

## Capa de Dominio

### Entidades

Las entidades representan los conceptos centrales del negocio:

#### **Pedido (Order)**
- Representa un pedido del cliente
- Estados: PENDIENTE, CONFIRMADO, PREPARANDO, LISTO_PARA_ENTREGA, EN_CAMINO, ENTREGADO, CANCELADO
- Prioridades: NORMAL, ALTA, URGENTE
- Métodos: calcularTotal(), actualizarEstado(), agregarItem(), etc.

#### **ItemInventario (InventoryItem)**
- Representa un producto en el inventario
- Categorías: POLLO, HUEVOS, PROCESADOS, INSUMOS, OTROS
- Subcategorías de Pollo: POLLO_ENTERO, PECHUGA, ALITAS, PIERNAS, MUSLOS, MENUDENCIAS, CARCASA, etc.
- Niveles de stock: SIN_STOCK, STOCK_BAJO, NORMAL, SOBRESTOCK
- Métodos: agregarStock(), retirarStock(), necesitaReposicion(), esProductoPollo(), etc.

#### **EtapaCrecimiento (GrowthStage)** 🆕
- Representa el nivel actual del negocio y su progresión
- Niveles: ETAPA_1_INICIO, ETAPA_2_PROCESAMIENTO, ETAPA_3_PRODUCCION, ETAPA_4_INTEGRACION
- Incluye indicadores de crecimiento y recomendaciones
- Métodos: calcularProgreso(), listoParaSiguienteEtapa(), avanzarEtapa(), etc.

#### **ProcesamientoPollo (ChickenProcessing)** 🆕
- Representa el procesamiento de un pollo entero en cortes
- Incluye cortes obtenidos con pesos y valores
- Métodos: calcularPorcentajeAprovechamiento(), calcularGananciaPotencial(), etc.

#### **Cliente (Customer)**
- Representa un cliente del negocio
- Tipos: MINORISTA, MAYORISTA, RESTAURANTE, REGULAR
- Estados: ACTIVO, INACTIVO, SUSPENDIDO
- Métodos: registrarPedido(), agregarDireccion(), tieneCreditoDisponible(), etc.

#### **RutaEntrega (DeliveryRoute)**
- Representa una ruta de entrega
- Estados: PLANIFICADA, EN_PROGRESO, COMPLETADA, CANCELADA
- Métodos: agregarParada(), iniciar(), completarParada(), obtenerProgreso(), etc.

#### **TransaccionFinanciera (FinancialTransaction)**
- Representa una transacción financiera
- Tipos: VENTA, COMPRA, PAGO, GASTO, DEVOLUCION
- Métodos de pago: EFECTIVO, TARJETA, TRANSFERENCIA, CREDITO
- Métodos: completar(), cancelar(), esIngreso(), esEgreso()

#### **AnalisisCliente (CustomerAnalysis)**
- Representa el análisis de potencial de conversión de un cliente
- Potenciales: BAJO, MEDIO, ALTO, MAYORISTA, DISTRIBUIDOR
- Incluye patrón de demanda (zona, volumen, frecuencia, rentabilidad)
- Métodos: esCandidatoMayorista(), esCandidatoDistribuidor(), calcularPuntajeConversion()

#### **OportunidadExpansion (ExpansionOpportunity)**
- Representa una oportunidad de expansión vertical del negocio
- Tipos de activo: TERRENO, GALPONES, ANIMALES, EQUIPAMIENTO, INFRAESTRUCTURA
- Estados: ANALISIS, PLANIFICADA, EN_PROCESO, IMPLEMENTADA, DESCARTADA
- Incluye proyección de capacidad y evaluación financiera
- Métodos: esViableFinancieramente(), calcularPrioridad(), obtenerComparativaProduccion()

### Repositorios (Interfaces)

Los repositorios definen contratos para la persistencia:

- `IRepositorioPedidos`
- `IRepositorioInventario`
- `IRepositorioClientes`
- `IRepositorioRutas`
- `IRepositorioFinanzas`
- `IRepositorioMarketing`
- `IRepositorioCrecimiento` 🆕
- `IRepositorioProcesamiento` 🆕

**Principio**: Las entidades del dominio no conocen cómo se persisten los datos.

## Capa de Aplicación

### Servicios

Los servicios orquestan la lógica de negocio:

#### **ServicioPedidos**
Responsabilidades:
- Crear y confirmar pedidos
- Validar disponibilidad de stock
- Verificar límites de crédito
- Actualizar estados de pedidos
- Cancelar pedidos con devolución de stock

#### **ServicioInventario**
Responsabilidades:
- Agregar y gestionar productos
- Controlar movimientos de stock
- Generar alertas de reposición
- Identificar productos vencidos
- Calcular valores de inventario

#### **ServicioClientes**
Responsabilidades:
- Registrar y actualizar clientes
- Gestionar direcciones de entrega
- Controlar saldo y crédito
- Generar historial de compras
- Activar/desactivar clientes

#### **ServicioRutas**
Responsabilidades:
- Planificar rutas de entrega
- Asignar conductores y vehículos
- Gestionar paradas
- Seguimiento de entregas
- Optimizar secuencia de paradas

#### **ServicioFinanzas**
Responsabilidades:
- Registrar transacciones
- Generar resúmenes financieros
- Calcular ingresos y egresos
- Reportes por período
- Balance general

#### **ServicioMarketing**
Responsabilidades:
- Analizar clientes y detectar potencial de conversión
- Clasificar clientes (minorista, mayorista, distribuidor)
- Generar patrones de demanda por zona geográfica
- Identificar clientes con alto potencial
- Crear y evaluar oportunidades de expansión vertical
- Evaluar viabilidad de producción propia vs compra externa
- Generar reportes de inteligencia de mercado
- Proporcionar recomendaciones estratégicas de crecimiento

#### **ServicioCrecimiento** 🆕
Responsabilidades:
- Gestionar etapas de crecimiento del negocio
- Evaluar progreso hacia siguiente nivel
- Procesar pollos enteros y registrar cortes obtenidos
- Agregar cortes al inventario automáticamente
- Calcular aprovechamiento y eficiencia de procesamiento
- Generar recomendaciones basadas en indicadores
- Guiar decisiones de expansión con datos reales

## Capa de Infraestructura

### Repositorios en Memoria

Implementaciones actuales para desarrollo y testing:

- `RepositorioPedidosMemoria`
- `RepositorioInventarioMemoria`
- `RepositorioClientesMemoria`
- `RepositorioRutasMemoria`
- `RepositorioFinanzasMemoria`
- `RepositorioMarketingMemoria`
- `RepositorioCrecimientoMemoria` 🆕
- `RepositorioProcesamientoMemoria` 🆕

**Ventajas**:
- Rápidos para desarrollo
- No requieren configuración
- Ideales para testing
- Fácil de cambiar por implementación real

### Persistencia Futura

El sistema está preparado para integrar:

- **SQL**: PostgreSQL, MySQL, SQLite
- **NoSQL**: MongoDB, CouchDB
- **Cloud**: Firebase, AWS DynamoDB
- **Archivos**: JSON, CSV (para backups)

Solo se requiere implementar las interfaces de repositorio sin cambiar el dominio o aplicación.

## Flujos de Datos

### Flujo de Creación de Pedido

```
1. Usuario → Presentación (API/UI)
2. Presentación → ServicioPedidos.crearPedido()
3. ServicioPedidos → Validar Cliente (ServicioClientes)
4. ServicioPedidos → Validar Stock (ServicioInventario)
5. ServicioPedidos → Crear Pedido (Entidad)
6. ServicioPedidos → Guardar (RepositorioPedidos)
7. ServicioPedidos → Actualizar Cliente
8. Respuesta ← Usuario
```

### Flujo de Confirmación de Pedido

```
1. ServicioPedidos.confirmarPedido()
2. Buscar Pedido (RepositorioPedidos)
3. Validar Estado
4. Descontar Stock (ServicioInventario)
5. Actualizar Estado del Pedido
6. Guardar Cambios
7. Respuesta
```

### Flujo de Entrega

```
1. ServicioRutas.crearRuta()
2. ServicioRutas.agregarParada() (múltiples)
3. Asignar Pedidos a Ruta
4. ServicioRutas.iniciarRuta()
5. Actualizar Pedidos → EN_CAMINO
6. ServicioRutas.completarParada()
7. Actualizar Pedido → ENTREGADO
8. ServicioRutas.completarRuta()
```

### Flujo de Análisis de Marketing y Conversión

```
1. ServicioMarketing.analizarCliente(idCliente)
2. Buscar Cliente (ServicioClientes)
3. Obtener Historial de Pedidos (ServicioPedidos)
4. Calcular Patrón de Demanda (volumen, frecuencia, rentabilidad)
5. Determinar Potencial de Conversión
6. Generar Recomendaciones
7. Calcular Puntaje de Conversión
8. Guardar Análisis (RepositorioMarketing)
9. Respuesta → AnalisisCliente
```

### Flujo de Evaluación de Expansión Vertical

```
1. ServicioMarketing.evaluarProduccionPropia(parámetros)
2. Calcular Costo de Compra Externa
3. Calcular Costo de Producción Propia
4. Calcular ROI, Período de Retorno, VAN, TIR
5. Respuesta → EvaluacionFinanciera
6. ServicioMarketing.crearOportunidadExpansion()
7. Validar Viabilidad Financiera
8. Calcular Prioridad de Implementación
9. Guardar Oportunidad (RepositorioMarketing)
10. Respuesta → OportunidadExpansion
```

### Flujo de Procesamiento de Pollo (Nuevo) 🆕

```
1. ServicioCrecimiento.procesarPolloEntero(peso, costo, lote)
2. Crear ProcesamientoPollo con cortes estándar
3. Calcular proporciones (26% pechuga, 10% alitas, etc.)
4. Asignar costos y precios a cada corte
5. Calcular aprovechamiento y ganancia potencial
6. Guardar Procesamiento (RepositorioProcesamiento)
7. Para cada corte:
   a. Buscar producto existente en inventario
   b. Si existe: agregar stock
   c. Si no existe: crear nuevo producto
   d. Guardar en RepositorioInventario
8. Respuesta → ProcesamientoPollo
```

### Flujo de Evaluación de Crecimiento (Nuevo) 🆕

```
1. ServicioCrecimiento.evaluarProgreso()
2. Obtener EtapaCrecimiento actual
3. Obtener datos reales del negocio:
   a. Resumen financiero (ventas, ingresos)
   b. Estadísticas de procesamiento
   c. Volumen de operaciones
4. Actualizar indicadores de la etapa
5. Calcular progreso (% indicadores cumplidos)
6. Si progreso >= 60%:
   a. Generar recomendaciones
   b. Evaluar capital disponible
   c. Sugerir próxima etapa
7. Guardar EtapaCrecimiento actualizada
8. Respuesta → EtapaCrecimiento
```


## Principios de Diseño

### SOLID

1. **Single Responsibility**: Cada clase tiene una única responsabilidad
2. **Open/Closed**: Abierto a extensión, cerrado a modificación
3. **Liskov Substitution**: Los repositorios son intercambiables
4. **Interface Segregation**: Interfaces específicas y cohesivas
5. **Dependency Inversion**: Dependencias apuntan hacia abstracciones

### DDD (Domain-Driven Design)

- **Entidades**: Objetos con identidad (Pedido, Cliente, etc.)
- **Value Objects**: Objetos sin identidad (Direccion, InfoContacto)
- **Agregados**: Grupos de entidades tratadas como unidad
- **Repositorios**: Abstracción de persistencia
- **Servicios**: Lógica que no pertenece a una entidad

### Clean Code

- Nombres descriptivos en español
- Funciones pequeñas y cohesivas
- Comentarios cuando aportan valor
- Manejo explícito de errores
- Testing facilitado por diseño

## Extensibilidad

### Agregar un Nuevo Módulo

1. **Definir Entidad** en `domain/entities/`
2. **Definir Repositorio** en `domain/repositories/`
3. **Implementar Servicio** en `application/services/`
4. **Implementar Repositorio** en `infrastructure/persistence/`
5. **Integrar en API** (cuando exista)

### Ejemplo: Agregar Módulo de Proveedores

```typescript
// 1. Entidad
export class Proveedor {
  constructor(
    public readonly id: string,
    public nombre: string,
    public contacto: InfoContacto,
    // ...
  ) {}
}

// 2. Repositorio
export interface IRepositorioProveedores {
  guardar(proveedor: Proveedor): Promise<Proveedor>;
  buscarPorId(id: string): Promise<Proveedor | null>;
  // ...
}

// 3. Servicio
export class ServicioProveedores {
  constructor(private repo: IRepositorioProveedores) {}
  
  async registrarProveedor(...): Promise<Proveedor> {
    // lógica
  }
}

// 4. Implementación
export class RepositorioProveedoresMemoria implements IRepositorioProveedores {
  // implementación
}
```

## Escalabilidad

### Horizontal

- Los servicios son stateless
- Fácil de distribuir en múltiples instancias
- Compartir repositorio/BD entre instancias

### Vertical

- Modularidad permite optimizar componentes específicos
- Cache puede agregarse en capa de infraestructura
- Índices en BD sin cambiar dominio

### Microservicios (Futuro)

El diseño actual facilita la división en microservicios:

- Servicio de Pedidos
- Servicio de Inventario
- Servicio de Clientes
- Servicio de Rutas
- Servicio de Finanzas
- Servicio de Marketing y Expansión

Cada uno con su propia BD y API.

## Testing

### Niveles de Testing

```
┌──────────────────────────┐
│    Tests E2E / UI        │  ← Toda la aplicación
├──────────────────────────┤
│   Tests de Integración   │  ← Servicios + Repos
├──────────────────────────┤
│   Tests Unitarios        │  ← Entidades, Servicios
└──────────────────────────┘
```

### Estrategia de Testing

1. **Entidades**: Tests unitarios de lógica de negocio
2. **Servicios**: Tests con repositorios mock
3. **Repositorios**: Tests de integración con BD
4. **API**: Tests E2E completos

## Tecnologías

### Actuales
- **Lenguaje**: TypeScript
- **Runtime**: Node.js
- **Repositorios**: En memoria (desarrollo)

### Recomendadas para Producción
- **Base de Datos**: PostgreSQL o MongoDB
- **API**: Express.js o Fastify
- **Autenticación**: JWT
- **Documentación**: OpenAPI/Swagger
- **Testing**: Jest
- **CI/CD**: GitHub Actions

## Conclusión

La arquitectura de PollosHermanos está diseñada para:

✅ **Mantenibilidad**: Código limpio y organizado
✅ **Escalabilidad**: Fácil de crecer y distribuir
✅ **Testabilidad**: Cada parte puede probarse aisladamente
✅ **Flexibilidad**: Fácil cambiar implementaciones
✅ **Claridad**: Estructura intuitiva para nuevos desarrolladores

Esta arquitectura garantiza que el sistema pueda evolucionar con las necesidades del negocio sin reescrituras mayores.
