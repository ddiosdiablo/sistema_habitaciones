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
          const { data: habitaciones, error: habError } = await supabase.from('habitaciones').select('*');
          if (habError) console.error('Error loading habitaciones:', habError);
          
          const { data: clientes, error: cliError } = await supabase.from('clientes').select('*');
          if (cliError) console.error('Error loading clientes:', cliError);
          
          const { data: estadias, error: estError } = await supabase.from('estadias').select('*');
          if (estError) console.error('Error loading estadias:', estError);
          
          const { data: transacciones, error: transError } = await supabase.from('transacciones').select('*');
          if (transError) console.error('Error loading transacciones:', transError);
          
          const { data: configData, error: configError } = await supabase.from('config').select('*').limit(1).maybeSingle();
          if (configError && !configError.message.includes('schema cache')) {
            console.error('Error loading config:', configError);
          }

          if (configData) {
            const excludedKeys = ['id', 'created_at', 'updated_at'];
            const mergedConfig: ConfigNegocio = {
              ...configDefault,
              ...Object.fromEntries(
                Object.entries(configData).filter(([k, v]) => !excludedKeys.includes(k) && v !== null)
              ),
            };
            set({
              habitaciones: habitaciones || [],
              clientes: clientes || [],
              estadias: estadias || [],
              transacciones: transacciones || [],
              config: mergedConfig,
              configId: configData.id,
              isLoading: false,
            });
          } else {
            set({
              habitaciones: habitaciones || [],
              clientes: clientes || [],
              estadias: estadias || [],
              transacciones: transacciones || [],
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
        const id = generarId();
        const nueva = { ...habitacion, id };
        
        const { error } = await supabase.from('habitaciones').insert([nueva]);
        if (error) {
          console.error('Error adding habitacion:', error);
          alert(`Error al guardar la habitación: ${error.message}`);
          return;
        }
        
        set((state) => ({ habitaciones: [...state.habitaciones, nueva] }));
      },

      updateHabitacion: async (id, data) => {
        const { error } = await supabase.from('habitaciones').update(data).eq('id', id);
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
        const { error } = await supabase.from('habitaciones').delete().eq('id', id);
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
        const id = generarId();
        const nuevo = { ...cliente, id, fechaRegistro: fechaHoy() };
        
        const { error } = await supabase.from('clientes').insert([nuevo]);
        if (error) {
          console.error('Error adding cliente:', error);
          alert(`Error al guardar el cliente: ${error.message}`);
          return;
        }
        
        set((state) => ({ clientes: [...state.clientes, nuevo] }));
      },

      updateCliente: async (id, data) => {
        const { error } = await supabase.from('clientes').update(data).eq('id', id);
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
        const { error } = await supabase.from('clientes').delete().eq('id', id);
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
        const id = generarId();
        
        const { error } = await supabase.from('estadias').insert([{ ...estadia, id }]);
        if (error) {
          console.error('Error adding estadia:', error);
          alert(`Error al guardar la estadía: ${error.message}`);
          throw error;
        }
        
        await supabase.from('habitaciones')
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
        const { error } = await supabase.from('estadias').update(data).eq('id', id);
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

        const { error: estadiaError } = await supabase.from('estadias').update({
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

        await supabase.from('habitaciones')
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
        const id = generarId();
        const numeroRecibo = `R${get().config.proximoNumeroRecibo}`;
        const nueva = { ...transaccion, id, numeroRecibo };
        
        const { error } = await supabase.from('transacciones').insert([nueva]);
        if (error) {
          console.error('Error adding transaccion:', error);
          alert(`Error al guardar la transacción: ${error.message}`);
          throw error;
        }
        
        const configId = get().configId;
        if (configId) {
          await supabase.from('config')
            .update({ proximoNumeroRecibo: get().config.proximoNumeroRecibo + 1 })
            .eq('id', configId);
        }

        set((state) => ({
          transacciones: [...state.transacciones, nueva],
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
          const { data: inserted, error: insertError } = await supabase.from('config').insert([{ ...configDefault, ...safeData }]).select().single();
          if (insertError) {
            if (insertError.message.includes('schema cache')) {
              alert('Columna no encontrada en Supabase. Ejecuta el SQL para agregar la columna usuarioAdmin en la base de datos.');
              return;
            }
            console.error('Error creating config:', insertError);
            alert(`Error al crear la configuración: ${insertError.message}`);
            return;
          }
          set((state) => ({ config: { ...state.config, ...safeData }, configId: inserted.id }));
        } else {
          const { error } = await supabase.from('config').update(safeData).eq('id', currentConfigId);
          if (error) {
            if (error.message.includes('schema cache')) {
              alert('Columna no encontrada en Supabase. Ejecuta el SQL para agregar la columna usuarioAdmin en la base de datos.');
              return;
            }
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
        await supabase.from('transacciones').delete().neq('id', '');
      },

      syncToSupabase: async () => {
        const state = get();
        let synced = { habitaciones: 0, clientes: 0, estadias: 0, transacciones: 0 };

        try {
          const { data: supaHabitaciones } = await supabase.from('habitaciones').select('id');
          const supaHabIds = new Set(supaHabitaciones?.map((h: { id: string }) => h.id) || []);
          const habitacionesToSync = state.habitaciones.filter((h) => !supaHabIds.has(h.id));
          for (const hab of habitacionesToSync) {
            const { error } = await supabase.from('habitaciones').insert([hab]);
            if (!error) synced.habitaciones++;
            else console.error(`Error syncing habitacion ${hab.id}:`, error);
          }

          const { data: supaClientes } = await supabase.from('clientes').select('id');
          const supaCliIds = new Set(supaClientes?.map((c: { id: string }) => c.id) || []);
          const clientesToSync = state.clientes.filter((c) => !supaCliIds.has(c.id));
          for (const cli of clientesToSync) {
            const { error } = await supabase.from('clientes').insert([cli]);
            if (!error) synced.clientes++;
            else console.error(`Error syncing cliente ${cli.id}:`, error);
          }

          const { data: supaEstadias } = await supabase.from('estadias').select('id');
          const supaEstIds = new Set(supaEstadias?.map((e: { id: string }) => e.id) || []);
          const estadiasToSync = state.estadias.filter((e) => !supaEstIds.has(e.id));
          for (const est of estadiasToSync) {
            const { error } = await supabase.from('estadias').insert([est]);
            if (!error) synced.estadias++;
            else console.error(`Error syncing estadia ${est.id}:`, error);
          }

          const { data: supaTransacciones } = await supabase.from('transacciones').select('id');
          const supaTransIds = new Set(supaTransacciones?.map((t: { id: string }) => t.id) || []);
          const transaccionesToSync = state.transacciones.filter((t) => !supaTransIds.has(t.id));
          for (const trans of transaccionesToSync) {
            const { error } = await supabase.from('transacciones').insert([trans]);
            if (!error) synced.transacciones++;
            else console.error(`Error syncing transaccion ${trans.id}:`, error);
          }

          const currentConfigId = get().configId;
          if (currentConfigId) {
            const { data: configSupa } = await supabase.from('config').select('*').eq('id', currentConfigId).single();
            if (configSupa && state.config.proximoNumeroRecibo > configSupa.proximoNumeroRecibo) {
              await supabase.from('config').update({ proximoNumeroRecibo: state.config.proximoNumeroRecibo }).eq('id', currentConfigId);
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
      partialize: (state) => ({
        darkMode: state.darkMode,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);