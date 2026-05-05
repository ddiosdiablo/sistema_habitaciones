export type TipoAlquiler = 'dia' | 'mes';
export type EstadoHabitacion = 'disponible' | 'ocupada' | 'mantenimiento';
export type MetodoPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
export type TipoTransaccion = 'checkin' | 'checkout' | 'pago' | 'pago_parcial';

export interface Habitacion {
  id: string;
  numero: string;
  tipo: TipoAlquiler;
  estado: EstadoHabitacion;
  tarifaDiaria: number;
  tariffMensual: number;
  descripcion?: string;
}

export interface Cliente {
  id: string;
  nombreCompleto: string;
  dni: string;
  telefono: string;
  correo?: string;
  nacionalidad?: string;
  fechaRegistro: string;
}

export interface Estadia {
  id: string;
  habitacionId: string;
  clienteId: string;
  tipo: TipoAlquiler;
  fechaEntrada: string;
  fechaSalidaEstimada: string;
  fechaSalidaReal?: string;
  tarifaOriginal: number;
  descuento: number;
  tarifaAplicada: number;
  totalPagado: number;
  saldoPendiente: number;
  estaPagado: boolean;
  estado: 'activa' | 'finalizada';
}

export interface Transaccion {
  id: string;
  estadiaId: string;
  habitacionId: string;
  clienteId: string;
  tipo: TipoTransaccion;
  monto: number;
  metodoPago: MetodoPago;
  fecha: string;
  concepto: string;
  numeroRecibo?: string;
}

export interface ConfigNegocio {
  nombre: string;
  direccion: string;
  telefono: string;
  email?: string;
  logo?: string;
  leyendaPieRecibo: string;
  impuestoRecibo: number;
  tarifaDiariaDefault: number;
  tariffMensualDefault: number;
  proximoNumeroRecibo: number;
  usuarioAdmin?: string;
  contrasenaAdmin?: string;
  horaCheckout?: string;
}

export interface DatosDemo {
  habitaciones: Habitacion[];
  clientes: Cliente[];
  estadias: Estadia[];
  transacciones: Transaccion[];
  config: ConfigNegocio;
}