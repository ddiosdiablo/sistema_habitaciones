import { X, Eye, Printer, Download, MessageCircle, Check, AlertCircle } from 'lucide-react';
import { generarReciboPDF, generarReciboBlob, generarReciboHTML } from '../utils/generarReciboPDF';
import type { DatosRecibo } from '../utils/generarReciboPDF';
import { useState } from 'react';

interface VistaPreviaReciboProps {
  datos: DatosRecibo;
  onClose: () => void;
}

export const VistaPreviaRecibo = ({ datos, onClose }: VistaPreviaReciboProps) => {
  const html = generarReciboHTML(datos);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState(false);

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

  const handleEnviarWhatsApp = async () => {
    setSendingWhatsapp(true);
    setShareSuccess(false);
    setShareError(false);

    const blob = generarReciboBlob(datos);
    const file = new File([blob], `recibo_${datos.transaccion.numeroRecibo}.pdf`, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: `Recibo ${datos.transaccion.numeroRecibo}`,
          text: `Recibo de pago - ${datos.config.nombre}`,
          files: [file],
        });
        setShareSuccess(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          fallbackWhatsApp(datos);
        }
      }
    } else {
      fallbackWhatsApp(datos);
    }

    setSendingWhatsapp(false);
  };

  const fallbackWhatsApp = (datos: DatosRecibo) => {
    generarReciboPDF(datos);
    const telefono = datos.cliente.telefono.replace(/[^0-9+]/g, '');
    const mensaje = `📄 Aquí tienes tu recibo N° ${datos.transaccion.numeroRecibo} de ${datos.config.nombre}. El PDF se ha descargado, adjúntalo por favor.`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
    setShareError(true);
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

        <div className="flex flex-col gap-2 p-4 border-t border-neutral-200 dark:border-neutral-800">
          {shareSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
              <Check size={16} />
              Recibo compartido exitosamente
            </div>
          )}
          {shareError && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
              <AlertCircle size={16} />
              PDF descargado. Adjúntalo manualmente en WhatsApp.
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleEnviarWhatsApp}
              disabled={sendingWhatsapp}
              className="py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              {sendingWhatsapp ? 'Enviando...' : 'WhatsApp'}
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