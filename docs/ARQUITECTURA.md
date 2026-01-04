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
- Niveles de stock: SIN_STOCK, STOCK_BAJO, NORMAL, SOBRESTOCK
- Métodos: agregarStock(), retirarStock(), necesitaReposicion(), etc.

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

### Repositorios (Interfaces)

Los repositorios definen contratos para la persistencia:

- `IRepositorioPedidos`
- `IRepositorioInventario`
- `IRepositorioClientes`
- `IRepositorioRutas`
- `IRepositorioFinanzas`

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

## Capa de Infraestructura

### Repositorios en Memoria

Implementaciones actuales para desarrollo y testing:

- `RepositorioPedidosMemoria`
- `RepositorioInventarioMemoria`
- `RepositorioClientesMemoria`
- `RepositorioRutasMemoria`
- `RepositorioFinanzasMemoria`

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
