import { jsPDF } from 'jspdf';

export interface DeliveryNoteRow {
  code?: string;
  key: string;
  description: string;
  fabricCode: string;
  pieces: number;
  meters: number;
  weight: number | null;
}
export interface DeliveryNoteData {
  companyName: string;
  number: number;
  date: string;
  customerName: string;
  customerAddress: string;
  vat: string;
  destinationName: string;
  destinationAddress: string;
  reason: string;
  transport: string;
  freight: string;
  carrier: string;
  pickupDate: string;
  pickupTime: string;
  appearance: string;
  notes: string;
  rows: DeliveryNoteRow[];
}

export function createDeliveryNotePdf(data: DeliveryNoteData): Blob {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const number = (n: number, decimals = 2) =>
    n.toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const date = (s: string) => (s ? s.split('-').reverse().join('/') : '');
  const pages = Math.max(1, Math.ceil(data.rows.length / 13));
  const text = (s: string, x: number, y: number, width: number, size = 9, height = 7) => {
    let lines: string[];
    do {
      pdf.setFontSize(size);
      lines = pdf.splitTextToSize(s || '', width);
      if (lines.length * size * 0.405 <= height || size <= 4) break;
      size -= 0.5;
    } while (true);
    pdf.text(lines, x, y);
  };
  const field = (label: string, value: string, x: number, y: number, w: number, h: number) => {
    pdf.rect(x, y, w, h);
    text(label, x + 1, y + 3.5, w - 2, 7);
    text(value, x + 1, y + 8, w - 2, 9, h - 7);
  };
  for (let page = 0; page < pages; page++) {
    if (page) pdf.addPage();
    pdf.setLineWidth(0.2);
    pdf.setFont('times', 'bold');
    text(data.companyName.toLocaleUpperCase('it'), 69, 22, 125, 17);
    pdf.setFont('helvetica', 'normal');
    text('Via Milano, 11\n59013 MONTEMURLO (PO)', 12, 43, 65, 8, 10);
    text('Spett.', 12, 62, 93, 8);
    text('Luogo di destinazione', 105, 62, 93, 8);
    pdf.rect(12, 64, 93, 26);
    pdf.rect(105, 64, 93, 26);
    text(data.customerName + '\n' + data.customerAddress, 13, 69, 91, 9, 22);
    text(data.destinationName + '\n' + data.destinationAddress, 106, 69, 91, 9, 22);
    pdf.setFont('helvetica', 'bold');
    text('DOCUMENTO DI TRASPORTO (D.D.T)', 12, 97, 185, 13);
    pdf.setFont('helvetica', 'normal');
    field('Numero Doc.', String(data.number), 12, 100, 29, 12);
    field('Data Doc.', date(data.date), 41, 100, 31, 12);
    field('Partita I.V.A.', data.vat, 72, 100, 57, 12);
    field('Causale del trasporto', data.reason, 129, 100, 57, 12);
    field('Pag.', String(page + 1), 186, 100, 12, 12);
    const xs = [12, 123, 148, 162, 180, 198];
    ['Descrizione', 'Tela', 'Colli', 'Metri', 'Chili'].forEach((label, i) => {
      pdf.rect(xs[i], 112, xs[i + 1] - xs[i], 5);
      text(label, xs[i] + 1, 115.5, xs[i + 1] - xs[i] - 2, 8);
      pdf.rect(xs[i], 117, xs[i + 1] - xs[i], 108);
    });
    data.rows.slice(page * 13, (page + 1) * 13).forEach((row, i) => {
      const y = 122 + i * 7;
      text(row.description, 13, y, 108, 8);
      text(row.fabricCode, 124, y, 23, 8);
      text(String(row.pieces), 149, y, 12, 8);
      pdf.setFontSize(8);
      pdf.text(number(row.meters), 179, y, { align: 'right' });
      pdf.text(row.weight === null ? '' : number(row.weight, 1), 197, y, { align: 'right' });
    });
    field('Trasporto a cura del', data.transport, 12, 228, 40, 12);
    field('N. Colli', String(data.rows.reduce((n, r) => n + r.pieces, 0)), 52, 228, 28, 12);
    field('Porto', data.freight, 80, 228, 63, 12);
    field('Data Ritiro', date(data.pickupDate), 143, 228, 33, 12);
    field('Ora Ritiro', data.pickupTime, 176, 228, 22, 12);
    field('Vettore', data.carrier, 12, 240, 186, 17);
    field('Aspetto esteriore dei beni', data.appearance, 12, 257, 108, 11);
    field('Annotazioni / Variazioni', data.notes, 12, 268, 108, 17);
    field('Firma del conducente', '', 120, 257, 78, 14);
    field('Firma del destinatario', '', 120, 271, 78, 14);
  }
  return pdf.output('blob');
}
