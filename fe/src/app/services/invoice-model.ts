export interface InvoiceRow {
  fabricId?: string;
  article: string; description: string; reference: string;
  quantity: number; price: number; vatRate: number; vatCode: string;
  amount: number | null;
}
export interface InvoiceParty { name: string; address: string; vat: string; email: string; province?: string; country?: string; }
export function invoiceCustomerAddress(party: InvoiceParty) {
  const lines = party.address.split('\n');
  const city = lines[1] ?? '';
  const legacyProvince = city.match(/\s*\(([A-Za-z]{2})\)\s*$/);
  return {street: lines[0] ?? '', city: city.replace(/\s*\([A-Za-z]{2}\)\s*$/, ''),
    province: party.province ?? legacyProvince?.[1] ?? '', country: party.country ?? lines[2] ?? ''};
}
export interface InvoiceData {
  number: number; date: string; title: string;
  issuer: InvoiceParty; customer: InvoiceParty; customerId: string;
  bank: string; payment: string; fiscalCode: string; protocol: string;
  dueDate: string; notes: string; rows: InvoiceRow[];
  advance: number; stamp: number;
  taxOverrides: Record<string, { taxable: number | null; tax: number | null; description: string }>;
  totalOverride: number | null; payableOverride: number | null;
}
export const moneyRound = (value: number) => Math.round((value + Math.sign(value) * Number.EPSILON) * 100) / 100;
export const rowAmount = (row: InvoiceRow) => moneyRound(row.amount ?? row.quantity * row.price);
export function invoiceTotals(data: InvoiceData) {
  const groups = new Map<string, { key: string; code: string; rate: number; taxable: number; tax: number; description: string }>();
  for (const row of data.rows) {
    const key = `${row.vatRate}|${row.vatCode.trim()}`;
    const group = groups.get(key) ?? { key, code: row.vatCode.trim(), rate: row.vatRate, taxable: 0, tax: 0, description: '' };
    group.taxable = moneyRound(group.taxable + rowAmount(row));
    groups.set(key, group);
  }
  for (const group of groups.values()) {
    const override = data.taxOverrides[group.key];
    group.taxable = override?.taxable ?? group.taxable;
    group.tax = override?.tax ?? moneyRound(group.taxable * group.rate / 100);
    group.description = override?.description ?? '';
  }
  const taxes = [...groups.values()];
  const taxable = moneyRound(taxes.reduce((sum, group) => sum + group.taxable, 0));
  const tax = moneyRound(taxes.reduce((sum, group) => sum + group.tax, 0));
  const total = moneyRound(data.rows.reduce((sum, row) => sum + rowAmount(row), 0));
  const payable = data.payableOverride ?? moneyRound(total - data.advance);
  return { taxes, taxable, tax, total, payable };
}
export function newInvoice(): InvoiceData {
  const date = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Rome'}).format(new Date());
  const party = (): InvoiceParty => ({ name: '', address: '', vat: '', email: '' });
  return { number: 1, date, title: 'FATTURA LAVORAZIONE C/TERZI', issuer: party(), customer: party(), customerId: '',
    bank: '', payment: '', fiscalCode: '', protocol: '', dueDate: '', notes: '', rows: [],
    advance: 0, stamp: 0, taxOverrides: {}, totalOverride: null, payableOverride: null };
}
export function newInvoiceRow(): InvoiceRow {
  return { article: '', description: '', reference: '', quantity: 0, price: 0, vatRate: 22, vatCode: '', amount: null };
}
