import { X, Eye, Printer, Download, MessageCircle } from 'lucide-react';
import { generarReciboPDF, generarReciboHTML } from '../utils/generarReciboPDF';
import type { DatosRecibo } from '../utils/generarReciboPDF';

interface VistaPreviaReciboProps {
  datos: DatosRecibo;
  onClose: () => void;
}

export const VistaPreviaRecibo = ({ datos, onClose }: VistaPreviaReciboProps) => {
  const html = generarReciboHTML(datos);

  const handleImprimir = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printStyles = `
        <style>
          @page {
            size: A5;
            margin: 10mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      `;
      printWindow.document.write(`<!DOCTYPE html><html><head><title>Recibo ${datos.transaccion.numeroRecibo}</title>${printStyles}</head><body>${html}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDescargarPDF = () => {
    generarReciboPDF(datos);
  };

  const handleEnviarWhatsApp = () => {
    const telefono = datos.cliente.telefono.replace(/[^0-9+]/g, '');
    const negocio = datos.config.nombre;
    const reciboNum = datos.transaccion.numeroRecibo;
    const habitacion = datos.habitacion.numero;
    const cliente = datos.cliente.nombreCompleto;
    const monto = datos.transaccion.monto;
    const fecha = datos.transaccion.fecha.substring(0, 10);
    const concepto = datos.transaccion.concepto;

    const mensaje = `📄 *RECIBO DE PAGO*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🏠 *${negocio}*\n\n` +
      `📋 Recibo N°: ${reciboNum}\n` +
      `📅 Fecha: ${fecha}\n\n` +
      `👤 Cliente: ${cliente}\n` +
      `🚪 Habitación: ${habitacion}\n\n` +
      `💰 *Total: $${monto}*\n\n` +
      `📝 ${concepto}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `Gracias por su preferencia.`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Vista Previa del Recibo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-neutral-100 dark:bg-neutral-800">
          <div
            className="mx-auto bg-white shadow-lg"
            style={{
              width: '148mm',
              minHeight: '210mm',
              padding: '20px',
              fontFamily: 'Arial, sans-serif',
              color: '#000',
              backgroundColor: '#fff',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <div className="flex gap-3 p-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleEnviarWhatsApp}
            className="py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
          <button
            onClick={handleDescargarPDF}
            className="py-2.5 px-4 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            PDF
          </button>
          <button
            onClick={handleImprimir}
            className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            Imprimir (A5)
          </button>
        </div>
      </div>
    </div>
  );
};

export const generarReciboConAdelantado = (datos: DatosRecibo): string => {
  return generarReciboHTML({
    ...datos,
    transaccion: {
      ...datos.transaccion,
      concepto: `[PAGO ADELANTADO] ${datos.transaccion.concepto}`,
    },
  });
};