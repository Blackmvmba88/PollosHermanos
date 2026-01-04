# PollosHermanos REST API Documentation - Phase 1

## API Base URL
```
http://localhost:3000/api
```

## Authentication
Phase 1 uses in-memory storage without authentication. JWT authentication will be added in Phase 1.3.

## Response Format
All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Endpoints

### Health Check
- **GET** `/api/health`
- Check API status
- **Response:** `{ success: true, status: "healthy", timestamp: "ISO Date" }`

---

## Pedidos (Orders) Endpoints

### Get All Orders
- **GET** `/api/pedidos`
- Returns all orders
- **Response:** `{ success: true, data: Order[], total: number }`

### Get Order by ID
- **GET** `/api/pedidos/:id`
- Get specific order details
- **Response:** `{ success: true, data: Order }`

### Get Orders by Customer
- **GET** `/api/pedidos/cliente/:idCliente`
- Get all orders for a specific customer
- **Response:** `{ success: true, data: Order[], total: number }`

### Get Orders by Status
- **GET** `/api/pedidos/estado/:estado`
- Get orders filtered by status
- **Valid statuses:** PENDIENTE, CONFIRMADO, PREPARANDO, LISTO_PARA_ENTREGA, EN_CAMINO, ENTREGADO, CANCELADO
- **Response:** `{ success: true, data: Order[], total: number }`

### Create Order
- **POST** `/api/pedidos`
- Create new order
- **Body:**
```json
{
  "idCliente": "string (required)",
  "items": [
    {
      "idProducto": "string",
      "cantidad": number,
      "precioUnitario": number
    }
  ],
  "prioridad": "BAJA | NORMAL | ALTA | URGENTE (optional)",
  "direccionEntrega": "string (optional)",
  "fechaEntrega": "ISO Date (optional)"
}
```
- **Response:** `{ success: true, data: Order, message: "Pedido creado exitosamente" }`

### Confirm Order
- **PUT** `/api/pedidos/:id/confirmar`
- Confirm order and deduct from inventory
- **Response:** `{ success: true, data: Order }`

### Update Order Status
- **PUT** `/api/pedidos/:id/estado`
- Update order status
- **Body:** `{ "estado": "EstadoPedido" }`
- **Response:** `{ success: true, data: Order }`

### Assign Order to Route
- **PUT** `/api/pedidos/:id/ruta`
- Assign order to delivery route
- **Body:** `{ "idRuta": "string" }`
- **Response:** `{ success: true, data: Order }`

### Cancel Order
- **DELETE** `/api/pedidos/:id`
- Cancel an order
- **Response:** `{ success: true, data: Order, message: "Pedido cancelado exitosamente" }`

---

## Inventario (Inventory) Endpoints

### Get All Products
- **GET** `/api/inventario`
- Returns all inventory items
- **Response:** `{ success: true, data: ItemInventario[], total: number }`

### Get Product by ID
- **GET** `/api/inventario/:id`
- Get specific product details
- **Response:** `{ success: true, data: ItemInventario }`

### Get Products to Restock
- **GET** `/api/inventario/reponer/lista`
- Get products below minimum stock level
- **Response:** `{ success: true, data: ItemInventario[], total: number }`

### Add Product
- **POST** `/api/inventario`
- Add new product to inventory
- **Body:**
```json
{
  "nombreProducto": "string (required)",
  "categoria": "POLLO | CARNE | CERDO | PESCADO | LACTEOS | GRANOS | VERDURAS | FRUTAS | BEBIDAS | OTROS (required)",
  "stockInicial": number (required),
  "unidad": "KG | LIBRA | UNIDAD | CAJA | PAQUETE | LITRO (required)",
  "stockMinimo": number (optional, default: 0),
  "stockMaximo": number (optional, default: 0),
  "costoUnitario": number (optional, default: 0),
  "precioVenta": number (optional, default: 0)
}
```
- **Response:** `{ success: true, data: ItemInventario, message: "Producto agregado exitosamente" }`

### Add Stock
- **PUT** `/api/inventario/:id/stock`
- Add stock to existing product
- **Body:**
```json
{
  "cantidad": number (required),
  "numeroLote": "string (optional)",
  "fechaVencimiento": "ISO Date (optional)"
}
```
- **Response:** `{ success: true, data: ItemInventario }`

### Deduct Stock
- **PUT** `/api/inventario/:id/descontar`
- Manually deduct stock
- **Body:** `{ "cantidad": number }`
- **Response:** `{ success: true, data: ItemInventario }`

### Update Price
- **PUT** `/api/inventario/:id/precio`
- Update product selling price
- **Body:** `{ "precioVenta": number }`
- **Response:** `{ success: true, data: ItemInventario }`

### Check Availability
- **GET** `/api/inventario/:id/disponibilidad/:cantidad`
- Check if requested quantity is available
- **Response:** `{ success: true, data: { disponible: boolean, cantidad: number } }`

---

## Clientes (Customers) Endpoints

### Get All Customers
- **GET** `/api/clientes`
- Returns all customers
- **Response:** `{ success: true, data: Cliente[], total: number }`

### Get Customer by ID
- **GET** `/api/clientes/:id`
- Get specific customer details
- **Response:** `{ success: true, data: Cliente }`

### Get Customers by Type
- **GET** `/api/clientes/tipo/:tipo`
- Get customers filtered by type
- **Valid types:** MINORISTA, MAYORISTA, RESTAURANTE, REGULAR
- **Response:** `{ success: true, data: Cliente[], total: number }`

### Register Customer
- **POST** `/api/clientes`
- Register new customer
- **Body:**
```json
{
  "nombre": "string (required)",
  "tipo": "MINORISTA | MAYORISTA | RESTAURANTE | REGULAR (required)",
  "contacto": {
    "telefono": "string (optional)",
    "email": "string (optional)"
  },
  "direcciones": ["string array (optional)"],
  "limiteCredito": number (optional, default: 0)
}
```
- **Response:** `{ success: true, data: Cliente, message: "Cliente registrado exitosamente" }`

### Add Address
- **PUT** `/api/clientes/:id/direccion`
- Add address to customer
- **Body:** `{ "direccion": "string" }`
- **Response:** `{ success: true, data: Cliente }`

### Register Payment
- **PUT** `/api/clientes/:id/credito`
- Register customer payment
- **Body:** `{ "monto": number }`
- **Response:** `{ success: true, data: Cliente }`

### Register Purchase
- **PUT** `/api/clientes/:id/compra`
- Register customer purchase
- **Body:** `{ "monto": number, "idPedido": "string (optional)" }`
- **Response:** `{ success: true, data: Cliente }`

---

## Rutas (Delivery Routes) Endpoints

### Get All Routes
- **GET** `/api/rutas`
- Returns all delivery routes
- **Response:** `{ success: true, data: RutaEntrega[], total: number }`

### Get Route by ID
- **GET** `/api/rutas/:id`
- Get specific route details
- **Response:** `{ success: true, data: RutaEntrega }`

### Get Active Routes
- **GET** `/api/rutas/activas/lista`
- Get routes currently in progress
- **Response:** `{ success: true, data: RutaEntrega[], total: number }`

### Create Route
- **POST** `/api/rutas`
- Create new delivery route
- **Body:**
```json
{
  "nombre": "string (required)",
  "fechaPlanificada": "ISO Date (required)",
  "idConductor": "string (optional)",
  "nombreConductor": "string (optional)",
  "idVehiculo": "string (optional)"
}
```
- **Response:** `{ success: true, data: RutaEntrega, message: "Ruta creada exitosamente" }`

### Add Stop
- **PUT** `/api/rutas/:id/parada`
- Add delivery stop to route
- **Body:**
```json
{
  "parada": {
    "idPedido": "string",
    "direccion": "string",
    "cliente": "string",
    "orden": number
  }
}
```
- **Response:** `{ success: true, data: RutaEntrega }`

### Start Route
- **PUT** `/api/rutas/:id/iniciar`
- Start route delivery
- **Response:** `{ success: true, data: RutaEntrega }`

### Complete Stop
- **PUT** `/api/rutas/:id/completar-parada`
- Mark delivery stop as completed
- **Body:** `{ "idPedido": "string", "notasEntrega": "string (optional)" }`
- **Response:** `{ success: true, data: RutaEntrega }`

### Finalize Route
- **PUT** `/api/rutas/:id/finalizar`
- Finalize route after all deliveries
- **Response:** `{ success: true, data: RutaEntrega }`

### Optimize Route
- **PUT** `/api/rutas/:id/optimizar`
- Optimize route order
- **Response:** `{ success: true, data: RutaEntrega }`

---

## Finanzas (Finance) Endpoints

### Get All Transactions
- **GET** `/api/finanzas/transacciones`
- Returns all financial transactions
- **Response:** `{ success: true, data: TransaccionFinanciera[], total: number }`

### Get Transaction by ID
- **GET** `/api/finanzas/transacciones/:id`
- Get specific transaction details
- **Response:** `{ success: true, data: TransaccionFinanciera }`

### Get Financial Summary
- **GET** `/api/finanzas/resumen?fechaInicio=ISO_Date&fechaFin=ISO_Date`
- Generate financial summary for period
- **Query params:** fechaInicio, fechaFin (optional, defaults to current month)
- **Response:** `{ success: true, data: ResumenFinanciero }`

### Get Balance
- **GET** `/api/finanzas/balance`
- Get current financial balance
- **Response:** `{ success: true, data: { balance: number } }`

### Register Transaction
- **POST** `/api/finanzas/transacciones`
- Register new financial transaction
- **Body:**
```json
{
  "tipo": "VENTA | COMPRA | GASTO | PAGO | COBRO | DEVOLUCION (required)",
  "monto": number (required),
  "metodoPago": "EFECTIVO | TARJETA | TRANSFERENCIA | CREDITO | OTRO (required)",
  "descripcion": "string (optional)",
  "referencia": "string (optional)",
  "categoria": "string (optional)"
}
```
- **Response:** `{ success: true, data: TransaccionFinanciera, message: "Transacción registrada exitosamente" }`

### Cancel Transaction
- **PUT** `/api/finanzas/transacciones/:id/anular`
- Cancel/void a transaction
- **Body:** `{ "motivo": "string (required)" }`
- **Response:** `{ success: true, data: TransaccionFinanciera }`

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid data |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Usage Examples

### Create Order Example
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "idCliente": "cliente-123",
    "items": [
      {
        "idProducto": "producto-456",
        "cantidad": 10,
        "precioUnitario": 12000
      }
    ],
    "prioridad": "ALTA"
  }'
```

### Get Financial Summary Example
```bash
curl http://localhost:3000/api/finanzas/resumen?fechaInicio=2025-01-01&fechaFin=2025-01-31
```

### Add Stock Example
```bash
curl -X PUT http://localhost:3000/api/inventario/producto-123/stock \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 50,
    "numeroLote": "LOTE-2025-001",
    "fechaVencimiento": "2025-02-15"
  }'
```

---

## Running the API Server

### Development Mode
```bash
npm run api
```

### Production Mode
```bash
npm run api:build
```

The API will be available at `http://localhost:3000/api`

---

**Phase 1 Status:** ✅ ACTIVE
**Last Updated:** January 2025
