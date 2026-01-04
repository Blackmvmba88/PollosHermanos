# WebUI - Dashboard de Monitoreo

Sistema de interfaz web para monitorear todas las operaciones de PollosHermanos en tiempo real.

## 🎯 Características

### Panel de Resumen
- **Total Pedidos**: Número total de pedidos en el sistema
- **Clientes Activos**: Cantidad de clientes registrados
- **Productos en Stock**: Número de productos en inventario
- **Rutas Activas**: Rutas de entrega en progreso
- **Balance del Mes**: Balance financiero del mes actual

### Infografías y Visualizaciones
- **Estado de Pedidos**: Gráfico de barras mostrando pedidos por estado (Confirmado, En Camino, etc.)
- **Niveles de Inventario**: Visualización de productos por nivel de stock (Normal, Bajo, Sin Stock)
- **Resumen Financiero**: Gráficos de ingresos, egresos y balance
- **Clientes por Tipo**: Distribución de clientes (Restaurante, Mayorista, Minorista)

### Tablas de Datos
- **Estado del Inventario**: Tabla detallada con todos los productos, stock actual, unidades y niveles
- **Rutas de Entrega**: Lista de rutas con conductor, paradas, estado y fecha

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar el Servidor WebUI
```bash
# Modo desarrollo con datos de demostración
npm run webui
```

El servidor se iniciará en `http://localhost:3000`

### 3. Acceder al Dashboard
Abre tu navegador y navega a:
```
http://localhost:3000
```

## 📊 API Endpoints

El servidor WebUI proporciona los siguientes endpoints:

### Dashboard Principal
```
GET /api/dashboard
```
Retorna todos los datos del dashboard incluyendo resumen, pedidos, inventario, rutas, finanzas y clientes.

### Endpoints Individuales
```
GET /api/pedidos      - Lista de todos los pedidos
GET /api/inventario   - Lista de productos en inventario
GET /api/clientes     - Lista de clientes
GET /api/rutas        - Lista de rutas de entrega
GET /api/finanzas     - Resumen financiero del mes
GET /api/marketing    - Reporte de inteligencia de mercado
```

## 🔄 Actualización Automática

El dashboard se actualiza automáticamente cada 30 segundos. También puedes usar el botón "🔄 Actualizar" para refrescar los datos manualmente.

## 🏗️ Arquitectura

```
src/
├── infrastructure/
│   └── api/
│       └── server.ts          # Servidor Express con API REST
├── webui.ts                   # Entry point con datos de demostración
public/
├── index.html                 # Dashboard HTML
├── css/
│   └── styles.css            # Estilos del dashboard
└── js/
    └── dashboard.js          # Lógica del dashboard
```

## 🎨 Personalización

### Cambiar el Puerto
Edita `src/webui.ts` y cambia el puerto en la inicialización:
```typescript
const server = new WebUIServer(3000); // Cambiar a tu puerto preferido
```

### Agregar Más Gráficos
Los gráficos se crean dinámicamente usando CSS. Para agregar nuevos:
1. Agrega el contenedor HTML en `public/index.html`
2. Crea la función de actualización en `public/js/dashboard.js`
3. Usa la función `crearBarChart()` para generar gráficos de barras

## 🔐 Producción

Para usar en producción:

1. Construir el proyecto:
```bash
npm run build
```

2. Iniciar el servidor compilado:
```bash
npm run webui:build
```

3. Reemplazar los repositorios en memoria por repositorios con persistencia real (PostgreSQL, MongoDB, etc.)

## 📝 Notas Técnicas

- El sistema usa repositorios en memoria para demostración
- Los datos se resetean cada vez que se reinicia el servidor
- Los gráficos usan CSS puro (sin dependencias externas)
- La interfaz es responsive y se adapta a diferentes tamaños de pantalla
- Los colores siguen el esquema visual de PollosHermanos

## 🐛 Solución de Problemas

### El servidor no inicia
Verifica que el puerto 3000 no esté en uso:
```bash
lsof -i :3000
```

### Los datos no se cargan
Verifica la consola del navegador (F12) para errores de JavaScript.

### Los gráficos no se muestran
Asegúrate de que el archivo `dashboard.js` se esté cargando correctamente.

## 📈 Próximos Pasos

- [ ] Agregar autenticación de usuarios
- [ ] Implementar filtros de fecha en reportes
- [ ] Agregar exportación de datos a Excel/PDF
- [ ] Implementar notificaciones en tiempo real con WebSockets
- [ ] Agregar más tipos de gráficos (línea, área, etc.)
- [ ] Crear formularios para agregar/editar datos desde la UI

## 🤝 Contribuir

Para contribuir al WebUI:
1. Crea una rama con tu feature
2. Implementa los cambios
3. Asegúrate de que el dashboard siga funcionando
4. Abre un Pull Request

---

**PollosHermanos WebUI** - Monitorea tu negocio en tiempo real 🐔📊
