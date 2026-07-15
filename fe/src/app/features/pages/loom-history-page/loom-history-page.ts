import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Arrangement, Item, Loom, LoomItemAssignment, LoomProcessHistory, Process as LoomProcess } from '../../../api';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { LoomItemAssignmentFacadeService } from '../../../services/loom-item-assignment-facade.service';
import { LoomProcessHistoryFacadeService } from '../../../services/loom-process-history-facade.service';
import { ProcessFacadeService } from '../../../services/process-facade.service';
import type { FilterValues } from '../../reusable-components/button/filter-button-component/filter-button-component';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import {
  TableColumn,
  TableComponent,
  TableFilterButtonConfig,
} from '../../reusable-components/table-component/table-component';
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";

interface LoomProcessHistoryRow {
  id?: string;
  history?: LoomProcessHistory;
  process?: LoomProcess;
  assignment?: LoomItemAssignment;
  item?: Item;
  arrangement?: Arrangement;
  itemName: string;
  assignmentStatus?: LoomItemAssignment.StatusEnum;
  assignmentStatusLabel: string;
  totalMeters: string;
  metersRun: string;
  metersToGo: string;
  totalPieces: string;
  piecesRun: string;
  metersPerPiece: string;
  speed: string;
  efficiency: string;
  startDate: string;
  expectedEndDate: string;
  endDate: string;
  days: string;
}

@Component({
  selector: 'app-loom-history-page',
  imports: [DecorativeLinesComponent, TitlePageComponent, TableComponent, ExitButtonComponent],
  standalone: true,
  templateUrl: './loom-history-page.html',
  styleUrl: './loom-history-page.scss',
})
export class LoomHistoryPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly loomService = inject(LoomFacadeService);
  private readonly historyService = inject(LoomProcessHistoryFacadeService);
  private readonly processService = inject(ProcessFacadeService);
  private readonly assignmentService = inject(LoomItemAssignmentFacadeService);
  private readonly itemService = inject(ItemFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);

  private readonly selectedLoomFromNavigation = this.getSelectedLoomFromNavigation();
  private readonly selectedLoomId = this.route.snapshot.paramMap.get('id') ?? this.selectedLoomFromNavigation?.id;
  private readonly allRows = signal<LoomProcessHistoryRow[]>([]);

  public readonly selectedLoom = signal<Loom | undefined>(this.selectedLoomFromNavigation);
  public readonly rows = signal<LoomProcessHistoryRow[]>([]);
  public readonly title = signal(this.buildTitle(this.selectedLoom()));

  public readonly columns: TableColumn<LoomProcessHistoryRow>[] = [
    { header: 'Articolo', field: 'itemName' },
    { header: 'Metri prodotti', value: (row) => `${row.metersRun}` },
    { header: 'Pezze prodotte', value: (row) => `${row.piecesRun}` },
    { header: 'Metri per Pezza', field: 'metersPerPiece' },
    { header: 'Velocità', field: 'speed' },
    { header: 'Efficienza', field: 'efficiency' },
    { header: 'Data Inizio', field: 'startDate' },
    { header: 'Data Fine', field: 'endDate' },
    { header: 'Giorni', field: 'days' },
  ];

  public readonly filterButton: TableFilterButtonConfig = {
    label: 'Filtri',
    icon: 'search',
    ariaLabel: 'Filtri cronologia processi',
    filters: [
      { id: 'itemName', label: 'Articolo' },
      { id: 'assignmentStatusLabel', label: 'Stato' },
    ],
  };

  public ngOnInit(): void {
    this.loadSelectedLoom();
    this.loadRows();
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
      activeFilters.every(([key, value]) => String(row[key as keyof LoomProcessHistoryRow] ?? '')
        .toLowerCase()
        .includes(value))
    ));
  }

  private loadSelectedLoom(): void {
    if (this.selectedLoom() || !this.selectedLoomId) {
      this.title.set(this.buildTitle(this.selectedLoom()));
      return;
    }

    this.loomService.getById(this.selectedLoomId).subscribe({
      next: (loom) => {
        this.selectedLoom.set(loom);
        this.title.set(this.buildTitle(loom));
      },
      error: (error) => console.error('Error loading loom for history:', error),
    });
  }

  private loadRows(): void {
    forkJoin({
      histories: this.historyService.getAll().pipe(catchError((error) => {
        console.error('Error loading loom process histories:', error);
        return of([] as LoomProcessHistory[]);
      })),
      processes: this.processService.getAll().pipe(catchError((error) => {
        console.error('Error loading processes for loom history:', error);
        return of([] as LoomProcess[]);
      })),
      assignments: this.selectedLoomId
        ? this.assignmentService.getByLoomId(this.selectedLoomId).pipe(catchError((error) => {
          console.error('Error loading assignments for loom history:', error);
          return of([] as LoomItemAssignment[]);
        }))
        : this.assignmentService.getAll().pipe(catchError((error) => {
          console.error('Error loading assignments for loom history:', error);
          return of([] as LoomItemAssignment[]);
        })),
      items: this.itemService.getAll().pipe(catchError((error) => {
        console.error('Error loading items for loom history:', error);
        return of([] as Item[]);
      })),
      arrangements: this.arrangementService.getAll().pipe(catchError((error) => {
        console.error('Error loading arrangements for loom history:', error);
        return of([] as Arrangement[]);
      })),
    }).subscribe(({ histories, processes, assignments, items, arrangements }) => {
      const rows = this.buildRows(histories, processes, assignments, items, arrangements);
      this.allRows.set(rows);
      this.rows.set(rows);
    });
  }

  private buildRows(
    histories: LoomProcessHistory[],
    processes: LoomProcess[],
    assignments: LoomItemAssignment[],
    items: Item[],
    arrangements: Arrangement[],
  ): LoomProcessHistoryRow[] {
    const processById = new Map(processes.map((process) => [process.id, process]));
    const assignmentByProcessId = new Map(assignments
      .filter((assignment) => assignment.processId)
      .map((assignment) => [assignment.processId, assignment]));
    const itemById = new Map(items.map((item) => [item.id, item]));
    const arrangementById = new Map(arrangements.map((arrangement) => [arrangement.id, arrangement]));
    const historyRows = histories.filter((history) => !this.selectedLoomId || history.loomId === this.selectedLoomId);
    const historiesByProcessId = new Map(historyRows.map((history) => [history.processId, history]));
    const processIds = new Set<string>();

    for (const history of historyRows) {
      processIds.add(history.processId);
    }

    for (const assignment of assignments) {
      if (assignment.processId && !historiesByProcessId.has(assignment.processId)) {
        processIds.add(assignment.processId);
      }
    }

    return [...processIds]
      .map((processId) => {
        const history = historiesByProcessId.get(processId);
        const process = processById.get(processId);
        const assignment = assignmentByProcessId.get(processId);
        const item = assignment?.itemId ? itemById.get(assignment.itemId) : undefined;
        const arrangement = item?.arrangementId ? arrangementById.get(item.arrangementId) : undefined;
        const assignmentStatus = assignment?.status;

        return {
          id: history?.id ?? processId,
          history,
          process,
          assignment,
          item,
          arrangement,
          itemName: arrangement?.itemName ?? 'Articolo non trovato',
          assignmentStatus,
          assignmentStatusLabel: this.getAssignmentStatusLabel(assignmentStatus),
          totalMeters: this.formatNumber(process?.totalMeters),
          metersRun: this.formatNumber(process?.metersRun),
          metersToGo: this.formatNumber(process?.metersToGo),
          totalPieces: this.formatNumber(process?.totalPieces),
          piecesRun: this.formatNumber(process?.piecesRun),
          metersPerPiece: this.formatNumber(process?.metersPerPiece),
          speed: this.formatNumber(process?.speed),
          efficiency: this.formatNumber(process?.efficiency),
          startDate: this.formatDate(process?.startDate),
          expectedEndDate: this.formatDate(process?.expectedEndDate),
          endDate: this.formatDate(process?.endDate),
          days: this.formatIntegerRoundedUp(process?.days),
        };
      });
  }

  private getSelectedLoomFromNavigation(): Loom | undefined {
    const state = window.history.state as { loom?: { loom?: Loom; id?: string; serialNumber?: string } };
    const loomState = state.loom;

    if (!loomState) {
      return undefined;
    }

    return (loomState.loom ?? loomState) as Loom;
  }

  private buildTitle(loom: Loom | undefined): string {
    return loom?.serialNumber
      ? `Cronologia Processi - Telaio ${loom.serialNumber}`
      : 'Cronologia Processi';
  }

  private getAssignmentStatusLabel(status: LoomItemAssignment.StatusEnum | undefined): string {
    switch (status) {
      case LoomItemAssignment.StatusEnum.Queued:
        return 'In coda';
      case LoomItemAssignment.StatusEnum.Running:
        return 'In produzione';
      case LoomItemAssignment.StatusEnum.Completed:
        return 'Completato';
      case LoomItemAssignment.StatusEnum.Abandoned:
        return 'Abbandonato';
      default:
        return 'Non disponibile';
    }
  }

  private formatNumber(value: number | undefined): string {
    return new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  private formatIntegerRoundedUp(value: number | undefined): string {
    const safeValue = value ?? 0;
    const roundedUpValue = Math.ceil(safeValue);

    return new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 0,
    }).format(roundedUpValue);
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
