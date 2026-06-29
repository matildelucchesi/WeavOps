import { Component, inject, OnInit, signal } from '@angular/core';
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
    TableComponent,
    DecorativeLinesComponent
  ],
  templateUrl: './customer-page.html',
  styleUrl: './customer-page.scss',
  standalone: true,
})
export class CustomerPage implements OnInit {

  private readonly customerTableService = inject(CustomerTableService);
  private readonly customerService = inject(CustomerFacadeService);
  private readonly navigationService = inject(Router);

  public columns: TableColumn<CustomerTableRow>[] = [
    { header: 'Nome', field: 'name' },
    { header: 'Email', field: 'email' },
    { header: 'Referente', field: 'referent' },
    { header: 'Telefono', field: 'phoneNumber' },
    { header: 'Note', field: 'note' },
  ];
  public readonly rows = signal<CustomerTableRow[]>([]);
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
      { id: 'email', label: 'Email' },
      { id: 'referent', label: 'Referente' },
      { id: 'phoneNumber', label: 'Telefono' },
    ],
  };

  public actions: TableAction<CustomerTableRow>[] = [
    {
      id: 'history',
      label: 'Visualizza cronologia articoli',
      icon: 'history',
      iconColor: 'var(--weavops-color-primary)',
    },
    {
      id: 'edit',
      label: 'Modifica',
      icon: 'edit',
      iconColor: 'var(--weavops-color-accent)',
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
    this.customerTableService.getRows().subscribe({
      next: (rows) => {
        this.allRows.set(rows);
        this.rows.set(rows);
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.allRows.set([]);
        this.rows.set([]);
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
      queryParams: { id: customerId },
      state: { customer: event.row.customer },
    });
  }

  public onTableAction(event: TableActionClick<CustomerTableRow>): void {
    switch (event.action.id) {
      case 'history':
        this.goToHistoryPage(event);
        console.log('Visualizza cronologia articoli per cliente', event.row);
        break;
      case 'edit':
        this.goToEditCustomerPage(event);
        console.log('Modifica cliente', event.row);
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
    const value = row[field as keyof CustomerTableRow];

    return typeof value === 'string' ? value : '';
  }
}
