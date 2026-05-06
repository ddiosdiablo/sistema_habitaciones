import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../lib/supabase';
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
  configId: string | null;
  darkMode: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;

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
  login: (username: string, password: string) => boolean;
  logout: () => void;
  toggleDarkMode: () => void;

  getIngresosDiarios: (fecha: string) => number;
  getIngresosSemanales: (fechaInicio: string, fechaFin: string) => number;
  getIngresosMensuales: (anio: number, mes: number) => number;
  getIngresosAnuales: (anio: number) => number;

  getProximosVencimientos: (dias: number) => { estadia: Estadia; cliente: Cliente; habitacion: Habitacion }[];

  clearTransacciones: () => Promise<void>;

  syncToSupabase: () => Promise<{ habitaciones: number; clientes: number; estadias: number; transacciones: number }>;

  initDemo: () => void;
  loadFromSupabase: () => Promise<void>;
}

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
  usuarioAdmin: '',
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
      configId: null,
      darkMode: false,
      isLoading: true,
      isAuthenticated: false,

      loadFromSupabase: async () => {
        set({ isLoading: true });
        try {
          const habResult = await db.from('habitaciones').select('*');
          const habitaciones = (habResult.data as Habitacion[]) || [];
          if (habResult.error) console.error('Error loading habitaciones:', habResult.error);
          
          const cliResult = await db.from('clientes').select('*');
          const clientes = (cliResult.data as Cliente[]) || [];
          if (cliResult.error) console.error('Error loading clientes:', cliResult.error);
          
          const estResult = await db.from('estadias').select('*');
          const estadias = (estResult.data as Estadia[]) || [];
          if (estResult.error) console.error('Error loading estadias:', estResult.error);
          
          const transResult = await db.from('transacciones').select('*');
          const transacciones = (transResult.data as Transaccion[]) || [];
          if (transResult.error) console.error('Error loading transacciones:', transResult.error);
          
          const configResult = await db.from('config').select('*');
          const configData = (configResult.data as ConfigNegocio[] & { id?: string }[])[0] || null;
          if (configResult.error && !configResult.error.message.includes('schema cache')) {
            console.error('Error loading config:', configResult.error);
          }

          if (configData) {
            const { id, ...configFields } = configData;
            const mergedConfig: ConfigNegocio = {
              ...configDefault,
              ...Object.fromEntries(
                Object.entries(configFields).filter(([_, v]) => v !== null && v !== undefined)
              ) as unknown as ConfigNegocio,
            };
            set({
              habitaciones,
              clientes,
              estadias,
              transacciones,
              config: mergedConfig,
              configId: id || null,
              isLoading: false,
            });
          } else {
            set({
              habitaciones,
              clientes,
              estadias,
              transacciones,
              config: configDefault,
              configId: null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error loading from Supabase:', error);
          set({ isLoading: false });
        }
      },

      addHabitacion: async (habitacion) => {
        const { data: inserted, error } = await db.from('habitaciones').insert([habitacion]);
        if (error) {
          console.error('Error adding habitacion:', error);
          alert(`Error al guardar la habitación: ${error.message}`);
          return;
        }
        const nueva = { ...habitacion, id: (inserted as any)[0].id };
        set((state) => ({ habitaciones: [...state.habitaciones, nueva] }));
      },

      updateHabitacion: async (id, data) => {
        const { error } = await db.from('habitaciones').update(data).eq('id', id);
        if (error) {
          console.error('Error updating habitacion:', error);
          alert(`Error al actualizar la habitación: ${error.message}`);
          return;
        }
        
        set((state) => ({
          habitaciones: state.habitaciones.map((h) =>
            h.id === id ? { ...h, ...data } : h
          ),
        }));
      },

      deleteHabitacion: async (id) => {
        const { error } = await db.from('habitaciones').delete().eq('id', id);
        if (error) {
          console.error('Error deleting habitacion:', error);
          alert(`Error al eliminar la habitación: ${error.message}`);
          return;
        }
        
        set((state) => ({
          habitaciones: state.habitaciones.filter((h) => h.id !== id),
        }));
      },

      addCliente: async (cliente) => {
        const nuevo = { ...cliente, fechaRegistro: fechaHoy() };
        const { data: inserted, error } = await db.from('clientes').insert([nuevo]);
        if (error) {
          console.error('Error adding cliente:', error);
          alert(`Error al guardar el cliente: ${error.message}`);
          return;
        }
        const clienteConId = { ...nuevo, id: (inserted as any)[0].id };
        set((state) => ({ clientes: [...state.clientes, clienteConId] }));
      },

      updateCliente: async (id, data) => {
        const { error } = await db.from('clientes').update(data).eq('id', id);
        if (error) {
          console.error('Error updating cliente:', error);
          alert(`Error al actualizar el cliente: ${error.message}`);
          return;
        }
        
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteCliente: async (id) => {
        const { error } = await db.from('clientes').delete().eq('id', id);
        if (error) {
          console.error('Error deleting cliente:', error);
          alert(`Error al eliminar el cliente: ${error.message}`);
          return;
        }
        
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        }));
      },

      addEstadia: async (estadia) => {
        const { data: inserted, error } = await db.from('estadias').insert([{ ...estadia }]);
        if (error) {
          console.error('Error adding estadia:', error);
          alert(`Error al guardar la estadía: ${error.message}`);
          throw error;
        }
        const id = (inserted as any)[0].id;
        
        await db.from('habitaciones')
          .update({ estado: 'ocupada' })
          .eq('id', estadia.habitacionId);
        
        set((state) => ({
          estadias: [...state.estadias, { ...estadia, id }],
          habitaciones: state.habitaciones.map((h) =>
            h.id === estadia.habitacionId
              ? { ...h, estado: 'ocupada' as EstadoHabitacion }
              : h
          ),
        }));
        
        return id;
      },

      updateEstadia: async (id, data) => {
        const { error } = await db.from('estadias').update(data).eq('id', id);
        if (error) {
          console.error('Error updating estadia:', error);
          alert(`Error al actualizar la estadía: ${error.message}`);
          return;
        }
        
        set((state) => ({
          estadias: state.estadias.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        }));
      },

      endEstadia: async (id, fechaSalida, totalPagado, estaPagado) => {
        const estadia = get().estadias.find((e) => e.id === id);
        if (!estadia) return;

        const { error: estadiaError } = await db.from('estadias').update({
          estado: 'finalizada',
          fechaSalidaReal: fechaSalida,
          totalPagado,
          saldoPendiente: estaPagado ? 0 : estadia.tarifaAplicada - totalPagado,
          estaPagado,
        }).eq('id', id);
        
        if (estadiaError) {
          console.error('Error ending estadia:', estadiaError);
          alert(`Error al finalizar la estadía: ${estadiaError.message}`);
          return;
        }

        await db.from('habitaciones')
          .update({ estado: 'disponible' })
          .eq('id', estadia.habitacionId);

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
      },

      addTransaccion: async (transaccion) => {
        const numeroRecibo = `R${get().config.proximoNumeroRecibo}`;
        const nueva = { ...transaccion, numeroRecibo };
        
        const { data: inserted, error } = await db.from('transacciones').insert([nueva]);
        if (error) {
          console.error('Error adding transaccion:', error);
          alert(`Error al guardar la transacción: ${error.message}`);
          throw error;
        }
        const id = (inserted as any)[0].id;
        
        const configId = get().configId;
        if (configId) {
          await db.from('config')
            .update({ proximoNumeroRecibo: get().config.proximoNumeroRecibo + 1 })
            .eq('id', configId);
        }

        set((state) => ({
          transacciones: [...state.transacciones, { ...nueva, id }],
          config: { ...state.config, proximoNumeroRecibo: state.config.proximoNumeroRecibo + 1 },
        }));

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
        const currentConfigId = get().configId;
        const safeData = { ...data };

        if (!currentConfigId) {
          const { data: inserted, error: insertError } = await db.from('config').insert([{ ...configDefault, ...safeData }]);
          if (insertError) {
            console.error('Error creating config:', insertError);
            alert(`Error al crear la configuración: ${insertError.message}`);
            return;
          }
          const insertedId = (inserted as any)?.id || (inserted as any)?.[0]?.id;
          set((state) => ({ config: { ...state.config, ...safeData }, configId: insertedId || null }));
        } else {
          const { error } = await db.from('config').update(safeData).eq('id', currentConfigId);
          if (error) {
            console.error('Error updating config:', error);
            alert(`Error al actualizar la configuración: ${error.message}`);
            return;
          }
          set((state) => ({ config: { ...state.config, ...safeData } }));
        }
      },

      login: (username, password) => {
        const { config } = get();
        const userMatch = !config.usuarioAdmin || username === config.usuarioAdmin;
        const passMatch = !config.contrasenaAdmin || password === config.contrasenaAdmin;
        if (userMatch && passMatch) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
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
          configId: null,
          darkMode: false,
          isLoading: false,
        });
      },

      clearTransacciones: async () => {
        set({ transacciones: [] });
        await db.from('transacciones').delete().neq('id', '');
      },

      syncToSupabase: async () => {
        const state = get();
        let synced = { habitaciones: 0, clientes: 0, estadias: 0, transacciones: 0 };

        try {
          const habResult = await db.from('habitaciones').select('*');
          const supaHabitaciones = habResult.data as { id: string }[] || [];
          const supaHabIds = new Set(supaHabitaciones.map((h: { id: string }) => h.id));
          const habitacionesToSync = state.habitaciones.filter((h) => !supaHabIds.has(h.id));
          for (const hab of habitacionesToSync) {
            const { error } = await db.from('habitaciones').insert([hab as unknown as Record<string, unknown>]);
            if (!error) synced.habitaciones++;
            else console.error(`Error syncing habitacion ${hab.id}:`, error);
          }

          const cliResult = await db.from('clientes').select('*');
          const supaClientes = cliResult.data as { id: string }[] || [];
          const supaCliIds = new Set(supaClientes.map((c: { id: string }) => c.id));
          const clientesToSync = state.clientes.filter((c) => !supaCliIds.has(c.id));
          for (const cli of clientesToSync) {
            const { error } = await db.from('clientes').insert([cli as unknown as Record<string, unknown>]);
            if (!error) synced.clientes++;
            else console.error(`Error syncing cliente ${cli.id}:`, error);
          }

          const estResult = await db.from('estadias').select('*');
          const supaEstadias = estResult.data as { id: string }[] || [];
          const supaEstIds = new Set(supaEstadias.map((e: { id: string }) => e.id));
          const estadiasToSync = state.estadias.filter((e) => !supaEstIds.has(e.id));
          for (const est of estadiasToSync) {
            const { error } = await db.from('estadias').insert([est as unknown as Record<string, unknown>]);
            if (!error) synced.estadias++;
            else console.error(`Error syncing estadia ${est.id}:`, error);
          }

          const transResult = await db.from('transacciones').select('*');
          const supaTransacciones = transResult.data as { id: string }[] || [];
          const supaTransIds = new Set(supaTransacciones.map((t: { id: string }) => t.id));
          const transaccionesToSync = state.transacciones.filter((t) => !supaTransIds.has(t.id));
          for (const trans of transaccionesToSync) {
            const { error } = await db.from('transacciones').insert([trans as unknown as Record<string, unknown>]);
            if (!error) synced.transacciones++;
            else console.error(`Error syncing transaccion ${trans.id}:`, error);
          }

          const currentConfigId = get().configId;
          if (currentConfigId) {
            const configResult = await db.from('config').select('*');
            const allConfig = (configResult.data as any[]) || [];
            const configSupa = allConfig.find((c: any) => c.id === currentConfigId);
            if (configSupa && state.config.proximoNumeroRecibo > configSupa.proximoNumeroRecibo) {
              await db.from('config').update({ proximoNumeroRecibo: state.config.proximoNumeroRecibo }).eq('id', currentConfigId);
            }
          }

          const total = synced.habitaciones + synced.clientes + synced.estadias + synced.transacciones;
          if (total > 0) {
            alert(`Sincronización completada:\n${synced.habitaciones} habitaciones\n${synced.clientes} clientes\n${synced.estadias} estadías\n${synced.transacciones} transacciones`);
            await get().loadFromSupabase();
          } else {
            alert('Todos los datos ya están sincronizados con Supabase.');
          }
        } catch (error) {
          console.error('Error during sync:', error);
          alert(`Error durante la sincronización: ${error}`);
        }

        return synced;
      },
    }),
    {
      name: 'habita-gest-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
      partialize: (state: AppState) => ({
        darkMode: state.darkMode,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  ) as unknown as (set: any, get: any, store: any) => AppState,
);
