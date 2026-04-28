import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type {
  Habitacion,
  Cliente,
  Estadia,
  Transaccion,
  ConfigNegocio,
  EstadoHabitacion,
} from '../types';

interface AppState {
  habitaciones: Habitacion[];
  clientes: Cliente[];
  estadias: Estadia[];
  transacciones: Transaccion[];
  config: ConfigNegocio;
  darkMode: boolean;
  isLoading: boolean;

  addHabitacion: (habitacion: Omit<Habitacion, 'id'>) => Promise<void>;
  updateHabitacion: (id: string, data: Partial<Habitacion>) => Promise<void>;
  deleteHabitacion: (id: string) => Promise<void>;

  addCliente: (cliente: Omit<Cliente, 'id' | 'fechaRegistro'>) => Promise<void>;
  updateCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;

  addEstadia: (estadia: Omit<Estadia, 'id'>) => Promise<string>;
  updateEstadia: (id: string, data: Partial<Estadia>) => Promise<void>;
  endEstadia: (id: string, fechaSalida: string, totalPagado: number, estaPagado: boolean) => Promise<void>;

  addTransaccion: (transaccion: Omit<Transaccion, 'id' | 'numeroRecibo'>) => Promise<string>;

  getEstadiaActivaByHabitacion: (habitacionId: string) => Estadia | undefined;
  getEstadiasByCliente: (clienteId: string) => Estadia[];
  getTransaccionesByEstadia: (estadiaId: string) => Transaccion[];

  updateConfig: (data: Partial<ConfigNegocio>) => Promise<void>;
  toggleDarkMode: () => void;

  getIngresosDiarios: (fecha: string) => number;
  getIngresosSemanales: (fechaInicio: string, fechaFin: string) => number;
  getIngresosMensuales: (anio: number, mes: number) => number;
  getIngresosAnuales: (anio: number) => number;

  getProximosVencimientos: (dias: number) => { estadia: Estadia; cliente: Cliente; habitacion: Habitacion }[];

  clearTransacciones: () => Promise<void>;

  initDemo: () => void;
  loadFromSupabase: () => Promise<void>;
}

const generarId = () => Math.random().toString(36).substring(2, 15);

const fechaHoy = () => new Date().toISOString().split('T')[0];

const configDefault: ConfigNegocio = {
  nombre: 'Gestor de Habitaciones',
  direccion: 'Av. Principal 123, Ciudad',
  telefono: '+51 999 999 999',
  email: 'contacto@gestorhabitaciones.com',
  leyendaPieRecibo: 'Gracias por su preferencia',
  impuestoRecibo: 0,
  tarifaDiariaDefault: 50,
  tariffMensualDefault: 800,
  proximoNumeroRecibo: 1001,
  contrasenaAdmin: 'admin123',
  horaCheckout: '13:00',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      habitaciones: [],
      clientes: [],
      estadias: [],
      transacciones: [],
      config: configDefault,
      darkMode: false,
      isLoading: true,

      loadFromSupabase: async () => {
        set({ isLoading: true });
        try {
          const { data: habitaciones } = await supabase.from('habitaciones').select('*');
          const { data: clientes } = await supabase.from('clientes').select('*');
          const { data: estadias } = await supabase.from('estadias').select('*');
          const { data: transacciones } = await supabase.from('transacciones').select('*');
          const { data: configData } = await supabase.from('config').select('*').eq('id', 'default').single();

          set({
            habitaciones: habitaciones || [],
            clientes: clientes || [],
            estadias: estadias || [],
            transacciones: transacciones || [],
            config: configData || configDefault,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error loading from Supabase:', error);
          set({ isLoading: false });
        }
      },

      addHabitacion: async (habitacion) => {
        const id = generarId();
        const nueva = { ...habitacion, id };
        set((state) => ({ habitaciones: [...state.habitaciones, nueva] }));
        await supabase.from('habitaciones').insert([nueva]);
      },

      updateHabitacion: async (id, data) => {
        set((state) => ({
          habitaciones: state.habitaciones.map((h) =>
            h.id === id ? { ...h, ...data } : h
          ),
        }));
        await supabase.from('habitaciones').update(data).eq('id', id);
      },

      deleteHabitacion: async (id) => {
        set((state) => ({
          habitaciones: state.habitaciones.filter((h) => h.id !== id),
        }));
        await supabase.from('habitaciones').delete().eq('id', id);
      },

      addCliente: async (cliente) => {
        const id = generarId();
        const nuevo = { ...cliente, id, fechaRegistro: fechaHoy() };
        set((state) => ({ clientes: [...state.clientes, nuevo] }));
        await supabase.from('clientes').insert([nuevo]);
      },

      updateCliente: async (id, data) => {
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
        await supabase.from('clientes').update(data).eq('id', id);
      },

      deleteCliente: async (id) => {
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        }));
        await supabase.from('clientes').delete().eq('id', id);
      },

      addEstadia: async (estadia) => {
        const id = generarId();
        set((state) => ({
          estadias: [...state.estadias, { ...estadia, id }],
          habitaciones: state.habitaciones.map((h) =>
            h.id === estadia.habitacionId
              ? { ...h, estado: 'ocupada' as EstadoHabitacion }
              : h
          ),
        }));
        await supabase.from('estadias').insert([{ ...estadia, id }]);
        await supabase.from('habitaciones')
          .update({ estado: 'ocupada' })
          .eq('id', estadia.habitacionId);
        return id;
      },

      updateEstadia: async (id, data) => {
        set((state) => ({
          estadias: state.estadias.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        }));
        await supabase.from('estadias').update(data).eq('id', id);
      },

      endEstadia: async (id, fechaSalida, totalPagado, estaPagado) => {
        const estadia = get().estadias.find((e) => e.id === id);
        if (!estadia) return;

        set((state) => ({
          estadias: state.estadias.map((e) =>
            e.id === id
              ? {
                  ...e,
                  estado: 'finalizada' as const,
                  fechaSalidaReal: fechaSalida,
                  totalPagado,
                  saldoPendiente: estaPagado ? 0 : e.tarifaAplicada - totalPagado,
                  estaPagado,
                }
              : e
          ),
          habitaciones: state.habitaciones.map((h) =>
            h.id === estadia.habitacionId
              ? { ...h, estado: 'disponible' as EstadoHabitacion }
              : h
          ),
        }));

        await supabase.from('estadias').update({
          estado: 'finalizada',
          fechaSalidaReal: fechaSalida,
          totalPagado,
          saldoPendiente: estaPagado ? 0 : estadia.tarifaAplicada - totalPagado,
          estaPagado,
        }).eq('id', id);

        await supabase.from('habitaciones')
          .update({ estado: 'disponible' })
          .eq('id', estadia.habitacionId);
      },

      addTransaccion: async (transaccion) => {
        const id = generarId();
        const numeroRecibo = `R${get().config.proximoNumeroRecibo}`;
        const nueva = { ...transaccion, id, numeroRecibo };
        
        set((state) => ({
          transacciones: [...state.transacciones, nueva],
          config: { ...state.config, proximoNumeroRecibo: state.config.proximoNumeroRecibo + 1 },
        }));

        await supabase.from('transacciones').insert([nueva]);
        await supabase.from('config')
          .update({ proximoNumeroRecibo: get().config.proximoNumeroRecibo + 1 })
          .eq('id', 'default');

        return numeroRecibo;
      },

      getEstadiaActivaByHabitacion: (habitacionId) => {
        return get().estadias.find(
          (e) => e.habitacionId === habitacionId && e.estado === 'activa'
        );
      },

      getEstadiasByCliente: (clienteId) => {
        return get().estadias.filter((e) => e.clienteId === clienteId);
      },

      getTransaccionesByEstadia: (estadiaId) => {
        return get().transacciones.filter((t) => t.estadiaId === estadiaId);
      },

      updateConfig: async (data) => {
        set((state) => ({ config: { ...state.config, ...data } }));
        await supabase.from('config').update(data).eq('id', 'default');
      },

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      getIngresosDiarios: (fecha) => {
        return get()
          .transacciones.filter((t) => t.fecha.startsWith(fecha) && (t.tipo === 'checkin' || t.tipo === 'pago_parcial'))
          .reduce((sum, t) => sum + t.monto, 0);
      },

      getIngresosSemanales: (fechaInicio, fechaFin) => {
        return get()
          .transacciones.filter((t) => {
            const fecha = t.fecha.substring(0, 10);
            return fecha >= fechaInicio && fecha <= fechaFin && (t.tipo === 'checkin' || t.tipo === 'pago_parcial');
          })
          .reduce((sum, t) => sum + t.monto, 0);
      },

      getIngresosMensuales: (anio, mes) => {
        const mesStr = String(mes).padStart(2, '0');
        return get()
          .transacciones.filter((t) => {
            const fecha = t.fecha.substring(0, 7);
            return fecha === `${anio}-${mesStr}` && (t.tipo === 'checkin' || t.tipo === 'pago_parcial');
          })
          .reduce((sum, t) => sum + t.monto, 0);
      },

      getIngresosAnuales: (anio) => {
        return get()
          .transacciones.filter((t) => {
            const anioFecha = parseInt(t.fecha.substring(0, 4));
            return anioFecha === anio && (t.tipo === 'checkin' || t.tipo === 'pago_parcial');
          })
          .reduce((sum, t) => sum + t.monto, 0);
      },

      getProximosVencimientos: (dias) => {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + dias);
        const fechaStr = fechaLimite.toISOString().split('T')[0];

        return get()
          .estadias.filter((e) => e.estado === 'activa' && e.tipo === 'mes' && !e.estaPagado && e.fechaSalidaEstimada <= fechaStr)
          .map((estadia) => ({
            estadia,
            cliente: get().clientes.find((c) => c.id === estadia.clienteId)!,
            habitacion: get().habitaciones.find((h) => h.id === estadia.habitacionId)!,
          }))
          .filter((item) => item.cliente && item.habitacion);
      },

      initDemo: () => {
        set({
          habitaciones: [],
          clientes: [],
          estadias: [],
          transacciones: [],
          config: { ...configDefault, proximoNumeroRecibo: 1001 },
          darkMode: false,
          isLoading: false,
        });
      },

      clearTransacciones: async () => {
        set({ transacciones: [] });
        await supabase.from('transacciones').delete().neq('id', '');
      },
    }),
    {
      name: 'habita-gest-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
      }),
    }
  )
);