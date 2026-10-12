import { ChangeDetectorRef, Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SelectFabricsDialog } from './select-fabrics-dialog';
import { forkJoin } from 'rxjs';
import { Customer, Destination, Item, Arrangement, Fabric, User } from '../../../api';
import { UserFacadeService } from '../../../services/user-facade.service';
import { FabricFacadeService } from '../../../services/fabric-facade.service';
import { deliveryNoteTotals } from '../../../services/delivery-note-totals';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { DestinationFacadeService } from '../../../services/destination-facade.service';
import { DeliveryNoteService, SavedDeliveryNote } from '../../../services/delivery-note.service';
import type { DeliveryNoteRow } from '../../../services/delivery-note-pdf';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { TableComponent, TableColumn, TableAction, TableActionClick } from '../../reusable-components/table-component/table-component';

registerLocaleData(localeIt, 'it');

@Component({
  selector: 'app-delivery-notes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TitlePageComponent, MatMenuModule, MatIconModule, TableComponent],
  templateUrl: './delivery-notes-page.html',
  styleUrl: './delivery-notes-page.scss',
})
export class DeliveryNotesPage implements OnInit, OnDestroy {
  readonly paperScale = signal(1);
  private paperObserver?: ResizeObserver;
  @ViewChild('paperWorkspace')
  set paperWorkspace(element: ElementRef<HTMLElement> | undefined) {
    this.paperObserver?.disconnect();
    if (!element) return;
    const updateScale = (width: number) => {
      if (width > 0) this.paperScale.set(width / (210 * 96 / 25.4));
    };
    updateScale(element.nativeElement.clientWidth);
    this.paperObserver = new ResizeObserver(entries => updateScale(entries[0].contentRect.width));
    this.paperObserver.observe(element.nativeElement);
  }
  ngOnDestroy() { this.paperObserver?.disconnect(); }
  private readonly dialog = inject(MatDialog);
  private readonly changeDetector = inject(ChangeDetectorRef);
  customerSearch = '';
  destinationSearch = '';
  get filteredCustomers() {
    const q = this.customerSearch.trim().toLocaleLowerCase('it');
    return this.customers.filter((c) =>
      `${c.name} ${c.city ?? ''}`.toLocaleLowerCase('it').includes(q),
    );
  }
  get filteredDestinations() {
    const q = this.destinationSearch.trim().toLocaleLowerCase('it');
    return this.availableDestinations.filter((d) =>
      `${d.name} ${d.city}`.toLocaleLowerCase('it').includes(q),
    );
  }
  get destination() {
    return this.availableDestinations.find((d) => d.id === this.destinationId);
  }
  get sheets() {
    const rows = this.selectedRows;
    return Array.from({ length: Math.max(1, Math.ceil(rows.length / 13)) }, (_, i) =>
      rows.slice(i * 13, (i + 1) * 13),
    );
  }
  get totalPieces() {
    return this.selectedRows.reduce((n, r) => n + r.pieces, 0);
  }
  chooseCustomer(id: string) {
    if (this.customerId !== id) {
      this.customerId = id;
      this.changeCustomer();
    }
  }
  addFabrics() {
    if (!this.customer || this.busy) return;
    this.dialog
      .open(SelectFabricsDialog, {
        width: '760px',
        panelClass: 'ddt-fabrics-dialog-panel',
        maxWidth: '95vw',
        data: { customerName: this.customer.name, rows: this.rows, assignedRows: this.assignedRows, selected: [...this.selected] },
      })
      .afterClosed()
      .subscribe((keys: string[] | undefined) => {
        if (keys) {
          const availableIds = new Set(this.rows.map(row => row.key));
          this.selected = new Set(keys.filter(key => availableIds.has(key)));
          this.changeDetector.markForCheck();
        }
      });
  }
  private readonly api = inject(DeliveryNoteService);
  private readonly itemsApi = inject(ItemFacadeService);
  private readonly customersApi = inject(CustomerFacadeService);
  private readonly arrangementsApi = inject(ArrangementFacadeService);
  private readonly destinationsApi = inject(DestinationFacadeService);
  private readonly fabricsApi = inject(FabricFacadeService);
  private readonly usersApi = inject(UserFacadeService);
  issuer: User | null = null;
  readonly documentColumns: TableColumn<SavedDeliveryNote>[] = [
    { header: 'Nome documento', value: document => `DDT ${document.number}/${document.year} · ${document.customerName}` },
    { header: 'Data', value: document => document.date.split('-').reverse().join('/') },
  ];
  readonly documentActions: TableAction<SavedDeliveryNote>[] = [
    { id: 'view', label: 'Visualizza', icon: 'visibility' },
    { id: 'download', label: 'Scarica', icon: 'download' },
    {
      id: 'delete', label: 'Elimina', icon: 'delete',
      deleteItem: document => this.api.delete(document._id),
      deleteItemName: document => `DDT ${document.number}/${document.year}`,
      deleteDialogMessage: 'Vuoi eliminare questo DDT? Le Tele associate saranno nuovamente selezionabili.',
    },
  ];
  onDocumentAction(event: TableActionClick<SavedDeliveryNote>): void {
    if (event.action.id === 'view') {
      this.viewDocument(event.row);
    } else if (event.action.id === 'download') {
      this.download(event.row);
    } else if (event.action.id === 'delete') {
      const releasedIds = new Set(event.row.fabricIds ?? []);
      this.fabrics = this.fabrics.map(fabric => releasedIds.has(fabric.id!) && fabric.status === 'DELIVERED'
        ? { ...fabric, status: 'AVAILABLE' } : fabric);
      this.saved = this.saved.filter(document => document._id !== event.row._id);
      this.changeDetector.markForCheck();
    }
  }
  viewDocument(document: SavedDeliveryNote): void {
    this.api.view(document._id, message => {
      this.error = message;
      this.changeDetector.markForCheck();
    });
  }
  fabrics: Fabric[] = [];
  customers: Customer[] = [];
  items: Item[] = [];
  arrangements: Arrangement[] = [];
  destinations: Destination[] = [];
  saved: SavedDeliveryNote[] = [];
  selected = new Set<string>();
  fabricEditsEnabled = false;
  private documentRowEdits: Record<string, Partial<Pick<DeliveryNoteRow, 'description' | 'fabricCode' | 'pieces' | 'meters' | 'weight'>>> = {};
  editing = false;
  loading = true;
  busy = false;
  error = '';
  customerId = '';
  destinationId = '';
  number = 1;
  date = this.today();
  reason = '';
  transport = '';
  freight = '';
  carrier = '';
  pickupDate = '';
  pickupTime = '';
  appearance = '';
  notes = '';
  ngOnInit() {
    forkJoin({
      issuer: this.usersApi.getCurrent(),
      customers: this.customersApi.getAll(),
      items: this.itemsApi.getAll(),
      arrangements: this.arrangementsApi.getAll(),
      destinations: this.destinationsApi.getAll(),
      saved: this.api.list(),
      fabrics: this.fabricsApi.getAll(),
    }).subscribe({
      next: (data) => {
        Object.assign(this, data);
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'Impossibile caricare i dati. Riprova aggiornando la pagina.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }
  get customer() {
    return this.customers.find((c) => c.id === this.customerId);
  }
  get availableDestinations() {
    return this.destinations.filter((d) => this.customer?.destinationIds?.includes(d.id!));
  }
  private get customerFabricRows(): DeliveryNoteRow[] {
    return this.items
      .filter((item) => item.customerId === this.customerId)
      .flatMap((item) => {
        const arrangement = this.arrangements.find((a) => a.id === item.arrangementId);
        return this.fabrics
          .filter(
            (f) =>
              f.itemId === item.id &&
              (f.status === 'AVAILABLE' || f.status === 'DELIVERED') &&
              f.code &&
              (f.piecesCount ?? 0) > 0,
          )
          .map((f) => ({
            key: f.id!,
            description: arrangement?.itemName ?? '',
            fabricCode: [f.code, f.certificationValue].filter(Boolean).join(' '),
            code: f.code,
            ...deliveryNoteTotals(item, f),
          }));
      });
  }
  get rows(): DeliveryNoteRow[] {
    const usedFabricIds = new Set(this.saved.flatMap(document => document.fabricIds ?? []));
    const availableIds = new Set(this.fabrics.filter(fabric => fabric.status === 'AVAILABLE').map(fabric => fabric.id));
    return this.customerFabricRows.filter(row => availableIds.has(row.key) && !usedFabricIds.has(row.key));
  }
  get assignedRows() {
    const documentsByFabric = new Map(this.saved.flatMap(document =>
      (document.fabricIds ?? []).map(id => [id, document] as const)));
    return this.customerFabricRows.flatMap(row => {
      const deliveryNote = documentsByFabric.get(row.key);
      return deliveryNote ? [{ ...row, deliveryNote }] : [];
    });
  }
  get selectedRows() {
    return this.rows.filter((r) => this.selected.has(r.key))
      .map(row => ({ ...row, ...this.documentRowEdits[row.key] }));
  }
  updateDocumentRow(key: string, changes: Partial<Pick<DeliveryNoteRow, 'description' | 'fabricCode' | 'pieces' | 'meters' | 'weight'>>): void {
    if (!this.fabricEditsEnabled || this.busy || !this.selected.has(key) || !this.rows.some(row => row.key === key)) return;
    this.documentRowEdits = { ...this.documentRowEdits, [key]: { ...this.documentRowEdits[key], ...changes } };
  }
  get canGenerate() {
    return (
      !!this.customer &&
      !!this.destination &&
      this.number > 0 &&
      Number.isInteger(this.number) &&
      !!this.date &&
      !!this.reason.trim() &&
      this.selectedRows.length > 0 &&
      this.selectedRows.every(
        (r) => !!r.description.trim() && !!r.fabricCode.trim()
          && Number.isInteger(r.pieces) && r.pieces > 0
          && r.weight !== null && Number.isFinite(r.weight) && r.weight >= 0
          && Number.isFinite(r.meters) && r.meters > 0,
      )
    );
  }
  start() {
    if (this.loading || this.busy || !this.customers.length) return;
    this.busy = true;
    this.error = '';
    this.api.reserveNumber().subscribe({
      next: (result) => {
        this.number = result.number;
        this.date = this.today();
        this.selected.clear();
        this.documentRowEdits = {};
        this.fabricEditsEnabled = false;
        this.customerId = '';
        this.destinationId = '';
        this.customerSearch = '';
        this.destinationSearch = '';
        this.reason = '';
        this.transport = '';
        this.freight = '';
        this.carrier = '';
        this.pickupDate = '';
        this.pickupTime = '';
        this.appearance = '';
        this.notes = '';
        this.editing = true;
        this.busy = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'Impossibile assegnare il numero DDT.';
        this.busy = false;
        this.changeDetector.markForCheck();
      },
    });
  }
  changeCustomer() {
    this.selected.clear();
    this.documentRowEdits = {};
    this.fabricEditsEnabled = false;
    this.destinationId = '';
  }
  toggle(key: string, checked: boolean) {
    if (checked) this.selected.add(key);
    else this.selected.delete(key);
  }
  address(c: Customer | Destination) {
    return `${c.street ?? ''} ${c.streetNumber ?? ''}\n${c.postalCode ?? ''} ${c.city ?? ''} ${c.provinceCode ?? ''}`.trim();
  }
  async generate(preview: boolean) {
    if (!this.canGenerate || this.busy) return;
    this.busy = true;
    try {
      const { createDeliveryNotePdf } = await import('../../../services/delivery-note-pdf');
      const customer = this.customer!;
      const destination = this.destination!;
      const pdf = createDeliveryNotePdf({
        number: this.number,
        date: this.date,
        companyName: this.issuer?.companyName ?? '',
        customerName: customer.name,
        customerAddress: this.address(customer),
        vat: this.issuer?.vatNumber ?? '',
        destinationName: destination.name,
        destinationAddress: this.address(destination),
        reason: this.reason,
        transport: this.transport,
        freight: this.freight,
        carrier: this.carrier,
        pickupDate: this.pickupDate,
        pickupTime: this.pickupTime,
        appearance: this.appearance,
        notes: this.notes,
        rows: this.selectedRows,
      });
      if (preview) {
        this.open(pdf);
        this.busy = false;
        this.changeDetector.markForCheck();
        return;
      }
      this.busy = true;
      this.error = '';
      this.api.save(this.number, this.date, customer.name, pdf, this.selectedRows.map(row => row.key)).subscribe({
        next: (document) => {
          const deliveredIds = new Set(document.fabricIds ?? []);
          this.fabrics = this.fabrics.map(fabric => deliveredIds.has(fabric.id!)
            ? { ...fabric, status: 'DELIVERED' } : fabric);
          this.saved = [document, ...this.saved];
          this.editing = false;
          this.busy = false;
          this.open(pdf);
          this.changeDetector.markForCheck();
        },
        error: (error) => {
          this.error =
            error.status === 409
              ? 'Numero DDT già presente oppure una delle Tele è già inserita in un altro DDT. Aggiorna la pagina e riprova.'
              : 'Salvataggio del DDT non riuscito. Riprova.';
          this.busy = false;
          this.changeDetector.markForCheck();
        },
      });
    } catch {
      this.error = 'Impossibile generare il PDF. Riprova.';
      this.busy = false;
      this.changeDetector.markForCheck();
    }
  }
  download(document: SavedDeliveryNote) {
    this.api
      .download(document._id)
      .subscribe({
        next: (pdf) => this.open(pdf, `ddt-${document.year}-${document.number}.pdf`),
        error: () => {
          this.error = 'Impossibile scaricare il PDF.';
          this.changeDetector.markForCheck();
        },
      });
  }
  private open(pdf: Blob, filename = `ddt-${this.date}-${this.number}.pdf`) {
    const url = URL.createObjectURL(pdf);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  private today() {
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
  }
}

