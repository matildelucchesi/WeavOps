import { jsPDF } from 'jspdf';
import { InvoiceData, invoiceCustomerAddress, invoiceTotals, rowAmount } from './invoice-model';

export function createInvoicePdf(data: InvoiceData): Blob {
  const pdf = new jsPDF();
  const number = (value: number) => value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const date = (value: string) => value.split('-').reverse().join('/');
  // Every long field wraps, and every table row is paginated by its actual height.
  let y = 12;
  const text = (value: string, x: number, top: number, width: number, size = 8) => {
    pdf.setFontSize(size);
    const lines: string[] = pdf.splitTextToSize(value || ' ', width);
    pdf.text(lines, x, top);
    return lines.length * size * 0.353 + 2;
  };
  const page = () => { pdf.addPage(); y = 14; };
  const ensure = (height: number) => { if (y + height > 278) page(); };
  const block = (label: string, value: string) => {
    pdf.setFontSize(8);
    const lines: string[] = pdf.splitTextToSize(`${label}: ${value}`, 182);
    for (const line of lines) { ensure(5); pdf.text(line, 14, y); y += 4; }
    y += 2;
  };
  pdf.setFont('times', 'bold');
  y += text(data.issuer.name.toLocaleUpperCase('it'), 14, y + 3, 182, 15) + 5;
  pdf.setFont('helvetica', 'normal');
  const issuer = [data.issuer.address, data.issuer.vat && `P. IVA ${data.issuer.vat}`, data.issuer.email].filter(Boolean).join('\n');
  const issuerHeight = text(issuer, 14, y, 86, 10);
  const address = invoiceCustomerAddress(data.customer);
  text('Spett.', 110, y - 2, 86, 7);
  let customerY = y + 4;
  pdf.setFont('helvetica', 'bold');
  customerY += text(data.customer.name.toLocaleUpperCase('it'), 110, customerY, 84, 10);
  pdf.setFont('helvetica', 'normal');
  customerY += text(address.street.toLocaleUpperCase('it'), 110, customerY, 84, 9);
  const provinceHeight = text(address.province.toLocaleUpperCase('it'), 183, customerY, 10, 9);
  customerY += Math.max(provinceHeight, text(address.city.toLocaleUpperCase('it'), 110, customerY, 70, 9));
  customerY += text(address.country.toLocaleUpperCase('it'), 110, customerY, 84, 9);
  pdf.rect(108, y, 88, customerY - y);
  y += Math.max(issuerHeight, customerY - y) + 6;
  pdf.setFont('helvetica', 'bold');
  y += text(data.title, 14, y, 182, 12) + 3;
  pdf.setFont('helvetica', 'normal');
  const boxes = (fields: {label: string; value: string; width: number}[]) => {
    pdf.setFontSize(8);
    const wrapped = fields.map(field => pdf.splitTextToSize(field.value || ' ', field.width - 4) as string[]);
    const height = Math.max(13, Math.max(...wrapped.map(lines => lines.length)) * 3.5 + 7);
    ensure(height); let x = 13;
    fields.forEach((field, i) => {
      pdf.rect(x, y, field.width, height);
      text(field.label, x + 2, y + 3.5, field.width - 4, 7);
      pdf.setFontSize(8); pdf.text(wrapped[i], x + 2, y + 8);
      x += field.width;
    });
    y += height;
  };
  boxes([{label: 'Numero Doc.', value: String(data.number), width: 25}, {label: 'Data Doc.', value: date(data.date), width: 30},
    {label: 'Partita IVA', value: data.issuer.vat, width: 40}, {label: 'Pagamento', value: data.payment, width: 60}, {label: 'Codice fiscale', value: data.fiscalCode, width: 27}]);
  boxes([{label: 'Banca d’appoggio', value: data.bank, width: 182}]);
  y += 4;
  if (data.protocol) block('Protocollo / riferimento', data.protocol);
  const widths = [23, 58, 23, 24, 19, 27, 8];
  const labels = ['Articolo', 'Descrizione', 'Rif. / Tela', 'Quantità', 'Tariffa', 'Importo', 'C.I.'];
  const header = () => {
    ensure(10); let x = 13;
    widths.forEach((w, i) => { pdf.setFillColor(238, 238, 238); pdf.rect(x, y, w, 8, 'FD'); text(labels[i], x + 1, y + 4, w - 2, 7); x += w; });
    y += 8;
  };
  header();
  for (const row of data.rows) {
    const values = [row.article, row.description, row.reference, number(row.quantity), number(row.price), number(rowAmount(row)), row.vatCode || `${row.vatRate}%`];
    pdf.setFontSize(7);
    const lines = values.map((value, i) => pdf.splitTextToSize(value || ' ', widths[i] - 2) as string[]);
    const count = Math.max(...lines.map(value => value.length));
    // Split even an unusually long single description across pages.
    for (let offset = 0; offset < count;) {
      if (y + 8 > 278) { page(); header(); }
      const available = Math.max(1, Math.floor((278 - y - 3) / 3));
      const take = Math.min(count - offset, available);
      const height = Math.max(8, take * 3 + 3); let x = 13;
      widths.forEach((w, i) => {
        pdf.rect(x, y, w, height);
        pdf.setFontSize(7);
        const slice = lines[i].slice(offset, offset + take);
        if (slice.length) pdf.text(slice, x + 1, y + 4, { lineHeightFactor: 1.2 });
        x += w;
      });
      y += height; offset += take;
    }
  }
  if (y < 202) {
    let x = 13;
    widths.forEach(width => { pdf.rect(x, y, width, 202 - y); x += width; });
    y = 202;
  }
  y += 6;
  const totals = invoiceTotals(data);
  for (const group of totals.taxes) {
    boxes([{label: 'C.I.', value: group.code, width: 14}, {label: 'Descrizione', value: group.description, width: 69},
      {label: 'Imponibile', value: number(group.taxable), width: 35}, {label: 'Aliq. %', value: number(group.rate), width: 26}, {label: 'Imposta', value: number(group.tax), width: 38}]);
  }
  boxes([{label: 'Scadenza', value: date(data.dueDate), width: 83}, {label: 'Tot. imponibile', value: number(totals.taxable), width: 35},
    {label: 'Tot. imposta', value: number(totals.tax), width: 26}, {label: 'Totale documento', value: number(totals.total), width: 38}]);
  boxes([{label: 'Bollo', value: number(data.stamp), width: 83}, {label: 'Acconto', value: number(data.advance), width: 61},
    {label: 'Totale da pagare EUR', value: number(totals.payable), width: 38}]);
  y += 6;
  if (data.notes) block('Note', data.notes);
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i); pdf.setFontSize(7);
    pdf.text(`Fattura ${data.number} - ${date(data.date)} | Pag. ${i}/${pages}`, 14, 289);
  }
  return pdf.output('blob');
}
