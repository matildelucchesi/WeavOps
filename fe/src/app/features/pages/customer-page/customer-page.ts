import { CompanyCard } from '../../reusable-components/company-card/company-card';
import { CardPagination } from '../../reusable-components/company-card/card-pagination';
import { AddButtonComponent } from '../../reusable-components/button/add-button-component/add-button-component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogDelete } from '../../reusable-components/dialog/dialog-delete/dialog-delete';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCustomerDestinations } from '../../reusable-components/dialog/dialog-customer-destinations/dialog-customer-destinations';
import { DialogInformativeComponent } from '../../reusable-components/dialog/dialog-informative-component/dialog-informative-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { CustomerTableService } from '../../../table/table-service/customer-table.service';
import { CustomerTableRow } from '../../../table/table-row-interface/customer-table-row';
import { Router } from '@angular/router';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import {
  TableComponent,
  type TableAction,
  type TableActionClick,
  type TableAddButtonConfig,
  type TableBulkActionClick,
  type TableColumn,
  type TableFilterButtonConfig,
} from '../../reusable-components/table-component/table-component';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import type { FilterValues } from '../../reusable-components/button/filter-button-component/filter-button-component';

@Component({
  selector: 'app-customer-page',
  imports: [
    TitlePageComponent,
    CompanyCard, CardPagination, AddButtonComponent, MatIconModule, MatTooltipModule,
  ],
  templateUrl: './customer-page.html',
  styleUrl: './customer-page.scss',
  standalone: true,
})
export class CustomerPage implements OnInit {
  private readonly dialog = inject(MatDialog);

  public openDestinations(row: CustomerTableRow): void {
    if (!row.customer.id) return;
    this.dialog.open(DialogCustomerDestinations, {data: row.customer, width: '720px', maxWidth: 'calc(100vw - 32px)'})
      .afterClosed().subscribe(saved => { if (saved) { this.loadCustomerRows(); } });
  }

  private readonly customerTableService = inject(CustomerTableService);
  private readonly customerService = inject(CustomerFacadeService);
  private readonly navigationService = inject(Router);

  public columns: TableColumn<CustomerTableRow>[] = [
    { header: 'Nome', field: 'name' },
    { header: 'Partita IVA', field: 'vatNumber' },
    { header: 'Email', field: 'email' },
    { header: 'Destinazioni', value: row => new Set(row.customer.destinationIds ?? []).size,
      cellAction: { icon: 'info', label: 'Visualizza e modifica destinazioni', visible: row => (row.customer.destinationIds?.length ?? 0) > 0, onClick: row => this.openDestinations(row) } },
    { header: 'Referente', field: 'referent' },
    { header: 'Telefono', field: 'phoneNumber' },
  ];
  public readonly rows = signal<CustomerTableRow[]>([]);
  public readonly currentPage = signal(1);
  public readonly pageSize = signal(10);
  public changePageSize(size: number): void { this.pageSize.set(size); this.currentPage.set(1); }
  public get pagedRows(): CustomerTableRow[] { return this.rows().slice((this.currentPage() - 1) * this.pageSize(), this.currentPage() * this.pageSize()); }
  public readonly loading = signal(true);
  public readonly loadError = signal(false);
  public activeFilters: FilterValues = {};
  public searchTerm = '';
  public search(value: string): void { this.searchTerm = value; this.onFilterSelected({_search: value}); }
  public get hasFilters(): boolean { return Object.values(this.activeFilters).some(value => value.trim()); }
  public addCustomer(): void { this.navigationService.navigate(['/aggiungi-cliente']); }
  public cardAction(action: TableAction<CustomerTableRow>, row: CustomerTableRow): void {
    if (action.id === 'delete') {
      this.dialog.open(DialogDelete, {data: {item: row, itemName: row.name, deleteItem: (item: CustomerTableRow) => this.deleteCustomer(item), successMessage: 'Cliente eliminato', errorMessage: 'Impossibile eliminare il cliente'}}).afterClosed().subscribe(deleted => { if (deleted) this.loadCustomerRows(); });
    } else this.onTableAction({action, row, rowIndex: 0});
  }
  public actionDisabled(action: TableAction<CustomerTableRow>, row: CustomerTableRow): boolean { return typeof action.disabled === 'function' ? action.disabled(row) : Boolean(action.disabled); }
  public get cardActions(): TableAction<CustomerTableRow>[] { return this.actions.filter(action => action.id !== 'notes'); }
  public actionColor(action: TableAction<CustomerTableRow>, row: CustomerTableRow): string | null { return typeof action.iconColor === 'function' ? action.iconColor(row) : null; }
  private readonly allRows = signal<CustomerTableRow[]>([]);

  public readonly addButton: TableAddButtonConfig = {
    label: 'Aggiungi Nuovo',
    icon: 'add',
    ariaLabel: 'Aggiungi cliente',
    route: '/aggiungi-cliente',
  };

  public readonly filterButton: TableFilterButtonConfig = {
    label: 'Filtri',
    icon: 'search',
    ariaLabel: 'Filtri clienti',
    filters: [
      { id: 'name', label: 'Nome' },
      { id: 'vatNumber', label: 'Partita IVA' },
      { id: 'email', label: 'Email' },
      { id: 'destinationNames', label: 'Destinazioni' },
      { id: 'referent', label: 'Referente' },
      { id: 'phoneNumber', label: 'Telefono' },
    ],
  };

  public actions: TableAction<CustomerTableRow>[] = [
    {
      id: 'notes', label: 'Visualizza note', icon: 'sticky_note_2',
      disabled: row => !row.customer.note?.trim(),
      iconColor: row => row.customer.note?.trim() ? 'var(--weavops-color-primary)' : '#929292',
      hoverColor: row => row.customer.note?.trim() ? 'var(--weavops-color-accent)' : '#929292',
    },
    {
      id: 'edit',
      label: 'Modifica',
      icon: 'edit',
      iconColor: 'var(--weavops-color-accent)',
    },
    {
      id: 'history',
      label: 'Visualizza cronologia articoli',
      icon: 'history',
      iconColor: 'var(--weavops-color-primary)',
    },
    {
      id: 'delete',
      label: 'Elimina',
      icon: 'delete',
      iconColor: 'var(--weavops-color-danger-bright)',
      deleteItem: (row) => this.deleteCustomer(row),
      deleteItems: (rows) => this.deleteCustomers(rows),
      deleteItemName: (row) => row.name,
      deleteSuccessMessage: 'Cliente eliminato con successo',
      deleteErrorMessage: "Errore durante l'eliminazione del cliente",
    }
  ];

  ngOnInit(): void {
    this.loadCustomerRows();
  }

  public loadCustomerRows(): void {
    this.loading.set(true); this.loadError.set(false);
    this.customerTableService.getRows().subscribe({
      next: (rows) => {
        this.allRows.set(rows);
        this.onFilterSelected(this.activeFilters);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.allRows.set([]);
        this.rows.set([]); this.loading.set(false); this.loadError.set(true);
      },
    });
  }

  goToHistoryPage(event: TableActionClick<CustomerTableRow>): void {
    this.navigationService.navigate(['/cronologia-articoli'], { state: { customer: event.row } });
  }

  goToEditCustomerPage(event: TableActionClick<CustomerTableRow>): void {
    const customerId = event.row.customer.id ?? event.row.id;

    if (!customerId) {
      console.error('Impossibile modificare il cliente: id mancante', event.row);
      return;
    }

    this.navigationService.navigate(['/aggiungi-cliente'], {
      queryParams: { id: customerId, edit: 'true' },
      state: { customer: event.row.customer },
    });
  }

  public onTableAction(event: TableActionClick<CustomerTableRow>): void {
    switch (event.action.id) {
      case 'notes':
        this.dialog.open(DialogInformativeComponent, {
          width: '560px', maxWidth: 'calc(100vw - 32px)',
          data: {title: 'Visualizza note', icon: 'sticky_note_2', message: event.row.customer.note?.trim() || 'Nessuna nota presente.'},
        });
        break;
      case 'history':
        this.goToHistoryPage(event);
        console.log('Visualizza cronologia articoli per cliente', event.row);
        break;
      case 'edit':
        this.goToEditCustomerPage(event);
        break;
      case 'delete':
        this.loadCustomerRows();
        console.log('Elimina cliente', event.row);
        break;
    }
  }

  public onTableBulkAction(event: TableBulkActionClick<CustomerTableRow>): void {
    if (event.action.id !== 'delete') {
      return;
    }

    this.loadCustomerRows();
    console.log('Elimina clienti selezionati', event.rows);
  }

  public onFilterSelected(filters: FilterValues): void {
    this.currentPage.set(1);
    this.activeFilters = filters;
    const activeFilters = Object.entries(filters)
      .map(([field, value]) => [field, value.trim().toLowerCase()] as const)
      .filter(([, value]) => value.length > 0);

    if (activeFilters.length === 0) {
      this.rows.set(this.allRows());
      return;
    }

    const filteredRows = this.allRows().filter((row) =>
      activeFilters.every(([field, value]) =>
        this.getFilterValue(row, field).toLowerCase().includes(value)
      )
    );

    this.rows.set(filteredRows);
  }

  private deleteCustomer(row: CustomerTableRow) {
    return this.customerService.remove(this.getCustomerId(row));
  }

  private deleteCustomers(rows: CustomerTableRow[]) {
    const customerIds = rows.map((row) => this.getCustomerId(row));

    return this.customerService.deleteMultiCustomers(customerIds);
  }

  private getCustomerId(row: CustomerTableRow): string {
    const customerId = row.customer.id ?? row.id;

    if (!customerId) {
      throw new Error('Impossibile eliminare il cliente: id mancante');
    }

    return customerId;
  }

  private getFilterValue(row: CustomerTableRow, field: string): string {
    if (field === '_search') return [row.name, row.vatNumber, row.email, row.destinationNames, row.referent, row.phoneNumber, row.note, row.customer.street, row.customer.streetNumber, row.customer.postalCode, row.customer.city, row.customer.provinceCode].join(' ');
    const value = row[field as keyof CustomerTableRow];

    return typeof value === 'string' ? value : '';
  }
}
