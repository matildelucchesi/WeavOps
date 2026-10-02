import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import type { FilterValues } from '../../reusable-components/button/filter-button-component/filter-button-component';
import { WhitePanel } from "../../reusable-components/white-panel/white-panel";
import { Arrangement, Item } from '../../../api';
import { MatIcon } from "@angular/material/icon";
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { CustomerItemHistoryFacadeService } from '../../../services/customer-item-history-facade.service';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogAlertGeneric,
  type DialogAlertGenericData,
  type DialogAlertGenericDeliveryResult,
  type DialogAlertGenericResult,
} from '../../reusable-components/dialog/dialog-alert-generic/dialog-alert-generic';

@Component({
  selector: 'app-item-page',
  imports: [
    TitlePageComponent,
    //DecorativeLinesComponent,
    TableComponent,
    WhitePanel,
    MatIcon
],
  templateUrl: './item-page.html',
  styleUrl: './item-page.scss',
  standalone: true,
})
export class ItemPage implements OnInit {
  private readonly itemNotArchivedTableService = inject(ItemNotArchivedTableService);
  private readonly itemArchivedTableService = inject(ItemArchivedTableService);
  private readonly itemService = inject(ItemFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly customerItemHistoryService = inject(CustomerItemHistoryFacadeService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

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
            backgroundColor: 'var(--weavops-color-blue-soft)',
            color: 'var(--weavops-color-blue)',
            borderColor: 'var(--weavops-color-blue)',
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
    { header: 'Data di consegna', value: (row) => this.formatDate(row.arrangement?.deliveryDate) },
    {
      header: '',
      icon: {
        name: 'warning',
        color: 'var(--weavops-color-danger-bright)',
        tooltip: 'La data di completamento prevista supera la data di consegna',
        visible: (row) => this.isExpectedEndDateAfterDeliveryDate(row),
      },
    },
  ];

  public archivedColumns: TableColumn<ItemTableRow>[] = [
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
            backgroundColor: 'var(--weavops-color-blue-soft)',
            color: 'var(--weavops-color-blue)',
            borderColor: 'var(--weavops-color-blue)',
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
    {
      header: 'Consegnato',
      checkbox: {
        checked: (row) => row.item.isDelivered === true,
        disabled: (row) => row.item.isDelivered === true || this.isAbandonedItem(row),
        ariaLabel: (row) => `Articolo ${row.arrangement?.itemName ?? ''} consegnato`,
        onChange: (row, isDelivered) => this.updateItemDeliveryState(row, isDelivered),
      },
    },
    { header: 'Data di consegna', value: (row) => this.formatDate(row.arrangement?.deliveryDate) },
  ];

  public readonly rows = signal<ItemTableRow[]>([]);
  public readonly archivedRows = signal<ItemTableRow[]>([]);
  public readonly isRefreshingLooms = signal<boolean>(false);
  private readonly allRows = signal<ItemTableRow[]>([]);
  private readonly allArchivedRows = signal<ItemTableRow[]>([]);
  private readonly deliveryForecastByItemId = signal<Record<string, boolean>>({});

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

  public archivedActions: TableAction<ItemTableRow>[] = [
      {
        id: 'details',
        label: 'Visualizza dati',
        icon: 'visibility',
        imageAlt: 'Visualizza dati',
      },
      {
        id: 'copy',
        label: 'Copia',
        icon: 'file_copy',
        iconColor: 'var(--weavops-color-primary)',    
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
        this.loadDeliveryForecasts(rows);
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.allRows.set([]);
        this.rows.set([]);
        this.deliveryForecastByItemId.set({});
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

  private updateItemDeliveryState(row: ItemTableRow, isDelivered: boolean): void {
    if (isDelivered && this.isAbandonedItem(row)) {
      this.resetDeliveredCheckbox(row);
      return;
    }

    if (isDelivered) {
      this.openDeliveredConfirmationDialog(row);
      return;
    }

    this.persistItemDeliveryState(row, false);
  }

  private openDeliveredConfirmationDialog(row: ItemTableRow): void {
    const itemName = row.arrangement?.itemName ?? 'selezionato';
    const dialogRef = this.dialog.open<DialogAlertGeneric, DialogAlertGenericData, DialogAlertGenericResult>(DialogAlertGeneric, {
      panelClass: 'item-alert-dialog-panel',
      width: '520px',
      maxWidth: 'calc(100vw - 48px)',
      autoFocus: false,
      data: {
        text: `L'articolo ${itemName} verrà contrassegnato come Consegnato, vuoi procedere?`,
        icon: 'help',
        iconColor: 'var(--weavops-color-primary)',
        deliveryDetails: true,
        deliveryDetailsTitle: 'Indica la Data di consegna',
        deliveryDate: new Date(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (this.isDeliveryDialogResult(result)) {
        this.persistItemDeliveryState(row, true, result.deliveryDate, result.isLate);
        return;
      }

      this.resetDeliveredCheckbox(row);
    });
  }

  private resetDeliveredCheckbox(row: ItemTableRow): void {
    const resetRow = (currentRow: ItemTableRow): ItemTableRow => {
      if ((currentRow.item.id ?? currentRow.id) !== (row.item.id ?? row.id)) {
        return currentRow;
      }

      return {
        ...currentRow,
        item: {
          ...currentRow.item,
          isDelivered: false,
          isLate: false,
        },
      };
    };

    this.allArchivedRows.update((rows) => rows.map(resetRow));
    this.archivedRows.update((rows) => rows.map(resetRow));
  }

  private persistItemDeliveryState(
    row: ItemTableRow,
    isDelivered: boolean,
    deliveredAt?: string,
    isLate: boolean = false,
  ): void {
    const itemId = row.item.id ?? row.id;

    if (!itemId) {
      console.error('Impossibile aggiornare la consegna: id dell\'articolo mancante', row);
      return;
    }

    const updatedItem: Item = {
      ...row.item,
      isDelivered,
      isLate: isDelivered ? isLate : false,
    };

    if (!isDelivered || !row.arrangement?.id) {
      this.itemService.update(itemId, updatedItem).subscribe({
        next: () => this.loadArchivedItemRows(),
        error: (error) => console.error('Errore durante l\'aggiornamento della consegna:', error),
      });
      return;
    }

    const updatedArrangement = {
      ...row.arrangement,
      deliveryDate: deliveredAt ?? new Date().toISOString(),
    };

    forkJoin({
      item: this.itemService.update(itemId, updatedItem),
      arrangement: this.arrangementService.update(row.arrangement.id, updatedArrangement),
    }).subscribe({
      next: () => this.loadArchivedItemRows(),
      error: (error) => console.error('Errore durante l\'aggiornamento della consegna:', error),
    });
  }

  private isAbandonedItem(row: ItemTableRow): boolean {
    return (row.item.state ?? row.state) === Item.StateEnum.Abandoned;
  }

  private isDeliveryDialogResult(result: DialogAlertGenericResult | undefined): result is DialogAlertGenericDeliveryResult {
    return typeof result === 'object'
      && result !== null
      && 'deliveryDate' in result
      && 'isLate' in result
      && result.confirmed === true
      && typeof result.deliveryDate === 'string'
      && typeof result.isLate === 'boolean';
  }

  public onTableAction(event: TableActionClick<ItemTableRow>): void {
    switch (event.action.id) {
      case 'details':
        this.gotoItemDetailsPage(event.row);
        console.log('Visualizza dettagliarticolo', event.row);
        break;
      case 'edit':
        console.log('Modifica articolo', event.row);
        break;
      case 'copy':
        this.openCopyArchivedItemConfirmationDialog(event.row);
        break;
      case 'delete':
        this.loadItemRows();
        this.loadArchivedItemRows();
        console.log('Elimina articolo', event.row);
        break;
    }
  }

  public gotoItemDetailsPage(row: ItemTableRow): void {
    const itemId = row.item.id ?? row.id;

    if (!itemId) {
      console.error('Impossibile visualizzare i dettagli dell\'articolo: id mancante', row);
      return;
    }

    this.router.navigate(['/dettaglio-articolo'], {
      queryParams: { id: itemId },
      state: {
        item: row.item,
        arrangement: row.arrangement,
      },
    });
  }

  private openCopyArchivedItemConfirmationDialog(row: ItemTableRow): void {
    const itemName = row.arrangement?.itemName ?? 'selezionato';
    const dialogRef = this.dialog.open<DialogAlertGeneric, DialogAlertGenericData, DialogAlertGenericResult>(DialogAlertGeneric, {
      panelClass: 'item-alert-dialog-panel',
      width: '520px',
      maxWidth: 'calc(100vw - 48px)',
      autoFocus: false,
      data: {
        text: `L'articolo ${itemName} verrà inserito nella lista degli Articoli, vuoi procedere?`,
        subtext: "I dati dell'articolo verranno completamente copiati, successivamente si aprirà la pagina di dettaglio dove sarà possibile la modifica.",
        icon: 'help',
        iconColor: 'var(--weavops-color-primary)',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed === true) {
        this.createNewItemFromArchived(row);
      }
    });
  }

  private createNewItemFromArchived(row: ItemTableRow): void {
    const itemId = row.item.id ?? row.id;
    const customerName = row.customer?.name?.trim();
    const arrangement = row.arrangement;

    if (!itemId) {
      console.error('Impossibile copiare l\'articolo: id mancante', row);
      return;
    }

    if (!customerName) {
      console.error('Impossibile copiare l\'articolo: cliente mancante', row);
      return;
    }

    if (!arrangement) {
      console.error('Impossibile copiare l\'articolo: disposizione mancante', row);
      return;
    }

    const copiedArrangement = this.buildCopiedArrangement(arrangement);

    this.itemService.createItemWithArrangement({
      customerName,
      arrangement: copiedArrangement,
    }).pipe(
      switchMap((newItem) => {
        const newItemId = newItem.id;
        const customerId = newItem.customerId ?? row.item.customerId;

        if (!newItemId || !customerId) {
          throw new Error('Impossibile creare la cronologia articolo: id articolo o cliente mancante');
        }

        return this.customerItemHistoryService.create({
          customerId,
          itemId: newItemId,
        }).pipe(map(() => newItem));
      }),
    ).subscribe({
      next: (newItem) => {
        const navigationArrangement: Arrangement = {
          ...copiedArrangement,
          id: newItem.arrangementId,
        };

        console.log('Nuovo articolo creato da articolo archiviato:', newItem);
        this.loadItemRows();
        this.router.navigate(['/dettaglio-articolo'], {
          queryParams: { id: newItem.id },
          state: {
            item: {
              ...newItem,
              processing: [],
            },
            arrangement: navigationArrangement,
          },
        });
      },
      error: (error) => {
        console.error('Errore durante la copia dell\'articolo archiviato:', error);
      },
    });
  }

  private buildCopiedArrangement(arrangement: Arrangement): Arrangement {
    return {
      itemName: arrangement.itemName,
      reedCount: arrangement.reedCount,
      reedCM: arrangement.reedCM,
      reedHeight: arrangement.reedHeight,
      warpLength: arrangement.warpLength,
      piecesCount: arrangement.piecesCount,
      pieceLength: arrangement.pieceLength,
      warpEndCount: arrangement.warpEndCount,
      hitsPerDm: arrangement.hitsPerDm,
      deliveryDate: arrangement.deliveryDate,
    };
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
    const totalPieces = row.arrangement?.piecesCount;

    if (totalPieces === undefined || totalPieces === null || totalPieces <= 0) {
      return '';
    }

    const completedPieces = (row.item.processing ?? []).reduce(
      (total, process) => total + Math.max(process.piecesRun ?? 0, 0),
      0,
    );
    const percentage = Math.min(Math.max((completedPieces / totalPieces) * 100, 0), 100);

    return `${Math.round(percentage)}%`;
  }

  private formatDate(value: string | undefined): string {
    if (!value) {
      return '';
    }

    const trimmedValue = value.trim();
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);

    if (dateParts) {
      return `${dateParts[3]}/${dateParts[2]}/${dateParts[1]}`;
    }

    const date = new Date(trimmedValue);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private isExpectedEndDateAfterDeliveryDate(row: ItemTableRow): boolean {
    const itemId = row.item.id ?? row.id;

    if (itemId && Object.hasOwn(this.deliveryForecastByItemId(), itemId)) {
      return !this.deliveryForecastByItemId()[itemId];
    }

    const expectedEndDate = this.toDateOnlyTimestamp(row.item.expectedEndDate);
    const deliveryDate = this.toDateOnlyTimestamp(row.arrangement?.deliveryDate);

    return expectedEndDate !== null
      && deliveryDate !== null
      && expectedEndDate > deliveryDate;
  }

  private loadDeliveryForecasts(rows: ItemTableRow[]): void {
    const forecastableRows = rows.filter((row): row is ItemTableRow & { item: Item & { id: string } } =>
      Boolean(row.item.id ?? row.id),
    );

    if (forecastableRows.length === 0) {
      this.deliveryForecastByItemId.set({});
      return;
    }

    forkJoin(forecastableRows.map((row) => {
      const itemId = row.item.id ?? row.id!;

      return this.itemService.getProductionAdvice(itemId).pipe(
        map((advice) => [itemId, advice.meetsDeliveryDate] as const),
        catchError(() => of([itemId, null] as const)),
      );
    })).subscribe((forecasts) => {
      const deliveryForecastByItemId: Record<string, boolean> = {};

      for (const [itemId, meetsDeliveryDate] of forecasts) {
        if (meetsDeliveryDate !== null) {
          deliveryForecastByItemId[itemId] = meetsDeliveryDate;
        }
      }

      this.deliveryForecastByItemId.set(deliveryForecastByItemId);
    });
  }

  private toDateOnlyTimestamp(value: string | undefined): number | null {
    if (!value || value === '-') {
      return null;
    }

    const datePart = value.split('T')[0];
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

    if (dateMatch) {
      return Date.UTC(
        Number(dateMatch[1]),
        Number(dateMatch[2]) - 1,
        Number(dateMatch[3]),
      );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
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
