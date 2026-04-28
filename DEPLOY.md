# Despliegue en GitHub, Vercel y Supabase

## 1. Preparar el proyecto

### Instalar dependencias
```bash
npm install
```

### Crear archivo `.env.local` con tus credenciales de Supabase
```bash
# Copia .env.example y completa los valores
cp .env.example .env.local
```

## 2. Configurar Supabase

### Opción A: Usar el Schema automática
1. Ve a [Supabase](https://supabase.com) y crea un proyecto nuevo
2. Abre el **SQL Editor**
3. Copia y ejecuta el contenido de `supabase/schema.sql`

### Opción B: Crear tablas manualmente
1. Crea un proyecto en Supabase
2. En el **Table Editor**, crea estas tablas:
   - `habitaciones` (numero, tipo, precio, estado)
   - `clientes` (nombreCompleto, dni, telefono, correo, nacionalidad, fechaRegistro)
   - `estadias` (habitacionId, clienteId, tipo, fechaEntrada, fechaSalidaEstimada, tarifaAplicada, totalPagado, saldoPendiente, estaPagado, estado)
   - `transacciones` (estadiaId, habitacionId, clienteId, numeroRecibo, tipo, monto, metodoPago, concepto, fecha)
   - `config` (nombre, direccion, telefono, email, leyendaPieRecibo, impuestoRecibo, tarifaDiariaDefault, tariffMensualDefault, proximoNumeroRecibo, contrasenaAdmin, horaCheckout)

3. Habilita **RLS** (Row Level Security) en cada tabla

## 3. Desplegar en Vercel

### Desde la terminal
```bash
npm install -g vercel
vercel
```

### Desde la web
1. Sube este proyecto a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Importa el repositorio
4. Agrega las variables de entorno:
   - `VITE_SUPABASE_URL` =tu Supabase URL
   - `VITE_SUPABASE_ANON_KEY` =tu anon key
5. Deploy!

## 4. Configurar Git (opcional)

```bash
git init
git add .
git commit -m "Initial commit"
```

## Notas

- El store actual usa `localStorage` para persistencia local
- Para conectar a Supabase, se requiere modificar `src/store/appStore.ts` para usar el cliente de Supabase
- Si quieres persistencia en la nube desde el inicio, avísame y creo la integración completa