// PollosHermanos Dashboard JavaScript

// Función principal para cargar datos del dashboard
async function cargarDashboard() {
    try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        actualizarTarjetasResumen(data.resumen);
        actualizarGraficoPedidos(data.pedidos);
        actualizarGraficoInventario(data.inventario);
        actualizarGraficoFinanzas(data.finanzas);
        actualizarGraficoClientes(data.clientes);
        actualizarTablaInventario(data.inventario.productos);
        actualizarTablaRutas(data.rutas.lista);
        
        // Actualizar hora de última actualización
        document.getElementById('lastUpdate').textContent = 
            `Última actualización: ${new Date().toLocaleTimeString('es-ES')}`;
            
    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        mostrarError('Error al cargar los datos. Por favor, intente de nuevo.');
    }
}

// Actualizar tarjetas de resumen
function actualizarTarjetasResumen(resumen) {
    document.getElementById('totalPedidos').textContent = resumen.totalPedidos;
    document.getElementById('totalClientes').textContent = resumen.totalClientes;
    document.getElementById('totalProductos').textContent = resumen.totalProductos;
    document.getElementById('rutasActivas').textContent = resumen.rutasActivas;
    document.getElementById('balance').textContent = 
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(resumen.balance);
}

// Función auxiliar para crear barras
function crearBarChart(container, datos, colores) {
    const maxValue = Math.max(...datos.map(d => d.valor));
    
    container.innerHTML = datos.map((item, index) => {
        const percentage = maxValue > 0 ? (item.valor / maxValue) * 100 : 0;
        const colorClass = colores[item.nombre] || 'bar-fill-primary';
        
        return `
            <div class="bar-item">
                <div class="bar-label">
                    <span>${item.nombre}</span>
                    <span class="bar-value">${item.valor}</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill ${colorClass}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Gráfico de Pedidos por Estado
function actualizarGraficoPedidos(pedidos) {
    const container = document.getElementById('pedidosChart');
    
    const colores = {
        'PENDIENTE': 'bar-fill-warning',
        'CONFIRMADO': 'bar-fill-primary',
        'PREPARANDO': 'bar-fill-info',
        'LISTO PARA ENTREGA': 'bar-fill-success',
        'EN CAMINO': 'bar-fill-warning',
        'ENTREGADO': 'bar-fill-success',
        'CANCELADO': 'bar-fill-danger'
    };
    
    const datos = Object.entries(pedidos.porEstado).map(([estado, valor]) => ({
        nombre: estado.replace(/_/g, ' '),
        valor: valor
    }));
    
    if (datos.length === 0) {
        container.innerHTML = '<p class="loading">No hay datos de pedidos</p>';
        return;
    }
    
    crearBarChart(container, datos, colores);
}

// Gráfico de Inventario por Nivel
function actualizarGraficoInventario(inventario) {
    const container = document.getElementById('inventarioChart');
    
    const colores = {
        'SIN STOCK': 'bar-fill-danger',
        'STOCK BAJO': 'bar-fill-warning',
        'NORMAL': 'bar-fill-success',
        'SOBRESTOCK': 'bar-fill-primary'
    };
    
    const datos = Object.entries(inventario.porNivel).map(([nivel, valor]) => ({
        nombre: nivel.replace(/_/g, ' '),
        valor: valor
    }));
    
    if (datos.length === 0) {
        container.innerHTML = '<p class="loading">No hay datos de inventario</p>';
        return;
    }
    
    crearBarChart(container, datos, colores);
}

// Gráfico Financiero
function actualizarGraficoFinanzas(finanzas) {
    const container = document.getElementById('finanzasChart');
    
    const colores = {
        'Ingresos': 'bar-fill-success',
        'Egresos': 'bar-fill-danger',
        'Balance': 'bar-fill-primary'
    };
    
    const formatCurrency = (value) => 
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
    
    const datos = [
        { nombre: 'Ingresos', valor: finanzas.ingresos },
        { nombre: 'Egresos', valor: finanzas.egresos },
        { nombre: 'Balance', valor: finanzas.balance }
    ];
    
    const maxValue = Math.max(...datos.map(d => d.valor));
    
    container.innerHTML = datos.map((item) => {
        const percentage = maxValue > 0 ? (item.valor / maxValue) * 100 : 0;
        const colorClass = colores[item.nombre] || 'bar-fill-primary';
        
        return `
            <div class="bar-item">
                <div class="bar-label">
                    <span>${item.nombre}</span>
                    <span class="bar-value">${formatCurrency(item.valor)}</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill ${colorClass}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Gráfico de Clientes por Tipo
function actualizarGraficoClientes(clientes) {
    const container = document.getElementById('clientesChart');
    
    const colores = {
        'MINORISTA': 'bar-fill-primary',
        'MAYORISTA': 'bar-fill-success',
        'RESTAURANTE': 'bar-fill-warning',
        'REGULAR': 'bar-fill-info'
    };
    
    const datos = Object.entries(clientes.porTipo).map(([tipo, valor]) => ({
        nombre: tipo,
        valor: valor
    }));
    
    if (datos.length === 0) {
        container.innerHTML = '<p class="loading">No hay datos de clientes</p>';
        return;
    }
    
    crearBarChart(container, datos, colores);
}

// Actualizar tabla de inventario
function actualizarTablaInventario(productos) {
    const tbody = document.getElementById('inventarioTableBody');
    
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay productos en el inventario</td></tr>';
        return;
    }
    
    const nivelClasses = {
        'SIN_STOCK': 'badge-danger',
        'STOCK_BAJO': 'badge-warning',
        'NORMAL': 'badge-success',
        'SOBRESTOCK': 'badge-info'
    };
    
    tbody.innerHTML = productos.map(producto => `
        <tr>
            <td><strong>${producto.nombre}</strong></td>
            <td>${producto.stock}</td>
            <td>${producto.unidad}</td>
            <td>${producto.nivel.replace(/_/g, ' ')}</td>
            <td><span class="badge ${nivelClasses[producto.nivel] || 'badge-normal'}">${producto.nivel.replace(/_/g, ' ')}</span></td>
        </tr>
    `).join('');
}

// Actualizar tabla de rutas
function actualizarTablaRutas(rutas) {
    const tbody = document.getElementById('rutasTableBody');
    
    if (rutas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay rutas registradas</td></tr>';
        return;
    }
    
    const estadoClasses = {
        'PENDIENTE': 'badge-warning',
        'PLANIFICADA': 'badge-info',
        'EN_PROGRESO': 'badge-primary',
        'COMPLETADA': 'badge-success',
        'CANCELADA': 'badge-danger'
    };
    
    tbody.innerHTML = rutas.map(ruta => `
        <tr>
            <td><strong>${ruta.nombreRuta}</strong></td>
            <td>${ruta.conductor ? ruta.conductor.nombre : ruta.nombreConductor}</td>
            <td>${ruta.paradas.length}</td>
            <td><span class="badge ${estadoClasses[ruta.estado] || 'badge-normal'}">${ruta.estado.replace(/_/g, ' ')}</span></td>
            <td>${new Date(ruta.fechaPlanificada).toLocaleDateString('es-ES')}</td>
        </tr>
    `).join('');
}

// Mostrar error
function mostrarError(mensaje) {
    console.error(mensaje);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos iniciales
    cargarDashboard();
    
    // Botón de actualización
    document.getElementById('refreshBtn').addEventListener('click', () => {
        cargarDashboard();
    });
    
    // Auto-actualización cada 30 segundos (solo cuando la página está visible)
    let intervalId = setInterval(cargarDashboard, 30000);
    
    // Pausar actualizaciones cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pausar actualizaciones
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        } else {
            // Reanudar actualizaciones y cargar datos inmediatamente
            cargarDashboard();
            if (!intervalId) {
                intervalId = setInterval(cargarDashboard, 30000);
            }
        }
    });
});
