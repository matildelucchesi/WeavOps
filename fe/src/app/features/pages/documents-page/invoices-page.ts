import { ChangeDetectorRef, Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { forkJoin } from 'rxjs';
import { SelectFabricsDialog, AssignedFabricRow } from './select-fabrics-dialog';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { FabricFacadeService } from '../../../services/fabric-facade.service';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { DeliveryNoteService } from '../../../services/delivery-note.service';
import { DeliveryNoteRow } from '../../../services/delivery-note-pdf';
import { deliveryNoteTotals } from '../../../services/delivery-note-totals';
import { normalizeCustomerCountry } from '../../../services/customer-country';
import { Customer, User } from '../../../api';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { UserFacadeService } from '../../../services/user-facade.service';
import { InvoiceService, SavedInvoice } from '../../../services/invoice.service';
import { InvoiceData, InvoiceParty, invoiceCustomerAddress, invoiceTotals, newInvoice, newInvoiceRow, rowAmount } from '../../../services/invoice-model';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { TableComponent, TableColumn, TableAction, TableActionClick } from '../../reusable-components/table-component/table-component';

registerLocaleData(localeIt, 'it');

@Component({
  selector: 'app-invoices-page', standalone: true,
  imports: [CommonModule, FormsModule, TitlePageComponent, TableComponent, MatMenuModule, MatIconModule, MatTooltipModule],
  templateUrl: './invoices-page.html', styleUrl: './invoices-page.scss',
})
export class InvoicesPage implements OnInit, OnDestroy {
  readonly paperScale = signal(1);
  private paperObserver?: ResizeObserver;
  @ViewChild('paperWorkspace') set paperWorkspace(element: ElementRef<HTMLElement> | undefined) {
    this.paperObserver?.disconnect();
    if (!element) return;
    const update = (width: number) => { if (width > 0) this.paperScale.set(width / (210 * 96 / 25.4)); };
    update(element.nativeElement.clientWidth);
    if (typeof ResizeObserver !== 'undefined') {
      this.paperObserver = new ResizeObserver(entries => update(entries[0].contentRect.width));
      this.paperObserver.observe(element.nativeElement);
    }
  }
  ngOnDestroy() { this.paperObserver?.disconnect(); }
  get sheets() {
    return Array.from({length: Math.max(1, Math.ceil((this.draft.rows.length + 1) / 13))}, (_, page) => this.draft.rows.slice(page * 13, (page + 1) * 13));
  }
  blankRows(count: number) { return Array.from({length: Math.max(0, 13 - count)}, (_, i) => i); }
  private readonly api = inject(InvoiceService);
  private readonly customersApi = inject(CustomerFacadeService);
  private readonly usersApi = inject(UserFacadeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly itemsApi = inject(ItemFacadeService);
  private readonly fabricsApi = inject(FabricFacadeService);
  private readonly arrangementsApi = inject(ArrangementFacadeService);
  private readonly deliveryNotesApi = inject(DeliveryNoteService);
  fabricsLoading = false;
  customers: Customer[] = []; issuer: User | null = null; saved: SavedInvoice[] = [];
  customerSearch = '';
  get filteredCustomers() {
    const query = this.customerSearch.trim().toLocaleLowerCase('it');
    return this.customers.filter(customer => `${customer.name} ${customer.city ?? ''}`.toLocaleLowerCase('it').includes(query));
  }
  draft = newInvoice(); editing = false; loading = true; busy = false; numberEdited = false; editingId?: string;
  private errorValue = '';
  get error() { return this.errorValue; }
  set error(value: string) {
    this.errorValue = value;
    if (value) this.snackBar.open(value, 'Chiudi', {duration: 6500});
  }
  private messageValue = '';
  get message() { return this.messageValue; }
  set message(value: string) {
    this.messageValue = value;
    if (value) this.snackBar.open(value, 'Chiudi', {duration: 3500});
  }
  readonly partyFields: {key: keyof InvoiceParty; label: string}[] = [
    {key: 'name', label: 'Ragione sociale'}, {key: 'address', label: 'Indirizzo'}, {key: 'vat', label: 'Partita IVA'}, {key: 'email', label: 'Email'},
  ];
  readonly columns: TableColumn<SavedInvoice>[] = [
    {header: 'Nome documento', value: row => `Fattura ${row.number}/${row.year} · ${row.customerName}`},
    {header: 'Data', value: row => row.date.split('-').reverse().join('/')},
    {header: 'Totale da pagare', value: row => this.money(invoiceTotals(row.data).payable)},
  ];
  readonly actions: TableAction<SavedInvoice>[] = [
    {id: 'view', label: 'Visualizza', icon: 'visibility'},
    {id: 'edit', label: 'Modifica', icon: 'edit'},
    {id: 'download', label: 'Scarica', icon: 'download'},
    {id: 'delete', label: 'Elimina', icon: 'delete', deleteItem: row => this.api.delete(row._id), deleteItemName: row => `Fattura ${row.number}/${row.year}`},
  ];
  ngOnInit() {
    this.editing = this.route.snapshot.data['editor'] === true;
    if (this.editing) this.prepareEditor();
    else this.load();
  }
  load() {
    this.loading = true; this.error = '';
    this.api.list().subscribe({
      next: saved => { this.saved = saved; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.error = 'Impossibile caricare le fatture. Riprova.'; this.loading = false; this.cdr.markForCheck(); },
    });
  }
  start() {
    if (!this.busy) void this.router.navigate(['/documenti/fatture/nuova']);
  }
  back() { if (!this.busy) void this.router.navigate(['/documenti/fatture']); }
  private prepareEditor() {
    // Navigation and manual compilation never depend on an optional API request.
    this.loading = false;
    this.editingId = this.route.snapshot.paramMap.get('id') ?? undefined;
    this.customersApi.getAll().subscribe({
      next: customers => { this.customers = customers; this.cdr.markForCheck(); },
      error: () => { this.error = 'Clienti non disponibili. Ricarica la pagina per selezionare il cliente.'; },
    });
    if (this.editingId) {
      this.busy = true;
      this.api.get(this.editingId).subscribe({
        next: invoice => { this.draft = structuredClone(invoice.data); this.busy = false; this.cdr.markForCheck(); },
        error: () => { this.busy = false; this.error = 'Fattura non disponibile. Riprova dall’elenco.'; this.back(); },
      });
      return;
    }
    this.usersApi.getCurrent().subscribe({
      next: issuer => {
        this.issuer = issuer;
        // Preserve values entered while the profile was loading.
        this.draft.issuer.name ||= issuer.companyName ?? '';
        this.draft.issuer.vat ||= issuer.vatNumber ?? '';
        this.draft.issuer.email ||= issuer.email ?? '';
        this.draft.fiscalCode ||= issuer.fiscalCode ?? '';
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Dati azienda non disponibili. Puoi inserirli manualmente.'; },
    });
    const initialNumber = this.draft.number;
    this.api.nextNumber().subscribe({
      next: result => { if (!this.numberEdited && this.draft.number === initialNumber) this.draft.number = result.number; this.cdr.markForCheck(); },
      error: () => { this.error = 'Numero automatico non disponibile. Inserisci il numero fattura manualmente.'; this.cdr.markForCheck(); },
    });
  }
  chooseCustomer(id?: string) {
    if (id !== undefined) this.draft.customerId = id;
    const customer = this.customers.find(value => value.id === this.draft.customerId);
    if (!customer) return;
    const street = [customer.street, customer.streetNumber].filter(Boolean).join(' ');
    const city = [customer.postalCode, customer.city].filter(Boolean).join(' ');
    this.draft.customer = {name: customer.name, address: [street, city].join('\n'), province: customer.provinceCode ?? '', country: normalizeCustomerCountry(customer.country), vat: customer.vatNumber, email: customer.email};
  }
  get customerStreet() { return invoiceCustomerAddress(this.draft.customer).street; }
  set customerStreet(value: string) {
    const address = invoiceCustomerAddress(this.draft.customer);
    this.draft.customer.province ??= address.province;
    this.draft.customer.country ??= address.country;
    this.draft.customer.address = `${value}\n${address.city}`;
  }
  get customerCity() { return invoiceCustomerAddress(this.draft.customer).city; }
  set customerCity(value: string) {
    this.draft.customer.province ??= invoiceCustomerAddress(this.draft.customer).province;
    this.draft.customer.country ??= invoiceCustomerAddress(this.draft.customer).country;
    this.draft.customer.address = `${this.customerStreet}\n${value}`;
  }
  get customerProvince() { return invoiceCustomerAddress(this.draft.customer).province; }
  set customerProvince(value: string) { this.draft.customer.province = value; }
  get customerCountry() { return invoiceCustomerAddress(this.draft.customer).country; }
  set customerCountry(value: string) { this.draft.customer.country = value; }
  get totals() { return invoiceTotals(this.draft); }
  rowAmount = rowAmount;
  money(value: number) { return value.toLocaleString('it-IT', {style: 'currency', currency: 'EUR'}); }
  addFabrics() {
    if (this.busy || this.fabricsLoading) return;
    const customerId = this.draft.customerId;
    const customer = this.customers.find(value => value.id === customerId);
    if (!customer) { this.error = 'Seleziona un cliente nel riquadro Spett. per aggiungere le tele.'; return; }
    this.fabricsLoading = true;
    forkJoin({items: this.itemsApi.getAll(), fabrics: this.fabricsApi.getAll(), arrangements: this.arrangementsApi.getAll(), documents: this.deliveryNotesApi.list()}).subscribe({
      next: data => {
        this.fabricsLoading = false; this.cdr.markForCheck();
        if (this.draft.customerId !== customerId) return;
        const documentsByFabric = new Map(data.documents.flatMap(document => (document.fabricIds ?? []).map(id => [id, document] as const)));
        const rows: DeliveryNoteRow[] = data.items.filter(item => item.customerId === customerId).flatMap(item => {
          const arrangement = data.arrangements.find(value => value.id === item.arrangementId);
          return data.fabrics.filter(fabric => fabric.itemId === item.id && fabric.id && fabric.code && (fabric.piecesCount ?? 0) > 0).map(fabric => ({
            key: fabric.id!, code: fabric.code, description: arrangement?.itemName ?? '',
            fabricCode: [fabric.code, fabric.certificationValue].filter(Boolean).join(' '),
            ...deliveryNoteTotals(item, fabric),
          }));
        });
        const assignedRows: AssignedFabricRow[] = rows.flatMap(row => {
          const deliveryNote = documentsByFabric.get(row.key);
          return deliveryNote ? [{...row, deliveryNote}] : [];
        });
        this.dialog.open(SelectFabricsDialog, {
          width: '760px', maxWidth: '95vw', panelClass: 'ddt-fabrics-dialog-panel',
          data: {customerName: this.draft.customer.name, rows: rows.filter(row => !documentsByFabric.has(row.key)), assignedRows,
            selected: this.draft.rows.flatMap(row => row.fabricId ? [row.fabricId] : []), allowAssignedSelection: true},
        }).afterClosed().subscribe((keys: string[] | undefined) => {
          if (!keys || this.draft.customerId !== customerId) return;
          const eligible = new Map(rows.map(row => [row.key, row]));
          const selected = new Set(keys.filter(key => eligible.has(key)));
          const kept = this.draft.rows.filter(row => !row.fabricId || !eligible.has(row.fabricId) || selected.has(row.fabricId));
          const existing = new Set(kept.flatMap(row => row.fabricId ? [row.fabricId] : []));
          for (const key of selected) {
            if (existing.has(key)) continue;
            const source = eligible.get(key)!;
            const fabric = data.fabrics.find(value => value.id === key)!;
            // TODO: configure automatic Tot. Colpi/1.000 from the textile data.
            // Zero requires an explicit manual quantity before saving an imported fabric.
            kept.push({...newInvoiceRow(), fabricId: key, article: source.description,
              description: [source.description, fabric.certificationValue].filter(Boolean).join(' '), reference: source.code ?? '', quantity: 0});
            existing.add(key);
          }
          this.draft.rows = kept;
          this.cdr.markForCheck();
        });
      },
      error: () => { this.fabricsLoading = false; this.error = 'Impossibile caricare le tele. Riprova.'; this.cdr.markForCheck(); },
    });
  }
  get hasFabricRows() { return this.draft.rows.some(row => !!row.fabricId); }
  addRow() { this.draft.rows.push(newInvoiceRow()); }
  numericKey(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.metaKey && ['e', 'E', '+'].includes(event.key)) event.preventDefault();
  }
  numericPaste(event: ClipboardEvent) {
    if (!/^-?\d*(?:[.,]\d*)?$/.test(event.clipboardData?.getData('text').trim() ?? '')) event.preventDefault();
  }
  removeRow(index: number) { this.draft.rows.splice(index, 1); }
  taxOverride(key: string) {
    return this.draft.taxOverrides[key] ??= {taxable: null, tax: null, description: ''};
  }
  resetCalculations() {
    this.draft.rows.forEach(row => row.amount = null);
    this.draft.taxOverrides = {}; this.draft.totalOverride = null; this.draft.payableOverride = null;
  }
  validation(): string {
    const d = this.draft;
    if (!Number.isSafeInteger(d.number) || d.number < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return 'Inserisci numero e data validi.';
    if (!d.issuer.name.trim() || !d.customer.name.trim()) return 'Inserisci la ragione sociale di azienda e cliente.';
    if (!d.rows.length || d.rows.some(row => !row.description.trim())) return 'Inserisci almeno una riga e completa tutte le descrizioni.';
    if (d.rows.length > 1000) return 'Una fattura può contenere al massimo 1000 righe.';
    if (d.rows.some(row => row.fabricId && (!Number.isFinite(row.quantity) || row.quantity <= 0))) return 'Inserisci manualmente la quantità (Tot. Colpi/1.000) delle tele selezionate.';
    if (d.rows.some(row => ![row.quantity, row.price, row.vatRate, rowAmount(row)].every(Number.isFinite) || row.quantity < 0 || row.price < 0 || row.vatRate < 0 || row.vatRate > 100)) return 'Controlla quantità, tariffe e aliquote IVA (da 0 a 100).';
    if (![d.advance, d.stamp, this.totals.total, this.totals.payable, ...this.totals.taxes.flatMap(group => [group.taxable, group.tax])].every(Number.isFinite)) return 'Controlla gli importi del riepilogo.';
    return '';
  }
  async save() {
    if (this.busy) return;
    this.error = this.validation(); if (this.error) return;
    this.busy = true;
    try {
      const {createInvoicePdf} = await import('../../../services/invoice-pdf');
      const snapshot: InvoiceData = structuredClone(this.draft);
      this.api.save(snapshot, createInvoicePdf(snapshot), this.editingId).subscribe({
        next: saved => {
          this.saved = [saved, ...this.saved.filter(row => row._id !== saved._id)];
          this.busy = false; this.message = 'Fattura salvata.'; this.back();
        },
        error: error => { this.error = error.status === 409 ? 'Numero fattura già utilizzato per questo anno. Modifica il numero e riprova.' : 'Salvataggio non riuscito. I dati inseriti sono ancora disponibili.'; this.busy = false; this.cdr.markForCheck(); },
      });
    } catch { this.error = 'Impossibile generare il PDF. Riprova.'; this.busy = false; this.cdr.markForCheck(); }
  }
  async preview() {
    if (this.busy) return;
    this.error = this.validation(); if (this.error) return;
    const preview = window.open('', '_blank');
    if (!preview) { this.error = 'Consenti l’apertura delle finestre per visualizzare il PDF.'; return; }
    preview.opener = null;
    try {
      const {createInvoicePdf} = await import('../../../services/invoice-pdf');
      this.openBlob(createInvoicePdf(this.draft), preview);
    } catch { preview.close(); this.error = 'Impossibile generare il PDF.'; this.cdr.markForCheck(); }
  }
  onAction(event: TableActionClick<SavedInvoice>) {
    this.error = ''; this.message = '';
    const row = event.row;
    if (event.action.id === 'delete') { this.saved = this.saved.filter(value => value._id !== row._id); return; }
    if (event.action.id === 'edit') { void this.router.navigate(['/documenti/fatture', row._id, 'modifica']); return; }
    const preview = event.action.id === 'view' ? window.open('', '_blank') : null;
    if (event.action.id === 'view' && !preview) { this.error = 'Consenti l’apertura delle finestre per visualizzare il PDF.'; return; }
    if (preview) preview.opener = null;
    this.api.download(row._id).subscribe({
      next: blob => {
        if (preview) this.openBlob(blob, preview);
        else {
          const url = URL.createObjectURL(blob); const link = document.createElement('a');
          link.href = url; link.download = `fattura-${row.year}-${row.number}.pdf`; link.click();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        }
      },
      error: () => { preview?.close(); this.error = 'Impossibile scaricare il PDF.'; this.cdr.markForCheck(); },
    });
  }
  private openBlob(blob: Blob, preview: Window) {
    const url = URL.createObjectURL(blob); preview.location.replace(url);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
