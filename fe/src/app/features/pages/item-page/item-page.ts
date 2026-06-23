import { Component, inject, OnInit, signal } from '@angular/core';
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import {
  TableAction,
  TableActionClick,
  TableAddButtonConfig,
  TableBulkActionClick,
  TableColumn,
  TableComponent,
  TableFilterButtonConfig,
} from "../../reusable-components/table-component/table-component";
import { ItemTableRow } from '../../../table/table-row-interface/item-table-row';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ItemNotArchivedTableService } from '../../../table/table-service/item-not-archived-table.service';
import { ItemArchivedTableService } from '../../../table/table-service/item-archived-table.service';
import type { FilterValues } from '../../reusable-components/filter-button-component/filter-button-component';
import { WhitePanel } from "../../reusable-components/white-panel/white-panel";
import { Item } from '../../../api';

@Component({
  selector: 'app-item-page',
  imports: [
    TitlePageComponent,
    DecorativeLinesComponent,
    TableComponent,
    WhitePanel
],
  templateUrl: './item-page.html',
  styleUrl: './item-page.scss',
  standalone: true,
})
export class ItemPage implements OnInit {
  private readonly itemNotArchivedTableService = inject(ItemNotArchivedTableService);
  private readonly itemArchivedTableService = inject(ItemArchivedTableService);
  private readonly itemService = inject(ItemFacadeService);

  public columns: TableColumn<ItemTableRow>[] = [
    { header: 'Nome', value: (row) => row.arrangement?.itemName },
    {
      header: 'Stato',
      field: 'state',
      chip: {
        defaultStyle: {
          width: '132px',
          minWidth: '132px',
          height: '28px',
        },
        styles: {
          [Item.StateEnum.Running]: {
            label: 'In produzione',
            backgroundColor: 'var(--weavops-color-primary-soft)',
            color: 'var(--weavops-color-primary)',
            borderColor: 'var(--weavops-color-primary)',
          },
          [Item.StateEnum.Abandoned]: {
            label: 'Abbandonato',
            backgroundColor: 'var(--weavops-color-grey)',
            color: 'var(--weavops-color-grey-dark)',
            borderColor: 'var(--weavops-color-grey-dark)',
          },
          [Item.StateEnum.Initialized]: {
            label: 'Inizializzato',
            backgroundColor: 'var(--weavops-color-accent-lighter)',
            color: 'var(--weavops-color-accent-deep)',
            borderColor: 'var(--weavops-color-accent-deep)',
          },
          [Item.StateEnum.Completed]: {
            label: 'Completato',
            backgroundColor: 'var(--weavops-color-success-soft)',
            color: 'var(--weavops-color-success)',
            borderColor: 'var(--weavops-color-success)',
          },
        },
      },
    },
    { header: 'Cliente', value: (row) => row.customer?.name },
    { header: 'Percentuale Completamento', value: (row) => this.getCompletionPercentage(row) },
    { header: 'Data di completamento prevista', value: (row) => this.formatDate(row.arrangement?.deliveryDate) },
  ];

  public readonly rows = signal<ItemTableRow[]>([]);
  public readonly archivedRows = signal<ItemTableRow[]>([]);
  public readonly isRefreshingLooms = signal<boolean>(false);
  private readonly allRows = signal<ItemTableRow[]>([]);
  private readonly allArchivedRows = signal<ItemTableRow[]>([]);

  public readonly addButton: TableAddButtonConfig = {
      label: 'Aggiungi Nuovo',
      icon: 'add',
      ariaLabel: 'Aggiungi articolo',
      route: '/aggiungi-articolo',
  };

  public readonly filterButton: TableFilterButtonConfig = {
      label: 'Filtri',
      icon: 'search',
      ariaLabel: 'Filtri articolo',
      filters: [
        { id: 'itemName', label: 'Nome' },
        { id: 'state', label: 'Stato' },
        { id: 'customerName', label: 'Cliente' },
      ],
};

  public actions: TableAction<ItemTableRow>[] = [
      {
        id: 'details',
        label: 'Visualizza dati',
        icon: 'visibility',
        imageAlt: 'Visualizza dati',
      },
      {
        id: 'edit',
        label: 'Modifica',
        icon: 'edit',
        iconColor: 'var(--weavops-color-accent)',
      },
      {
        id: 'invoice',
        label: 'Fattura',
        icon: 'receipt_long',
        iconColor: 'var(--weavops-color-primary)',
      },
      {
        id: 'delete',
        label: 'Elimina',
        icon: 'delete',
        iconColor: 'var(--weavops-color-danger-bright)',
        deleteItem: (row) => this.deleteItem(row),
        deleteItems: (rows) => this.deleteItems(rows),
        deleteItemName: (row) => row.arrangement?.itemName,
        deleteSuccessMessage: 'Articolo eliminato con successo',
        deleteErrorMessage: "Errore durante l'eliminazione dell'articolo",
      }
    ];

  ngOnInit(): void {
    this.loadItemRows();
    this.loadArchivedItemRows();
  }

  public loadItemRows(): void {
    this.itemNotArchivedTableService.getRows().subscribe({
      next: (rows) => {
        this.allRows.set(rows);
        this.rows.set(rows);
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.allRows.set([]);
        this.rows.set([]);
      },
    });
  }

  public loadArchivedItemRows(): void {
    this.itemArchivedTableService.getRows().subscribe({
      next: (rows) => {
        this.allArchivedRows.set(rows);
        this.archivedRows.set(rows);
      },
      error: (err) => {
        console.error('Error loading archived items:', err);
        this.allArchivedRows.set([]);
        this.archivedRows.set([]);
      },
    });
  }

  public onTableAction(event: TableActionClick<ItemTableRow>): void {
    switch (event.action.id) {
      case 'history':
        console.log('Visualizza lavorazione in corso per articolo', event.row);
        break;
      case 'edit':
        console.log('Modifica articolo', event.row);
        break;
      case 'delete':
        this.loadItemRows();
        this.loadArchivedItemRows();
        console.log('Elimina articolo', event.row);
        break;
    }
  }

  public onTableBulkAction(event: TableBulkActionClick<ItemTableRow>): void {
    if (event.action.id !== 'delete') {
      return;
    }

    this.loadItemRows();
    this.loadArchivedItemRows();
    console.log('Elimina articoli selezionati', event.rows);
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

  public onArchivedFilterSelected(filters: FilterValues): void {
    const activeFilters = Object.entries(filters)
      .map(([field, value]) => [field, value.trim().toLowerCase()] as const)
      .filter(([, value]) => value.length > 0);

    if (activeFilters.length === 0) {
      this.archivedRows.set(this.allArchivedRows());
      return;
    }

    const filteredRows = this.allArchivedRows().filter((row) =>
      activeFilters.every(([field, value]) =>
        this.getFilterValue(row, field).toLowerCase().includes(value)
      )
    );

    this.archivedRows.set(filteredRows);
  }

  private deleteItem(row: ItemTableRow) {
      return this.itemService.remove(this.getItemId(row));
    }

    private deleteItems(rows: ItemTableRow[]) {
      const itemIds = rows.map((row) => this.getItemId(row));
  
      return this.itemService.deleteMultiItems(itemIds);
    }

  private getItemId(row: ItemTableRow): string {
      const itemId = row.item.id ?? row.id;

      if (!itemId) {
        throw new Error('Impossibile eliminare l\'articolo: id mancante');
      }

      return itemId;
    }

  private getCompletionPercentage(row: ItemTableRow): string {
    const totalMeters = row.item.totalMeters;
    const metersRun = row.item.metersRun;

    if (!totalMeters || totalMeters <= 0 || metersRun === undefined || metersRun === null) {
      return '';
    }

    const percentage = Math.min(Math.max((metersRun / totalMeters) * 100, 0), 100);

    return `${Math.round(percentage)}%`;
  }

  private formatDate(value: string | undefined): string {
    if (!value) {
      return '';
    }

    const datePart = value.split('T')[0];
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

    if (dateParts) {
      return `${dateParts[3]}/${dateParts[2]}/${dateParts[1]}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private getFilterValue(row: ItemTableRow, field: string): string {
    switch (field) {
      case 'itemName':
        return row.arrangement?.itemName ?? '';
      case 'state':
        return row.state ?? '';
      case 'customerName':
        return row.customer?.name ?? '';
      default:
        return '';
    }
  }
}
