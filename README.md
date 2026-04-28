# HabitaGest - Sistema de Gestión de Alquiler de Habitaciones

Aplicación web completa para la gestión de un negocio de alquiler de habitaciones por día y por mes.

## Características

- **Panel de control (Dashboard)**: Resumen visual de habitaciones, ingresos y próximos vencimientos
- **Gestión de habitaciones**: CRUD de habitaciones con tarifas diarias y mensuales
- **Registro de clientes y check-in**: Formulario completo para nuevos huéspedes
- **Check-out**: Cálculo automático y generación de recibos
- **Control de pagos**: Historial de transacciones y reportes
- **Generación de recibos PDF**: Recibo imprimible y descargable

## Tecnologías

- React 18+ con TypeScript
- Vite
- Tailwind CSS
- Zustand (gestión de estado con persistencia)
- React Router v6
- Chart.js / react-chartjs-2
- jsPDF + html2canvas
- Lucide React (íconos)

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist/`.

## Estructura del Proyecto

```
habita-gest/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/         # Páginas del sistema
│   ├── store/         # Zustand store
│   ├── types/         # Tipos TypeScript
│   ├── utils/         # Utilidades
│   ├── App.tsx        # Componente principal
│   ├── main.tsx       # Entry point
│   └── index.css      # Estilos globales
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## Modo de uso

Al iniciar la aplicación, se cargarán datos de ejemplo:

- 5 habitaciones (101, 102, 103, 201, 202)
- 3 clientes de ejemplo
- 2 estadías activas

## Licencia

MIT