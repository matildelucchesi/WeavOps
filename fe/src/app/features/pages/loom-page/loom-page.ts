import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize, Subscription } from 'rxjs';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { DecorativeLinesComponent } from '../../reusable-components/decorative-lines-component/decorative-lines-component';
import { LoomTableRow } from '../../../table/table-row-interface/loom-table-row';
import {
  TableComponent,
  type TableAction,
  type TableActionClick,
  type TableAddButtonConfig,
  type TableBulkActionClick,
  type TableColumn,
  type TableFilterButtonConfig,
} from '../../reusable-components/table-component/table-component';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { LoomTableService } from '../../../table/table-service/loom-table.service';
import type { FilterValues } from '../../reusable-components/button/filter-button-component/filter-button-component';
import { DialogAddNewLoomComponent } from '../../reusable-components/dialog/dialog-add-new-loom-component/dialog-add-new-loom-component';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';
import { DialogLoomActionComponent } from '../../reusable-components/dialog/dialog-loom-action-component/dialog-loom-action-component';
import { WhitePanel } from "../../reusable-components/white-panel/white-panel";
import { Loom } from '../../../api';

@Component({
  selector: 'app-loom-page',
  imports: [
    TableComponent,
    TitlePageComponent,
    LoaderComponent,
    WhitePanel,
],
  standalone: true,
  templateUrl: './loom-page.html',
  styleUrl: './loom-page.scss',
})
export class LoomPage implements OnInit, OnDestroy {

  private readonly refreshLoaderDurationMs: number = 1000;
  private readonly loomTableService = inject(LoomTableService);
  private readonly loomService = inject(LoomFacadeService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private refreshLoaderTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private refreshLoaderStartedAt: number = 0;
  private routeRefreshSubscription: Subscription | null = null;
  private readonly refreshRowsOnWindowFocus = (): void => {
    if (this.isLoomPageRoute()) {
      this.loadLoomRows();
    }
  };

  public columns: TableColumn<LoomTableRow>[] = [
    { header: 'Numero Seriale', field: 'serialNumber' },
    {
      header: 'Stato',
      field: 'status',
      chip: {
        defaultStyle: {
          width: '132px',
          minWidth: '132px',
          height: '28px',
        },
        styles: {
          [Loom.StatusEnum.Working]: {
            label: 'In lavorazione',
            backgroundColor: 'var(--weavops-color-blue-soft)',
            color: 'var(--weavops-color-blue)',
            borderColor: 'var(--weavops-color-blue)',
          },
          [Loom.StatusEnum.Stopped]: {
            label: 'Fermo',
            backgroundColor: 'var(--weavops-color-grey)',
            color: 'var(--weavops-color-grey-dark)',
            borderColor: 'var(--weavops-color-grey-dark)',
          },
          [Loom.StatusEnum.Maintenance]: {
            label: 'Manutenzione',
            backgroundColor: 'var(--weavops-color-accent-lighter)',
            color: 'var(--weavops-color-accent-deep)',
            borderColor: 'var(--weavops-color-accent-deep)',
          },
        },
      },
    },
  ];
  public readonly rows = signal<LoomTableRow[]>([]);
  public readonly isRefreshingLooms = signal<boolean>(false);
  private readonly allRows = signal<LoomTableRow[]>([]);

  public readonly addButton: TableAddButtonConfig = {
    label: 'Aggiungi Nuovo',
    icon: 'add',
    ariaLabel: 'Aggiungi telaio',
  };

  public readonly filterButton: TableFilterButtonConfig = {
    label: 'Filtri',
    icon: 'search',
    ariaLabel: 'Filtri telaio',
    filters: [
      { id: 'serialNumber', label: 'Numero Seriale' }
    ],
  };

  public actions: TableAction<LoomTableRow>[] = [
    {
      id: 'production',
      label: 'Visualizza dettagli produzione',
      imageIcon: '/icon/work-icon-violet.png',
      imageAlt: 'Dettagli produzione',
    },
    {
      id: 'history',
      label: 'Visualizza cronologia produzione',
      icon: 'history',
      iconColor: 'var(--weavops-color-primary)',
    },
    {
      id: 'edit',
      label: 'Modifica',
      icon: 'edit',
      iconColor: 'var(--weavops-color-primary)',
    },
    {
      id: 'delete',
      label: 'Elimina',
      icon: 'delete',
      iconColor: 'var(--weavops-color-primary)',
      deleteItem: (row) => this.deleteLoom(row),
      deleteItems: (rows) => this.deleteLooms(rows),
      deleteItemName: (row) => row.serialNumber,
      deleteSuccessMessage: 'Telaio eliminato con successo',
      deleteErrorMessage: "Errore durante l'eliminazione del telaio",
    }
  ];

  ngOnInit(): void {
    this.loadLoomRows();
    this.registerLoomRowsRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshLoaderTimeoutId) {
      clearTimeout(this.refreshLoaderTimeoutId);
    }

    this.routeRefreshSubscription?.unsubscribe();

    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.refreshRowsOnWindowFocus);
    }
  }

  public openNewLoomDialog(): void {
    const dialogRef = this.dialog.open(DialogAddNewLoomComponent, {
      panelClass: 'add-new-loom-dialog-panel',
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.loadLoomRows();
      }
    });
  }

  private deleteLoom(row: LoomTableRow) {
    return this.loomService.remove(this.getLoomId(row));
  }

  private deleteLooms(rows: LoomTableRow[]) {
    const loomIds = rows.map((row) => this.getLoomId(row));

    return this.loomService.deleteMultiLooms(loomIds);
  }

  public onTableAction(event: TableActionClick<LoomTableRow>): void {
    switch (event.action.id) {
      case 'production':
        this.goToProductionDetailsPage(event);
        console.log('Visualizza dettagli produzione per telaio', event.row);
        break;
      case 'history':
        this.goToHistoryPage(event);
        console.log('Visualizza cronologia articoli per telaio', event.row);
        break;
      case 'edit':
        this.openDialogLoomAction(event.row, event.action);
        console.log('Modifica telaio', event.row);
        break;
      case 'delete':
        this.loadLoomRows();
        console.log('Elimina telaio', event.row);
        break;
    }
  }

  public loadLoomRows(showLoader: boolean = false): void {
    if (showLoader) {
      this.showRefreshLoader();
    }

    this.loomTableService.getRows().pipe(
      finalize(() => {
        if (showLoader) {
          this.hideRefreshLoaderAfterMinimumDuration();
        }
      })
    ).subscribe({
      next: (rows) => {
        this.allRows.set(rows);
        this.rows.set(rows);
      },
      error: (err) => {
        console.error('Error loading looms:', err);
        this.allRows.set([]);
        this.rows.set([]);
      },
    });
  }

  private showRefreshLoader(): void {
    if (this.refreshLoaderTimeoutId) {
      clearTimeout(this.refreshLoaderTimeoutId);
      this.refreshLoaderTimeoutId = null;
    }

    this.refreshLoaderStartedAt = Date.now();
    this.isRefreshingLooms.set(true);
  }

  private hideRefreshLoaderAfterMinimumDuration(): void {
    const elapsedMs = Date.now() - this.refreshLoaderStartedAt;
    const remainingMs = Math.max(this.refreshLoaderDurationMs - elapsedMs, 0);

    this.refreshLoaderTimeoutId = setTimeout(() => {
      this.refreshLoaderTimeoutId = null;
      this.isRefreshingLooms.set(false);
    }, remainingMs);
  }

  public onTableBulkAction(event: TableBulkActionClick<LoomTableRow>): void {
    if (event.action.id !== 'delete') {
      return;
    }

    this.loadLoomRows();
    console.log('Elimina telai selezionati', event.rows);
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

  private getFilterValue(row: LoomTableRow, field: string): string {
    const value = row[field as keyof LoomTableRow];

    return typeof value === 'string' ? value : '';
  }

  private getLoomId(row: LoomTableRow): string {
    const loomId = row.loom.id ?? row.id;

    if (!loomId) {
      throw new Error('Impossibile eliminare il telaio: id mancante');
    }

    return loomId;
  }

  private openDialogLoomAction(row: LoomTableRow, action: TableAction<LoomTableRow>): void {
    const dialogRef = this.dialog.open(DialogLoomActionComponent, {
          panelClass: 'loom-action-dialog-panel',
          data: {
            loom: row.loom,
            modify: true,
          },
        });
        dialogRef.afterClosed().subscribe((updated) => {
          if (updated) {
            this.loadLoomRows(true);
          }
        });
    console.log(`Open dialog for action: ${action.id} on loom: ${row.serialNumber}`);
  }

  public goToProductionDetailsPage(event: TableActionClick<LoomTableRow>): void {
    const loomId = this.getLoomId(event.row);
    this.router.navigate(['/dettaglio-produzione', loomId]);
  }

  public goToHistoryPage(event: TableActionClick<LoomTableRow>): void {
    const loomId = this.getLoomId(event.row);
    this.router.navigate(['/cronologia-produzione', loomId]);
  }

  private registerLoomRowsRefresh(): void {
    this.routeRefreshSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter(() => this.isLoomPageRoute()),
    ).subscribe(() => this.loadLoomRows());

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.refreshRowsOnWindowFocus);
    }
  }

  private isLoomPageRoute(): boolean {
    return this.router.url.split(/[?#]/)[0] === '/telai';
  }
  
}
