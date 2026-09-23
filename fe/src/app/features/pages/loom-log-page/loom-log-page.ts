import { Component, inject, OnInit, signal } from '@angular/core';
import { LoomLog, LoomLogService } from '../../../api';
import type { FilterValues } from '../../reusable-components/button/filter-button-component/filter-button-component';
import {
  TableColumn,
  TableComponent,
  TableFilterButtonConfig,
} from '../../reusable-components/table-component/table-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';

interface LoomLogRow {
  id: string;
  eventType: string;
  event: string;
  loomCode: string;
}

@Component({
  selector: 'app-loom-log-page',
  imports: [TitlePageComponent, TableComponent],
  templateUrl: './loom-log-page.html',
  styleUrl: './loom-log-page.scss',
  standalone: true,
})
export class LoomLogPage implements OnInit {
  private readonly loomLogService = inject(LoomLogService);
  private readonly allRows = signal<LoomLogRow[]>([]);

  public readonly rows = signal<LoomLogRow[]>([]);
  public readonly columns: TableColumn<LoomLogRow>[] = [
    { header: 'Evento', field: 'event' },
    { header: 'Telaio di riferimento', field: 'loomCode' },
  ];
  public readonly filterButton: TableFilterButtonConfig = {
    label: 'Filtri',
    icon: 'search',
    ariaLabel: 'Filtri log telai',
    filters: [
      {
        id: 'eventType',
        label: 'Evento',
        type: 'select',
        options: [
          { value: 'LOOM_CREATED', label: 'Aggiunta telaio' },
          { value: 'LOOM_STATUS_CHANGED', label: 'Cambio stato telaio' },
          { value: 'PROCESS_STARTED', label: 'Processo assegnato' },
          { value: 'PROCESS_COMPLETED', label: 'Processo completato' },
          { value: 'ADD_METERS', label: 'Aggiunta metri' },
        ],
      },
      { id: 'loomCode', label: 'Telaio di riferimento' },
    ],
  };

  public ngOnInit(): void {
    this.loomLogService.getLoomLogs().subscribe({
      next: (logs) => {
        const rows = logs.map((log) => this.toRow(log));
        this.allRows.set(rows);
        this.rows.set(rows);
      },
      error: (error) => {
        console.error('Error loading loom logs:', error);
        this.allRows.set([]);
        this.rows.set([]);
      },
    });
  }

  public onFilterSelected(filters: FilterValues): void {
    const activeFilters = Object.entries(filters)
      .map(([field, value]) => [field, value.trim().toLowerCase()] as const)
      .filter(([, value]) => value.length > 0);

    this.rows.set(activeFilters.length === 0
      ? this.allRows()
      : this.allRows().filter((row) => activeFilters.every(([field, value]) =>
        String(row[field as keyof LoomLogRow]).toLowerCase().includes(value))));
  }

  private toRow(log: LoomLog): LoomLogRow {
    const loomCode = log.loomCode ?? 'Non disponibile';

    return {
      id: log.id ?? '-',
      eventType: log.key,
      event: this.getEventDescription(log, loomCode, log.itemName ?? 'articolo non disponibile'),
      loomCode,
    };
  }

  private getEventDescription(log: LoomLog, loomCode: string, itemName: string): string {
    switch (log.key) {
      case 'LOOM_CREATED':
        return `Aggiunta telaio ${loomCode}`;
      case 'LOOM_STATUS_CHANGED':
        return `Stato telaio modificato in ${this.getLoomStatusDescription(log.loomStatus)}`;
      case 'PROCESS_STARTED':
        return `Processo di ${itemName} assegnato`;
      case 'PROCESS_COMPLETED':
        return `Processo di ${itemName} completato`;
      case 'ADD_METERS':
        return `Aggiunti ${log.metersAdded ?? 0} metri`;
      default:
        return log.key;
    }
  }

  private getLoomStatusDescription(status: string | undefined): string {
    switch (status) {
      case 'STOPPED':
        return 'Fermo';
      case 'WORKING':
        return 'In lavorazione';
      case 'MAINTENANCE':
        return 'Manutenzione';
      default:
        return status ?? 'non disponibile';
    }
  }
}
