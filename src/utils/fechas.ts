export const fechaHoy = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const fechaActual = (): string => {
  return new Date().toISOString();
};

export const fechaMasDias = (dias: number, fecha?: string): string => {
  const f = fecha ? new Date(fecha) : new Date();
  f.setDate(f.getDate() + dias);
  return f.toISOString().split('T')[0];
};

export const fechaMenosDias = (dias: number, fecha?: string): string => {
  const f = fecha ? new Date(fecha) : new Date();
  f.setDate(f.getDate() - dias);
  return f.toISOString().split('T')[0];
};

export const fechaMasMeses = (meses: number, fecha?: string): string => {
  const f = fecha ? new Date(fecha) : new Date();
  f.setMonth(f.getMonth() + meses);
  return f.toISOString().split('T')[0];
};

export const formatoFecha展示 = (fecha: string): string => {
  if (!fecha) return '';
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
};

export const formatoFechaTimeStamp = (fecha: string): string => {
  if (!fecha) return '';
  const date = new Date(fecha.replace(' ', 'T'));
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const diasEntreFechas = (fechaInicio: string, fechaFin: string, horaCheckout: string = '13:00'): number => {
  const inicio = new Date(fechaInicio + 'T00:00:00');
  const fin = new Date(fechaFin + 'T' + horaCheckout + ':00');
  
  const diffTime = fin.getTime() - inicio.getTime();
  const dias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (dias <= 0) return 1;
  return dias;
};

export const calcularDiasTranscurridos = (fechaInicio: string): number => {
  const inicio = new Date(fechaInicio);
  const hoy = new Date();
  const diffTime = hoy.getTime() - inicio.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getSemanaActual = (): { inicio: string; fin: string } => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    inicio: monday.toISOString().split('T')[0],
    fin: sunday.toISOString().split('T')[0],
  };
};

export const getMesActual = (): { anio: number; mes: number } => {
  const now = new Date();
  return {
    anio: now.getFullYear(),
    mes: now.getMonth() + 1,
  };
};

export const esFechaValida = (fecha: string): boolean => {
  const date = new Date(fecha);
  return !isNaN(date.getTime());
};