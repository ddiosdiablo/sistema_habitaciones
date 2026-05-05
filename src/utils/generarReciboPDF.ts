import { jsPDF } from 'jspdf';
import type { ConfigNegocio, Cliente, Habitacion, TipoAlquiler, Transaccion } from '../types';
import { formatoFecha展示, formatoFechaTimeStamp } from './fechas';
import { formatearMoneda } from './formatearMoneda';

export interface DatosRecibo {
  config: ConfigNegocio;
  cliente: Cliente;
  habitacion: Habitacion;
  tipoAlquiler: TipoAlquiler;
  transaccion: Transaccion;
  fechaEntrada: string;
  fechaSalida: string;
  tarifaOriginal?: number;
  descuento?: number;
}

export const generarReciboPDF = (datos: DatosRecibo): void => {
  const { config, cliente, habitacion, tipoAlquiler, transaccion, fechaEntrada, fechaSalida, tarifaOriginal, descuento } = datos;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(config.nombre.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(config.direccion, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Tel: ${config.telefono}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE PAGO', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setDrawColor(0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Recibo N°: ${transaccion.numeroRecibo}`, margin, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${formatoFechaTimeStamp(transaccion.fecha)}`, margin, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${cliente.nombreCompleto}`, margin, yPos);
  yPos += 6;
  doc.text(`DNI: ${cliente.dni}`, margin, yPos);
  yPos += 6;
  doc.text(`Teléfono: ${cliente.telefono}`, margin, yPos);
  if (cliente.correo) {
    yPos += 6;
    doc.text(`Email: ${cliente.correo}`, margin, yPos);
  }
  yPos += 15;

  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE DEL SERVICIO', margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.text(`Habitación: ${habitacion.numero}`, margin, yPos);
  yPos += 6;
  doc.text(`Tipo: ${tipoAlquiler === 'dia' ? 'Alquiler por Día' : 'Alquiler Mensual'}`, margin, yPos);
  yPos += 6;
  doc.text(`Fecha Entrada: ${formatoFecha展示(fechaEntrada)}`, margin, yPos);
  yPos += 6;
  doc.text(`Fecha Salida: ${formatoFecha展示(fechaSalida)}`, margin, yPos);
  yPos += 15;

  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTE', margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  if (tarifaOriginal && descuento && descuento > 0) {
    doc.setFontSize(10);
    doc.text(`Tarifa original: ${formatearMoneda(tarifaOriginal)}`, margin, yPos);
    yPos += 6;
    doc.text(`Descuento: -${formatearMoneda(descuento)}`, margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total: ${formatearMoneda(transaccion.monto)}`, margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  } else {
    doc.setFontSize(12);
    doc.text(`Total: ${formatearMoneda(transaccion.monto)}`, margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
  }

  doc.text(`Método de pago: ${transaccion.metodoPago.charAt(0).toUpperCase() + transaccion.metodoPago.slice(1)}`, margin, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text(`Concepto: ${transaccion.concepto}`, margin, yPos);
  yPos += 15;

  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(config.leyendaPieRecibo, pageWidth / 2, yPos, { align: 'center' });

  doc.save(`recibo_${transaccion.numeroRecibo}.pdf`);
};

export const generarReciboHTML = (datos: DatosRecibo): string => {
  const { config, cliente, habitacion, tipoAlquiler, transaccion, fechaEntrada, fechaSalida, tarifaOriginal, descuento } = datos;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #000; background: #fff; color: #000;">
      <h2 style="text-align: center; margin-bottom: 10px; color: #000;">${config.nombre}</h2>
      <p style="text-align: center; font-size: 12px; margin: 0; color: #000;">${config.direccion}</p>
      <p style="text-align: center; font-size: 12px; margin: 0; color: #000;">Tel: ${config.telefono}</p>
      <h3 style="text-align: center; margin: 15px 0; color: #000;">RECIBO DE PAGO</h3>
      <hr style="margin: 10px 0; border-color: #000;">
      <p style="color: #000;"><strong>N° Recibo:</strong> ${transaccion.numeroRecibo}</p>
      <p style="color: #000;"><strong>Fecha:</strong> ${formatoFechaTimeStamp(transaccion.fecha)}</p>
      <h4 style="margin: 10px 0 5px; color: #000;">DATOS DEL CLIENTE</h4>
      <p style="color: #000;"><strong>Nombre:</strong> ${cliente.nombreCompleto}</p>
      <p style="color: #000;"><strong>DNI:</strong> ${cliente.dni}</p>
      <p style="color: #000;"><strong>Teléfono:</strong> ${cliente.telefono}</p>
      ${cliente.correo ? `<p style="color: #000;"><strong>Email:</strong> ${cliente.correo}</p>` : ''}
      <h4 style="margin: 10px 0 5px; color: #000;">DETALLE</h4>
      <p style="color: #000;"><strong>Habitación:</strong> ${habitacion.numero}</p>
      <p style="color: #000;"><strong>Tipo:</strong> ${tipoAlquiler === 'dia' ? 'Alquiler por Día' : 'Alquiler Mensual'}</p>
      <p style="color: #000;"><strong>Entrada:</strong> ${formatoFecha展示(fechaEntrada)}</p>
      <p style="color: #000;"><strong>Salida:</strong> ${formatoFecha展示(fechaSalida)}</p>
      <h4 style="margin: 10px 0 5px; color: #000;">IMPORTE</h4>
      ${tarifaOriginal && descuento && descuento > 0 ? `
        <p style="color: #000;"><strong>Tarifa original:</strong> ${formatearMoneda(tarifaOriginal)}</p>
        <p style="color: #000;"><strong>Descuento:</strong> -${formatearMoneda(descuento)}</p>
        <p style="font-size: 18px; color: #000;"><strong>Total:</strong> ${formatearMoneda(transaccion.monto)}</p>
      ` : `
        <p style="font-size: 18px; color: #000;"><strong>Total:</strong> ${formatearMoneda(transaccion.monto)}</p>
      `}
      <p style="color: #000;"><strong>Método:</strong> ${transaccion.metodoPago.charAt(0).toUpperCase() + transaccion.metodoPago.slice(1)}</p>
      <p style="color: #000;"><strong>Concepto:</strong> ${transaccion.concepto}</p>
      <hr style="margin: 15px 0; border-color: #000;">
      <p style="text-align: center; font-style: italic; font-size: 12px; color: #000;">${config.leyendaPieRecibo}</p>
    </div>
  `;
};

export const imprimirRecibo = (datos: DatosRecibo): void => {
  const html = generarReciboHTML(datos);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
};