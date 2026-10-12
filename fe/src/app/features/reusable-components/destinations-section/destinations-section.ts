import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Destination } from '../../../api/model/destination';
import { DestinationFacadeService } from '../../../services/destination-facade.service';
import { TitlePageComponent } from '../title-page-component/title-page-component';
import { TableComponent, TableAction, TableColumn, TableAddButtonConfig, TableFilterButtonConfig, TableActionClick } from '../table-component/table-component';
import { DialogDestination } from '../dialog/dialog-destination/dialog-destination';
import { FilterValues } from '../button/filter-button-component/filter-button-component';
import { AddButtonComponent } from '../button/add-button-component/add-button-component';
import { CompanyCard } from '../company-card/company-card';
import { CardPagination } from '../company-card/card-pagination';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogDelete } from '../dialog/dialog-delete/dialog-delete';

@Component({
  selector: 'app-destinations-section', standalone: true, imports: [TitlePageComponent, CompanyCard, CardPagination, AddButtonComponent, MatIconModule, MatTooltipModule],
  templateUrl: './destinations-section.html', styleUrl: './destinations-section.scss',
})
export class DestinationsSection implements OnInit {
  private readonly service = inject(DestinationFacadeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  public readonly rows = signal<Destination[]>([]);
  public readonly currentPage = signal(1);
  public readonly pageSize = signal(10);
  public changePageSize(size: number): void { this.pageSize.set(size); this.currentPage.set(1); }
  public get pagedRows(): Destination[] { return this.rows().slice((this.currentPage() - 1) * this.pageSize(), this.currentPage() * this.pageSize()); }
  public readonly loading = signal(true);
  public get hasFilters(): boolean { return Object.values(this.activeFilters).some(value => value.trim()); }
  public remove(destination: Destination): void {
    this.dialog.open(DialogDelete, {data: {item: destination, itemName: destination.name, deleteItem: (item: Destination) => this.service.remove(item.id!), successMessage: 'Destinazione eliminata', errorMessage: 'Impossibile eliminare la destinazione. Rimuovere prima le associazioni ai clienti.'}}).afterClosed().subscribe(deleted => { if (deleted) this.load(); });
  }
  private allRows: Destination[] = [];
  private activeFilters: FilterValues = {};
  public searchTerm = '';
  public search(value: string): void { this.searchTerm = value; this.filter({_search: value}); }
  public loadError = false;
  public readonly columns: TableColumn<Destination>[] = [
    {header: 'Nome azienda', field: 'name'},
    {header: 'Indirizzo', value: row => `${row.street} ${row.streetNumber}`},
    {header: 'CAP', field: 'postalCode'}, {header: 'Comune', field: 'city'}, {header: 'Provincia', field: 'provinceCode'},
  ];
  public readonly addButton: TableAddButtonConfig = {label: 'Aggiungi Nuovo', icon: 'add', ariaLabel: 'Aggiungi destinazione'};
  public readonly filterButton: TableFilterButtonConfig = {label: 'Filtri', icon: 'search', ariaLabel: 'Filtri destinazioni', filters: [
    {id: 'name', label: 'Nome azienda'}, {id: 'street', label: 'Via/piazza'}, {id: 'postalCode', label: 'CAP'}, {id: 'city', label: 'Comune'}, {id: 'provinceCode', label: 'Provincia'},
  ]};
  public readonly actions: TableAction<Destination>[] = [
    {id: 'edit', label: 'Modifica', icon: 'edit', iconColor: 'var(--weavops-color-accent)'},
    {id: 'delete', label: 'Elimina', icon: 'delete', iconColor: 'var(--weavops-color-danger-bright)',
      deleteItem: row => this.service.remove(row.id!), deleteItemName: row => row.name,
      deleteSuccessMessage: 'Destinazione eliminata', deleteErrorMessage: 'Impossibile eliminare la destinazione. Se è associata a clienti, rimuovere prima le associazioni.'},
  ];
  public ngOnInit(): void { this.load(); }
  public load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: rows => { this.allRows = rows; this.loadError = false; this.filter(this.activeFilters); this.loading.set(false); },
      error: () => { this.loadError = true; this.loading.set(false); this.snackBar.open('Impossibile caricare le destinazioni', 'Chiudi', {duration: 4000}); },
    });
  }
  public edit(destination: Destination | null = null): void {
    this.dialog.open<DialogDestination, Destination | null, boolean>(DialogDestination, {
      width: '600px', maxWidth: 'calc(100vw - 32px)', data: destination,
    }).afterClosed().subscribe(saved => { if (saved) this.load(); });
  }
  public onAction(event: TableActionClick<Destination>): void {
    if (event.action.id === 'edit') this.edit(event.row);
    if (event.action.id === 'delete') this.load();
  }
  public filter(filters: FilterValues): void {
    this.currentPage.set(1);
    this.activeFilters = filters;
    const active = Object.entries(filters).map(([field, value]) => [field, value.trim().toLocaleLowerCase('it')] as const).filter(([, value]) => value);
    this.rows.set(this.allRows.filter(row => active.every(([field, value]) => (field === '_search' ? [row.name, row.street, row.streetNumber, row.postalCode, row.city, row.provinceCode].join(' ') : String(row[field as keyof Destination] ?? '')).toLocaleLowerCase('it').includes(value))));
  }
}
