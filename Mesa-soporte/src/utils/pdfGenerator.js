import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarReporteTecnicosPDF = (tecnicos, filtroAplicado = '') => {
  if (!tecnicos || tecnicos.length === 0) {
    alert('No hay registros de técnicos disponibles para generar el reporte PDF.');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const fechaActual = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Encabezado Institucional
  doc.setFillColor(24, 43, 73);
  doc.rect(0, 0, 216, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('OFICINA DE TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Reporte Oficial de Personal Técnico de Soporte', 14, 20);

  // Metadatos
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9.5);
  doc.text(`Fecha de generación: ${fechaActual}`, 14, 36);
  doc.text(`Total de técnicos listados: ${tecnicos.length}`, 14, 41);

  if (filtroAplicado.trim() !== '') {
    doc.text(`Filtro aplicado: "${filtroAplicado}"`, 14, 46);
  }

  // Datos de la tabla
  const columnas = [
    'ID',
    'Primer Nombre',
    'Segundo Nombre',
    'Primer Apellido',
    'Segundo Apellido',
    'Correo Electrónico'
  ];

  const filas = tecnicos.map((t) => [
    t.id,
    t.nombre1 || '',
    t.nombre2 || '-',
    t.apellido1 || '',
    t.apellido2 || '-',
    t.correo || ''
  ]);

  autoTable(doc, {
    startY: filtroAplicado.trim() !== '' ? 52 : 47,
    head: [columnas],
    body: filas,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [33, 37, 41],
      lineColor: [209, 213, 219],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [24, 43, 73],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250]
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 54 }
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Documento generado automáticamente por el Sistema TIC — Página ${data.pageNumber} de ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }
  });

  const nombreArchivo = `Reporte_Tecnicos_TIC_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(nombreArchivo);
};