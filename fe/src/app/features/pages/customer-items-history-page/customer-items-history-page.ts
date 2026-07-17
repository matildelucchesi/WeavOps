import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Arrangement, Customer, CustomerItemHistory, Item } from '../../../api';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { CustomerItemHistoryFacadeService } from '../../../services/customer-item-history-facade.service';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { CustomerItemHistoryRow } from '../../../table/table-row-interface/customer-item-history-row';
import { DecorativeLinesComponent } from '../../reusable-components/decorative-lines-component/decorative-lines-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import {
  TableAction,
  TableActionClick,
  TableColumn,
  TableComponent,
  TableFilterButtonConfig,
} from '../../reusable-components/table-component/table-component';
import type { FilterValues } from '../../reusable-components/button/filter-button-component/filter-button-component';
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";

@Component({
  selector: 'app-customer-items-history-page',
  imports: [//DecorativeLinesComponent,
    TitlePageComponent,
    TableComponent,
    ExitButtonComponent
  ],
  standalone: true,
  templateUrl: './customer-items-history-page.html',
  styleUrl: './customer-items-history-page.scss',
})
export class CustomerItemsHistoryPage implements OnInit {
  private readonly historyService = inject(CustomerItemHistoryFacadeService);
  private readonly itemService = inject(ItemFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly customerService = inject(CustomerFacadeService);
  private readonly router = inject(Router);

  private readonly allRows = signal<CustomerItemHistoryRow[]>([]);
  private readonly selectedCustomer = this.getSelectedCustomerFromNavigation();

  public readonly rows = signal<CustomerItemHistoryRow[]>([]);
  public readonly title = this.selectedCustomer?.name
    ? `Cronologia Articoli - ${this.selectedCustomer.name}`
    : 'Cronologia Articoli';

  public readonly columns: TableColumn<CustomerItemHistoryRow>[] = [
    { header: 'Articolo', field: 'itemName' },
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
    { header: 'Numero Pezze', field: 'piecesCount' },
    { header: 'Metri per Pezza', field: 'pieceLength' },
    { header: 'Inizio', field: 'startDate' },
    { header: 'Fine prevista', field: 'expectedEndDate' },
    { header: 'Data di Consegna', field: 'deliveryDate' },
    {
      header: 'Consegnato',
      checkbox: {
        checked: (row) => row.item?.isDelivered === true,
        disabled: true,
        ariaLabel: (row) => row.item?.isDelivered === true
          ? `Articolo ${row.itemName} consegnato`
          : `Articolo ${row.itemName} non consegnato`,
      },
    },
  ];

  public readonly actions: TableAction<CustomerItemHistoryRow>[] = [
    {
      id: 'details',
      label: 'Visualizza dettaglio articolo',
      icon: 'visibility',
      iconColor: 'var(--weavops-color-primary)',
      disabled: (row) => !row.item?.id,
    },
  ];

  public readonly filterButton: TableFilterButtonConfig = {
    label: 'Filtri',
    icon: 'search',
    ariaLabel: 'Filtri cronologia articoli',
    filters: [
      { id: 'itemName', label: 'Articolo' },
      { id: 'stateLabel', label: 'Stato' },
      { id: 'deliveryStatusLabel', label: 'Esito consegna' },
    ],
  };

  public ngOnInit(): void {
    this.loadRows();
  }

  public onTableAction(event: TableActionClick<CustomerItemHistoryRow>): void {
    if (event.action.id === 'details') {
      this.goToItemDetailsPage(event.row);
    }
  }

  public onFilterSelected(filters: FilterValues): void {
    const activeFilters = Object.entries(filters)
      .map(([key, value]) => [key, value.trim().toLowerCase()] as const)
      .filter(([, value]) => value.length > 0);

    if (activeFilters.length === 0) {
      this.rows.set(this.allRows());
      return;
    }

    this.rows.set(this.allRows().filter((row) =>
      activeFilters.every(([key, value]) => String(row[key as keyof CustomerItemHistoryRow] ?? '')
        .toLowerCase()
        .includes(value))
    ));
  }

  private loadRows(): void {
    forkJoin({
      histories: this.historyService.getAll().pipe(catchError((error) => {
        console.error('Error loading customer item histories:', error);
        return of([] as CustomerItemHistory[]);
      })),
      items: this.itemService.getAll().pipe(catchError((error) => {
        console.error('Error loading items for customer history:', error);
        return of([] as Item[]);
      })),
      arrangements: this.arrangementService.getAll().pipe(catchError((error) => {
        console.error('Error loading arrangements for customer history:', error);
        return of([] as Arrangement[]);
      })),
      customers: this.customerService.getAll().pipe(catchError((error) => {
        console.error('Error loading customers for item history:', error);
        return of([] as Customer[]);
      })),
    }).subscribe(({ histories, items, arrangements, customers }) => {
      const rows = this.buildRows(histories, items, arrangements, customers);
      this.allRows.set(rows);
      this.rows.set(rows);
    });
  }

  private buildRows(
    histories: CustomerItemHistory[],
    items: Item[],
    arrangements: Arrangement[],
    customers: Customer[],
  ): CustomerItemHistoryRow[] {
    const itemById = new Map(items.map((item) => [item.id, item]));
    const arrangementById = new Map(arrangements.map((arrangement) => [arrangement.id, arrangement]));
    const customerById = new Map(customers.map((customer) => [customer.id, customer]));
    const selectedCustomerId = this.selectedCustomer?.id;
    const historyRows = histories
      .filter((history) => !selectedCustomerId || history.customerId === selectedCustomerId);
    const historyItemIds = new Set(historyRows.map((history) => history.itemId));
    const fallbackRows = items
      .filter((item): item is Item & { id: string; customerId: string } =>
        !!item.id
        && !!item.customerId
        && !historyItemIds.has(item.id)
        && (!selectedCustomerId || item.customerId === selectedCustomerId)
      )
      .map((item): CustomerItemHistory => ({
        customerId: item.customerId,
        itemId: item.id,
      }));

    return [...historyRows, ...fallbackRows]
      .map((history) => {
        const item = itemById.get(history.itemId);
        const arrangement = item?.arrangementId ? arrangementById.get(item.arrangementId) : undefined;
        const customer = customerById.get(history.customerId) ?? this.selectedCustomer;
        const deliveryStatus = this.getDeliveryStatus(item);

        return {
          id: history.id ?? history.itemId,
          history,
          item,
          arrangement,
          customer,
          itemName: arrangement?.itemName ?? 'Articolo non trovato',
          customerName: customer?.name ?? 'Cliente non trovato',
          state: item?.state,
          stateLabel: this.getStateLabel(item?.state),
          piecesCount: this.formatNumber(arrangement?.piecesCount),
          pieceLength: this.formatNumber(arrangement?.pieceLength),
          totalMeters: this.formatNumber(item?.totalMeters),
          metersRun: this.formatNumber(item?.metersRun),
          completionPercentage: this.getCompletionPercentage(item),
          startDate: this.formatDate(item?.startDate),
          expectedEndDate: this.formatDate(item?.expectedEndDate),
          deliveryDate: this.formatDate(arrangement?.deliveryDate),
          deliveryStatus,
          deliveryStatusLabel: this.getDeliveryStatusLabel(deliveryStatus),
        };
      });
  }

  private goToItemDetailsPage(row: CustomerItemHistoryRow): void {
    const itemId = row.item?.id;

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

  private getSelectedCustomerFromNavigation(): Customer | undefined {
    const state = window.history.state as { customer?: { customer?: Customer; id?: string; name?: string } };
    const customerState = state.customer;

    if (!customerState) {
      return undefined;
    }

    return (customerState.customer ?? customerState) as Customer;
  }

  private getDeliveryStatus(item: Item | undefined): CustomerItemHistoryRow['deliveryStatus'] {
    if (item?.isLate === true) {
      return 'LATE';
    }

    if (item?.isDelivered === true) {
      return 'DELIVERED';
    }

    return 'PENDING';
  }

  private getDeliveryStatusLabel(status: CustomerItemHistoryRow['deliveryStatus']): string {
    switch (status) {
      case 'DELIVERED':
        return 'Consegnato';
      case 'LATE':
        return 'In ritardo';
      default:
        return 'Da consegnare';
    }
  }

  private getStateLabel(state: Item.StateEnum | undefined): string {
    switch (state) {
      case Item.StateEnum.Running:
        return 'In produzione';
      case Item.StateEnum.Abandoned:
        return 'Abbandonato';
      case Item.StateEnum.Initialized:
        return 'Inizializzato';
      case Item.StateEnum.Completed:
        return 'Completato';
      default:
        return 'Non disponibile';
    }
  }

  private getCompletionPercentage(item: Item | undefined): string {
    const totalMeters = item?.totalMeters ?? 0;
    const metersRun = item?.metersRun ?? 0;

    if (totalMeters <= 0) {
      return '0%';
    }

    return `${Math.min(Math.round((metersRun / totalMeters) * 100), 100)}%`;
  }

  private formatNumber(value: number | undefined): string {
    return new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  private formatDate(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}
