import { describe, expect, it } from 'vitest';
import { invoiceTotals, newInvoice, newInvoiceRow, rowAmount } from './invoice-model';

describe('Calcoli fattura', () => {
  it('arrotonda ogni riga prima di sommare e separa aliquote e codici IVA', () => {
    const data = newInvoice();
    data.rows = [
      {...newInvoiceRow(), quantity: 3, price: 0.335},
      {...newInvoiceRow(), quantity: 2, price: 10, vatRate: 10},
      {...newInvoiceRow(), quantity: 1, price: 50, vatRate: 0, vatCode: 'N6.9'},
    ];
    expect(rowAmount(data.rows[0])).toBe(1.01);
    const totals = invoiceTotals(data);
    expect(totals.taxable).toBe(71.01);
    expect(totals.tax).toBe(2.22);
    expect(totals.total).toBe(71.01);
    expect(totals.taxes).toHaveLength(3);
  });
  it('somma gli importi anche se zero senza aggiungere IVA, bollo o rettifiche', () => {
    const data = newInvoice();
    data.rows[0] = {...newInvoiceRow(), quantity: 10, price: 4, amount: 0};
    data.stamp = 2; data.advance = 1;
    expect(invoiceTotals(data).payable).toBe(-1);
    data.taxOverrides['22|'] = {taxable: 100, tax: 0, description: 'Personalizzato'};
    expect(invoiceTotals(data).total).toBe(0);
    data.totalOverride = 80; data.payableOverride = 0;
    expect(invoiceTotals(data).total).toBe(0);
    expect(invoiceTotals(data).payable).toBe(0);
  });
  it('ignora rettifiche di gruppi IVA rimossi', () => {
    const data = newInvoice();
    data.taxOverrides['10|'] = {taxable: 1000, tax: 100, description: ''};
    expect(invoiceTotals(data).total).toBe(0);
  });
  it('aggiorna il totale dalla somma di importi automatici e manuali', () => {
    const data = newInvoice();
    data.rows = [{...newInvoiceRow(), quantity: 3, price: 10}, {...newInvoiceRow(), amount: 12.45}];
    expect(invoiceTotals(data).total).toBe(42.45);
    data.rows[1].amount = 7.25;
    expect(invoiceTotals(data).total).toBe(37.25);
    data.rows.splice(0, 1);
    expect(invoiceTotals(data).total).toBe(7.25);
  });
});
