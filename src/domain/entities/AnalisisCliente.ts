/**
 * Potencial de conversión del cliente
 */
export enum PotencialConversion {
  BAJO = 'BAJO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
  MAYORISTA = 'MAYORISTA',
  DISTRIBUIDOR = 'DISTRIBUIDOR'
}

/**
 * Patrón de demanda identificado
 */
export interface PatronDemanda {
  zonaGeografica: string;
  volumenPromedio: number;
  frecuenciaCompra: number; // compras por mes
  rentabilidadPromedio: number;
  productosPreferidos: string[];
  horariosPreferidos?: string;
}

/**
 * Análisis de Cliente - Inteligencia de mercado para conversión
 */
export class AnalisisCliente {
  constructor(
    public readonly id: string,
    public readonly idCliente: string,
    public nombreCliente: string,
    public potencialConversion: PotencialConversion,
    public patronDemanda: PatronDemanda,
    public fechaAnalisis: Date,
    public puntaje: number, // 0-100
    public recomendaciones: string[],
    public ultimaActualizacion: Date,
    public notas?: string
  ) {}

  /**
   * Verificar si el cliente es candidato a mayorista
   */
  esCandidatoMayorista(): boolean {
    return this.patronDemanda.volumenPromedio >= 50 && 
           this.patronDemanda.frecuenciaCompra >= 4;
  }

  /**
   * Verificar si el cliente es candidato a distribuidor
   */
  esCandidatoDistribuidor(): boolean {
    return this.patronDemanda.volumenPromedio >= 100 && 
           this.patronDemanda.frecuenciaCompra >= 8;
  }

  /**
   * Actualizar el potencial de conversión
   */
  actualizarPotencial(nuevoPotencial: PotencialConversion): void {
    this.potencialConversion = nuevoPotencial;
    this.ultimaActualizacion = new Date();
  }

  /**
   * Actualizar patrón de demanda
   */
  actualizarPatron(patron: PatronDemanda): void {
    this.patronDemanda = patron;
    this.ultimaActualizacion = new Date();
  }

  /**
   * Agregar recomendación de marketing
   */
  agregarRecomendacion(recomendacion: string): void {
    this.recomendaciones.push(recomendacion);
    this.ultimaActualizacion = new Date();
  }

  /**
   * Calcular puntaje de conversión basado en patrón
   */
  calcularPuntajeConversion(): number {
    let puntaje = 0;
    
    // Volumen (40 puntos)
    if (this.patronDemanda.volumenPromedio >= 100) puntaje += 40;
    else if (this.patronDemanda.volumenPromedio >= 50) puntaje += 30;
    else if (this.patronDemanda.volumenPromedio >= 20) puntaje += 20;
    else puntaje += 10;

    // Frecuencia (30 puntos)
    if (this.patronDemanda.frecuenciaCompra >= 8) puntaje += 30;
    else if (this.patronDemanda.frecuenciaCompra >= 4) puntaje += 20;
    else if (this.patronDemanda.frecuenciaCompra >= 2) puntaje += 10;
    else puntaje += 5;

    // Rentabilidad (30 puntos)
    if (this.patronDemanda.rentabilidadPromedio >= 500000) puntaje += 30;
    else if (this.patronDemanda.rentabilidadPromedio >= 200000) puntaje += 20;
    else if (this.patronDemanda.rentabilidadPromedio >= 50000) puntaje += 10;
    else puntaje += 5;

    this.puntaje = puntaje;
    return puntaje;
  }
}
