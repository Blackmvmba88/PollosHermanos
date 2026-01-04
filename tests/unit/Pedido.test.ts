import { Pedido, EstadoPedido, PrioridadPedido, ItemPedido } from '../../src/domain/entities/Pedido';

describe('Pedido Entity', () => {
  const mockItems: ItemPedido[] = [
    {
      idProducto: 'prod-1',
      nombreProducto: 'Pollo Entero',
      cantidad: 10,
      precioUnitario: 12000,
      subtotal: 120000,
    },
    {
      idProducto: 'prod-2',
      nombreProducto: 'Alitas',
      cantidad: 5,
      precioUnitario: 8000,
      subtotal: 40000,
    },
  ];

  it('should create a pedido with correct properties', () => {
    const pedido = new Pedido(
      'pedido-1',
      'cliente-1',
      mockItems,
      EstadoPedido.PENDIENTE,
      PrioridadPedido.NORMAL,
      160000,
      new Date(),
      new Date()
    );

    expect(pedido.id).toBe('pedido-1');
    expect(pedido.idCliente).toBe('cliente-1');
    expect(pedido.items).toHaveLength(2);
    expect(pedido.estado).toBe(EstadoPedido.PENDIENTE);
    expect(pedido.prioridad).toBe(PrioridadPedido.NORMAL);
    expect(pedido.montoTotal).toBe(160000);
  });

  it('should calculate total correctly', () => {
    const pedido = new Pedido(
      'pedido-1',
      'cliente-1',
      mockItems,
      EstadoPedido.PENDIENTE,
      PrioridadPedido.NORMAL,
      0,
      new Date(),
      new Date()
    );

    const total = pedido.calcularTotal();
    expect(total).toBe(160000);
  });

  it('should update estado correctly', () => {
    const pedido = new Pedido(
      'pedido-1',
      'cliente-1',
      mockItems,
      EstadoPedido.PENDIENTE,
      PrioridadPedido.NORMAL,
      160000,
      new Date(),
      new Date()
    );

    pedido.actualizarEstado(EstadoPedido.CONFIRMADO);
    expect(pedido.estado).toBe(EstadoPedido.CONFIRMADO);
  });

  it('should add item correctly', () => {
    const pedido = new Pedido(
      'pedido-1',
      'cliente-1',
      [mockItems[0]],
      EstadoPedido.PENDIENTE,
      PrioridadPedido.NORMAL,
      120000,
      new Date(),
      new Date()
    );

    expect(pedido.items).toHaveLength(1);

    const newItem: ItemPedido = {
      idProducto: 'prod-3',
      nombreProducto: 'Piernas',
      cantidad: 8,
      precioUnitario: 10000,
      subtotal: 80000,
    };

    pedido.agregarItem(newItem);
    expect(pedido.items).toHaveLength(2);
    expect(pedido.montoTotal).toBe(200000);
  });
});
