/**
 * Express Server for PollosHermanos WebUI
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

import { ServicioPedidos } from '../../application/services/ServicioPedidos';
import { ServicioInventario } from '../../application/services/ServicioInventario';
import { ServicioClientes } from '../../application/services/ServicioClientes';
import { ServicioRutas } from '../../application/services/ServicioRutas';
import { ServicioFinanzas } from '../../application/services/ServicioFinanzas';
import { ServicioMarketing } from '../../application/services/ServicioMarketing';

import { RepositorioPedidosMemoria } from '../persistence/RepositorioPedidosMemoria';
import { RepositorioInventarioMemoria } from '../persistence/RepositorioInventarioMemoria';
import { RepositorioClientesMemoria } from '../persistence/RepositorioClientesMemoria';
import { RepositorioRutasMemoria } from '../persistence/RepositorioRutasMemoria';
import { RepositorioFinanzasMemoria } from '../persistence/RepositorioFinanzasMemoria';
import { RepositorioMarketingMemoria } from '../persistence/RepositorioMarketingMemoria';

export class WebUIServer {
  private app: express.Application;
  private port: number;
  
  // Servicios
  private servicioInventario: ServicioInventario;
  private servicioClientes: ServicioClientes;
  private servicioPedidos: ServicioPedidos;
  private servicioRutas: ServicioRutas;
  private servicioFinanzas: ServicioFinanzas;
  private servicioMarketing: ServicioMarketing;

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    
    // Inicializar repositorios
    const repoPedidos = new RepositorioPedidosMemoria();
    const repoInventario = new RepositorioInventarioMemoria();
    const repoClientes = new RepositorioClientesMemoria();
    const repoRutas = new RepositorioRutasMemoria();
    const repoFinanzas = new RepositorioFinanzasMemoria();
    const repoMarketing = new RepositorioMarketingMemoria();

    // Inicializar servicios
    this.servicioInventario = new ServicioInventario(repoInventario);
    this.servicioClientes = new ServicioClientes(repoClientes);
    this.servicioPedidos = new ServicioPedidos(repoPedidos, repoInventario, repoClientes);
    this.servicioRutas = new ServicioRutas(repoRutas, repoPedidos);
    this.servicioFinanzas = new ServicioFinanzas(repoFinanzas);
    this.servicioMarketing = new ServicioMarketing(repoMarketing, repoClientes, repoPedidos);
    
    this.configurarMiddlewares();
    this.configurarRutas();
  }

  private configurarMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../../../public')));
  }

  private configurarRutas() {
    // Ruta principal - Dashboard
    this.app.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../../../public/index.html'));
    });

    // API Endpoints
    this.app.get('/api/dashboard', async (req: Request, res: Response) => {
      try {
        const data = await this.obtenerDatosDashboard();
        res.json(data);
      } catch (error) {
        console.error('Error al obtener datos del dashboard:', error);
        res.status(500).json({ error: 'Error al obtener datos del dashboard' });
      }
    });

    this.app.get('/api/pedidos', async (req: Request, res: Response) => {
      try {
        const pedidos = await this.servicioPedidos.obtenerTodos();
        res.json(pedidos);
      } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
      }
    });

    this.app.get('/api/inventario', async (req: Request, res: Response) => {
      try {
        const inventario = await this.servicioInventario.obtenerTodos();
        res.json(inventario);
      } catch (error) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({ error: 'Error al obtener inventario' });
      }
    });

    this.app.get('/api/clientes', async (req: Request, res: Response) => {
      try {
        const clientes = await this.servicioClientes.obtenerTodos();
        res.json(clientes);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error al obtener clientes' });
      }
    });

    this.app.get('/api/rutas', async (req: Request, res: Response) => {
      try {
        const rutas = await this.servicioRutas.obtenerTodas();
        res.json(rutas);
      } catch (error) {
        console.error('Error al obtener rutas:', error);
        res.status(500).json({ error: 'Error al obtener rutas' });
      }
    });

    this.app.get('/api/finanzas', async (req: Request, res: Response) => {
      try {
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const resumen = await this.servicioFinanzas.generarResumen(inicioMes, hoy);
        res.json(resumen);
      } catch (error) {
        console.error('Error al obtener datos financieros:', error);
        res.status(500).json({ error: 'Error al obtener datos financieros' });
      }
    });

    this.app.get('/api/marketing', async (req: Request, res: Response) => {
      try {
        const reporte = await this.servicioMarketing.generarReporteInteligencia();
        res.json(reporte);
      } catch (error) {
        console.error('Error al obtener datos de marketing:', error);
        res.status(500).json({ error: 'Error al obtener datos de marketing' });
      }
    });
  }

  private async obtenerDatosDashboard() {
    const pedidos = await this.servicioPedidos.obtenerTodos();
    const inventario = await this.servicioInventario.obtenerTodos();
    const clientes = await this.servicioClientes.obtenerTodos();
    const rutas = await this.servicioRutas.obtenerTodas();
    
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const resumenFinanciero = await this.servicioFinanzas.generarResumen(inicioMes, hoy);

    // Estadísticas de pedidos
    const pedidosPorEstado = pedidos.reduce((acc: any, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});

    // Estadísticas de inventario
    const inventarioPorNivel = inventario.reduce((acc: any, item) => {
      const nivel = item.obtenerNivelStock();
      acc[nivel] = (acc[nivel] || 0) + 1;
      return acc;
    }, {});

    // Estadísticas de rutas
    const rutasActivas = rutas.filter(r => r.estado === 'EN_PROGRESO').length;
    const rutasCompletadas = rutas.filter(r => r.estado === 'COMPLETADA').length;

    // Clientes por tipo
    const clientesPorTipo = clientes.reduce((acc: any, c) => {
      acc[c.tipo] = (acc[c.tipo] || 0) + 1;
      return acc;
    }, {});

    return {
      resumen: {
        totalPedidos: pedidos.length,
        totalClientes: clientes.length,
        totalProductos: inventario.length,
        totalRutas: rutas.length,
        rutasActivas,
        balance: resumenFinanciero.balance
      },
      pedidos: {
        porEstado: pedidosPorEstado,
        lista: pedidos.slice(0, 10)
      },
      inventario: {
        porNivel: inventarioPorNivel,
        productos: inventario.map(item => ({
          nombre: item.nombreProducto,
          stock: item.stockActual,
          unidad: item.unidad,
          nivel: item.obtenerNivelStock()
        }))
      },
      rutas: {
        activas: rutasActivas,
        completadas: rutasCompletadas,
        lista: rutas.slice(0, 5)
      },
      finanzas: {
        ingresos: resumenFinanciero.totalIngresos,
        egresos: resumenFinanciero.totalEgresos,
        balance: resumenFinanciero.balance,
        transacciones: resumenFinanciero.transaccionesCompletadas
      },
      clientes: {
        porTipo: clientesPorTipo,
        total: clientes.length
      }
    };
  }

  public iniciar() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor WebUI iniciado en http://localhost:${this.port}`);
      console.log(`📊 Dashboard disponible en http://localhost:${this.port}/`);
    });
  }

  public obtenerApp() {
    return this.app;
  }

  // Métodos públicos para acceder a los servicios (útil para testing/demo)
  public getServicios() {
    return {
      inventario: this.servicioInventario,
      clientes: this.servicioClientes,
      pedidos: this.servicioPedidos,
      rutas: this.servicioRutas,
      finanzas: this.servicioFinanzas,
      marketing: this.servicioMarketing
    };
  }
}
