import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// Conversión automática camelCase <-> snake_case
// ============================================================

const EXCEPCIONES: Record<string, Record<string, string>> = {
  config: {
    tarifaDiariaDefault: 'tarifa_diaria_default',
    tariffMensualDefault: 'tariff_mensual_default',
    proximoNumeroRecibo: 'proximo_numero_recibo',
    usuarioAdmin: 'usuario_admin',
    contrasenaAdmin: 'contrasena_admin',
    horaCheckout: 'hora_checkout',
    leyendaPieRecibo: 'leyenda_pie_recibo',
    impuestoRecibo: 'impuesto_recibo',
  },
  clientes: {
    nombreCompleto: 'nombre_completo',
    fechaRegistro: 'fecha_registro',
  },
  estadias: {
    habitacionId: 'habitacion_id',
    clienteId: 'cliente_id',
    fechaEntrada: 'fecha_entrada',
    fechaSalidaEstimada: 'fecha_salida_estimada',
    fechaSalidaReal: 'fecha_salida_real',
    tarifaOriginal: 'tarifa_original',
    tarifaAplicada: 'tarifa_aplicada',
    totalPagado: 'total_pagado',
    saldoPendiente: 'saldo_pendiente',
    estaPagado: 'esta_pagado',
  },
  transacciones: {
    estadiaId: 'estadia_id',
    habitacionId: 'habitacion_id',
    clienteId: 'cliente_id',
    numeroRecibo: 'numero_recibo',
    metodoPago: 'metodo_pago',
  },
  habitaciones: {
    tarifaDiaria: 'tarifa_diaria',
    tariffMensual: 'tariff_mensual',
  },
  gastos: {
    metodoPago: 'metodo_pago',
  },
};

function camelToSnake(key: string): string {
  const result = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
  return result;
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
}

function toSnake(obj: Record<string, unknown>, table: string): Record<string, unknown> {
  const exc = EXCEPCIONES[table] ?? {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[exc[key] ?? camelToSnake(key)] = value;
  }
  return result;
}

function toCamel(obj: Record<string, unknown> | null, table: string): Record<string, unknown> | null {
  if (!obj) return null;
  const exc = EXCEPCIONES[table] ?? {};
  const reverseExc: Record<string, string> = {};
  for (const [camel, snake] of Object.entries(exc)) {
    reverseExc[snake] = camel;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[reverseExc[key] ?? snakeToCamel(key)] = value;
  }
  return result;
}

function toCamelArray(arr: Record<string, unknown>[] | null | undefined, table: string): Record<string, unknown>[] {
  if (!arr) return [];
  return arr.map((item) => toCamel(item, table) as Record<string, unknown>);
}

// ============================================================
// Select chainable builder
// ============================================================

interface DbResult<T> {
  data: T | null;
  error: { message: string; code?: string; details?: string; hint?: string } | null;
}

class SelectQuery<T> implements PromiseLike<DbResult<T | T[]>> {
  private builder: any;
  private table: string;

  constructor(builder: any, table: string) {
    this.builder = builder;
    this.table = table;
  }

  private dbCol(column: string): string {
    const exc = EXCEPCIONES[this.table] ?? {};
    return exc[column] ?? camelToSnake(column);
  }

  eq(column: string, value: unknown): this {
    this.builder = this.builder.eq(this.dbCol(column), value) as any;
    return this;
  }

  neq(column: string, value: unknown): this {
    this.builder = this.builder.neq(this.dbCol(column), value) as any;
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.builder = this.builder.order(this.dbCol(column), options) as any;
    return this;
  }

  limit(n: number): this {
    this.builder = this.builder.limit(n) as any;
    return this;
  }

  in(column: string, values: unknown[]): this {
    this.builder = this.builder.in(this.dbCol(column), values) as any;
    return this;
  }

  maybeSingle(): Promise<DbResult<T | null>> {
    return (async () => {
      const result = await (this.builder as any).maybeSingle();
      if (result.error || !result.data) return result as DbResult<T | null>;
      return { ...result, data: toCamel(result.data, this.table) };
    })();
  }

  single(): Promise<DbResult<T>> {
    return (async () => {
      const result = await (this.builder as any).single();
      if (result.error || !result.data) return result as DbResult<T>;
      return { ...result, data: toCamel(result.data, this.table) };
    })();
  }

  then<TResult1 = DbResult<T | T[]>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<T | T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    const promise = (async (): Promise<DbResult<T | T[]>> => {
      const result = await (this.builder as any);
      if (result.error) return { data: null, error: result.error };
      if (Array.isArray(result.data)) {
        return { data: toCamelArray(result.data, this.table) as unknown as T[], error: null };
      }
      return { data: toCamel(result.data, this.table) as unknown as T, error: null };
    })();
    return promise.then(onfulfilled, onrejected);
  }
}

// ============================================================
// API principal
// ============================================================

export const db = {
  from(table: string) {
    const supaRef = supabase.from(table);

    return {
      select<T = any>(columns = '*'): SelectQuery<T> {
        return new SelectQuery<T>(supaRef.select(columns) as any, table);
      },

      async insert(data: Record<string, unknown> | Record<string, unknown>[]) {
        const items = Array.isArray(data) ? data : [data];
        const transformed = items.map((item) => toSnake(item, table));
        const result = await supaRef.insert(transformed).select();
        if (result.error) return result;
        if (result.data) {
          return {
            ...result,
            data: Array.isArray(result.data)
              ? toCamelArray(result.data, table)
              : toCamel(result.data[0], table),
          };
        }
        return result;
      },

      update(data: Record<string, unknown>) {
        const transformed = toSnake(data, table);
        return {
          eq(column: string, value: unknown) {
            const exc = EXCEPCIONES[table] ?? {};
            const dbCol = exc[column] ?? camelToSnake(column);
            return supaRef.update(transformed).eq(dbCol, value);
          },
        };
      },

      delete() {
        return {
          eq(column: string, value: unknown) {
            const exc = EXCEPCIONES[table] ?? {};
            const dbCol = exc[column] ?? camelToSnake(column);
            return supaRef.delete().eq(dbCol, value);
          },
          neq(column: string, value: unknown) {
            const exc = EXCEPCIONES[table] ?? {};
            const dbCol = exc[column] ?? camelToSnake(column);
            return supaRef.delete().neq(dbCol, value);
          },
        };
      },
    };
  },
};
