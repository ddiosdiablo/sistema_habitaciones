export const formatearMoneda = (monto: number, moneda: string = 'PEN'): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: moneda === 'PEN' ? 'PEN' : 'USD',
    minimumFractionDigits: 2,
  }).format(monto);
};

export const formatearNumero = (numero: number): string => {
  return numero.toLocaleString('es-PE');
};

export const formatearPorcentaje = (valor: number): string => {
  return `${valor.toFixed(2)}%`;
};