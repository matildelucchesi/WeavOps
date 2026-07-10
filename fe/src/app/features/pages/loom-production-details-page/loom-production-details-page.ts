import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ActivatedRoute } from '@angular/router';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";
import { MatIcon } from "@angular/material/icon";
import { Arrangement, Item, Loom, LoomItemAssignment, Process } from '../../../api';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import {
  TableComponent,
  type TableAction,
  type TableActionClick,
  type TableBulkActionClick,
  type TableColumn,
} from "../../reusable-components/table-component/table-component";
import { LoomItemAssignmentFacadeService } from '../../../services/loom-item-assignment-facade.service';
import { ProcessFacadeService } from '../../../services/process-facade.service';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogLoomActionComponent } from '../../reusable-components/dialog/dialog-loom-action-component/dialog-loom-action-component';
import {
  DialogLoomAlertTerminateProduction,
  type DialogLoomAlertTerminateProductionData,
  type DialogLoomAlertTerminateProductionResult,
} from '../../reusable-components/dialog/dialog-loom-altert-terminate-production/dialog-loom-alert-terminate-production';
import {
  DialogAlertGeneric,
  type DialogAlertGenericData,
} from '../../reusable-components/dialog/dialog-alert-generic/dialog-alert-generic';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';

interface QueuedProductionTableRow {
  assignment: LoomItemAssignment;
  itemName: string;
  totalMeters: string;
  completionDays: string;
  status: string;
}

@Component({
  selector: 'app-loom-production-details-page',
  imports: [
    DecorativeLinesComponent,
    TitlePageComponent,
    ExitButtonComponent,
    TableComponent,
    MatIcon,
    LoaderComponent
],
  standalone: true,
  templateUrl: './loom-production-details-page.html',
  styleUrl: './loom-production-details-page.scss',
})
export class LoomProductionDetailsPage implements OnInit {

  private readonly startProductionLoaderDurationMs: number = 500;
  private readonly loomService = inject(LoomFacadeService);
  private readonly itemService = inject(ItemFacadeService);
  private readonly assignmentService = inject(LoomItemAssignmentFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly processService = inject(ProcessFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private startProductionLoaderTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isStartProductionLoaderFinished: boolean = false;
  private isStartProductionRequestPending: boolean = false;
  private pendingStartProductionFeedback: (() => void) | null = null;
  public isEditEnabled: boolean = false;
  public readonly loom = signal<Loom | null>(null);
  public readonly item = signal<Item | null>(null);
  public readonly process = signal<Process | null>(null);
  public readonly arrangement = signal<Arrangement | null>(null);
  public readonly runningAssignment = signal<LoomItemAssignment | null>(null);
  public readonly queuedProductionRows = signal<QueuedProductionTableRow[]>([]);
  public readonly isStartingProduction = signal(false);

  public readonly queuedProductionColumns: TableColumn<QueuedProductionTableRow>[] = [
    { header: 'Articolo', field: 'itemName' },
    { header: 'Metri mancanti al completamento', field: 'totalMeters' },
    { header: 'Giorni completamento', field: 'completionDays' },
    {
      header: 'Stato',
      field: 'status',
      chip: {
        defaultStyle: {
          width: '112px',
          minWidth: '112px',
          height: '28px',
        },
        styles: {
          QUEUED: {
            label: 'In coda',
            backgroundColor: 'var(--weavops-color-accent-lighter)',
            color: 'var(--weavops-color-accent-deep)',
            borderColor: 'var(--weavops-color-accent-deep)',
          },
        },
      },
    },
  ];

  public readonly pageTitle = computed((): string => {
    const loom = this.loom();

    return loom
      ? `Dettagli Produzione Telaio ${loom.serialNumber}`
      : 'Dettagli Produzione Telaio';
  });

  public readonly statusLabel = computed((): string => {
    switch (this.loom()?.status) {
      case Loom.StatusEnum.Working:
        return 'In lavorazione';
      case Loom.StatusEnum.Maintenance:
        return 'Manutenzione';
      case Loom.StatusEnum.Stopped:
        return 'Fermo';
      default:
        return 'Stato non disponibile';
    }
  });

  public readonly statusChipClass = computed((): string => {
    switch (this.loom()?.status) {
      case Loom.StatusEnum.Working:
        return 'chip-status-working';
      case Loom.StatusEnum.Maintenance:
        return 'chip-status-maintenance';
      case Loom.StatusEnum.Stopped:
        return 'chip-status-stopped';
      default:
        return 'chip-status-empty';
    }
  });

  public readonly percentage = computed((): number | null => {
    const item = this.item();

    if (!item?.totalMeters) {
      return null;
    }

    return Math.round(((item.metersRun ?? 0) / item.totalMeters) * 10000) / 100;
  });

  ngOnInit(): void {
    const loomId = this.getCurrentLoomId();

    if(loomId){
      this.loomService.getById(loomId).subscribe({
        next: (loom) => {
          this.loom.set(loom);
          this.loadAllProcessesForLoom(loom.id ?? loomId);
        },
        error: (error) => {
        console.error(error);
      }
    });
  }
  }

  ngOnDestroy(): void {
    if (this.startProductionLoaderTimeoutId) {
      clearTimeout(this.startProductionLoaderTimeoutId);
    }
  }

  public get editButtonLabel(): string {
    return this.isEditEnabled ? 'Disabilita Modifiche' : 'Abilita Modifiche';
  }

  public get editButtonIcon(): string {
    return this.isEditEnabled ? 'lock' : 'edit';
  }

  public toggleEditMode(): void {
    this.isEditEnabled = !this.isEditEnabled;
  }

  public openAddMetersDialog(): void {
    const loom = this.loom();

    if (!loom) {
      return;
    }

    const dialogRef = this.dialog.open(DialogLoomActionComponent, {
      panelClass: 'loom-action-dialog-panel',
      data: {
        loom,
        item: this.item(),
        process: this.process(),
        modify: false,
        initialView: 'meters',
      },
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated && loom.id) {
        this.loadAllProcessesForLoom(loom.id);
      }
    });
  }

  public formatDate(value: string | undefined): string {
    if (!value) {
      return '';
    }

    const [year, month, day] = value.split('T')[0].split('-');

    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  public loadAllProcessesForLoom(loomId: string): void {
    this.assignmentService.getByLoomId(loomId).subscribe({
      next: (assignments) => {
        const runningAssignment = assignments.find((assignment) => this.isRunningAssignment(assignment));
        const queuedAssignments = assignments.filter((assignment) => this.isQueuedAssignment(assignment));

        this.loadRunningProduction(runningAssignment);
        this.loadQueuedProductions(queuedAssignments);
      },
      error: (error) => {
        this.clearProductionDetails();
        this.queuedProductionRows.set([]);
        console.error(error);
      }
    });
  }

  private loadRunningProduction(assignment: LoomItemAssignment | undefined): void {
    this.runningAssignment.set(assignment ?? null);

    if (!assignment?.itemId) {
      this.clearProductionDetails();
      return;
    }

    this.itemService.getById(assignment.itemId).pipe(
      switchMap((item) => forkJoin({
        item: of(item),
        process: this.resolveProcess(assignment, item),
        arrangement: this.resolveArrangement(item),
      })),
    ).subscribe({
      next: ({ item, process, arrangement }) => {
        this.item.set(item);
        this.process.set(process);
        this.arrangement.set(arrangement);
      },
      error: (error) => {
        this.clearProductionDetails();
        console.error(error);
      },
    });
  }

  private loadQueuedProductions(assignments: LoomItemAssignment[]): void {
    if (assignments.length === 0) {
      this.queuedProductionRows.set([]);
      return;
    }

    forkJoin(assignments.map((assignment) => this.buildQueuedProductionRow(assignment))).subscribe({
      next: (rows) => {
        this.queuedProductionRows.set(rows.filter((row): row is QueuedProductionTableRow => row !== null));
      },
      error: (error) => {
        this.queuedProductionRows.set([]);
        console.error(error);
      },
    });
  }

  private buildQueuedProductionRow(assignment: LoomItemAssignment): Observable<QueuedProductionTableRow | null> {
    return this.itemService.getById(assignment.itemId).pipe(
      switchMap((item) => forkJoin({
        arrangement: this.resolveArrangement(item),
        process: this.resolveProcess(assignment, item),
      }).pipe(
        map(({ arrangement, process }) => ({
          assignment,
          itemName: arrangement?.itemName ?? item.id ?? '-',
          totalMeters: this.formatNumber(process?.totalMeters),
          completionDays: this.formatTableDays(process?.days),
          status: LoomItemAssignment.StatusEnum.Queued,
        })),
      )),
      catchError((error) => {
        console.error(error);
        return of(null);
      }),
    );
  }

  private resolveProcess(assignment: LoomItemAssignment, item: Item): Observable<Process | null> {
    const itemProcess = this.findProcessForAssignment(assignment, item);

    if (assignment.processId) {
      return this.processService.getById(assignment.processId).pipe(
        map((process) => this.mergeProcessWithFallback(process, itemProcess)),
        catchError((error) => {
          console.error(error);
          return of(itemProcess);
        }),
      );
    }

    return of(itemProcess);
  }

  private resolveArrangement(item: Item): Observable<Arrangement | null> {
    if (!item.arrangementId) {
      return of(null);
    }

    return this.arrangementService.getById(item.arrangementId).pipe(
      catchError((error) => {
        console.error(error);
        return of(null);
      }),
    );
  }

  private findProcessForAssignment(assignment: LoomItemAssignment, item: Item): Process | null {
    const processes = item.processing ?? [];

    if (assignment.processId) {
      const processById = processes.find((process) => process.id === assignment.processId);

      if (processById) {
        return processById;
      }
    }

    const loomId = assignment.loomId || this.loom()?.id;

    if (!loomId) {
      return null;
    }

    return processes.find((process) => process.loom?.id === loomId) ?? null;
  }

  private mergeProcessWithFallback(process: Process, fallback: Process | null): Process {
    if (!fallback) {
      return process;
    }

    return {
      ...process,
      speed: process.speed ?? fallback.speed,
      efficiency: process.efficiency ?? fallback.efficiency,
      totalMeters: process.totalMeters ?? fallback.totalMeters,
      metersRun: process.metersRun ?? fallback.metersRun,
      metersToGo: process.metersToGo ?? fallback.metersToGo,
      startDate: process.startDate ?? fallback.startDate,
      endDate: process.endDate ?? fallback.endDate,
      days: process.days ?? fallback.days,
      expectedEndDate: process.expectedEndDate ?? fallback.expectedEndDate,
      loom: process.loom ?? fallback.loom,
      itemHitsPerDm: process.itemHitsPerDm ?? fallback.itemHitsPerDm,
    };
  }

  private isQueuedAssignment(assignment: LoomItemAssignment): boolean {
    const status = this.normalizeAssignmentStatus(assignment);

    return status === 'QUEUED';
  }

  private isRunningAssignment(assignment: LoomItemAssignment): boolean {
    const status = this.normalizeAssignmentStatus(assignment);

    return status === 'RUNNING';
  }

  private normalizeAssignmentStatus(assignment: LoomItemAssignment): string {
    return String(assignment.status ?? '').trim().toUpperCase();
  }

  private clearProductionDetails(): void {
    this.process.set(null);
    this.item.set(null);
    this.arrangement.set(null);
    this.runningAssignment.set(null);
  }

  private formatNumber(value: number | undefined): string {
    return value === undefined || value === null ? '-' : String(value);
  }

  public formatTableDays(value: number | undefined): string {
    if (value === undefined || value === null || !Number.isFinite(value)) {
      return '-';
    }

    if (value <= 0) {
      return '0 min';
    }

    const rawMinutes = value * 24 * 60;

    if (rawMinutes < 1) {
      return '< 1 min';
    }

    const totalMinutes = Math.round(rawMinutes);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'giorno' : 'giorni'}`);
    }

    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'ora' : 'ore'}`);
    }

    if (minutes > 0 || parts.length === 0) {
      parts.push(`${minutes} min`);
    }

    return parts.join(' ');
  }

  public openTerminateProductionDialog(): void {
    const assignment = this.runningAssignment();

    if (!assignment?.id) {
      console.error('Running assignment data is missing');
      return;
    }

    const dialogRef = this.dialog.open<
      DialogLoomAlertTerminateProduction,
      DialogLoomAlertTerminateProductionData,
      DialogLoomAlertTerminateProductionResult
    >(DialogLoomAlertTerminateProduction, {
      panelClass: 'loom-alert-dialog-panel',
      autoFocus: false,
      data: {
        assignment,
      },
    });

    dialogRef.afterClosed().subscribe((selectedStatus) => {
      if (!selectedStatus) {
        return;
      }

      this.updateAssignmentStatus(assignment, selectedStatus);
    });
  }

  private updateAssignmentStatus(
    assignment: LoomItemAssignment,
    status: LoomItemAssignment.StatusEnum,
    onSuccess?: () => void,
    onError?: () => void,
    reloadAfterUpdate: boolean = true,
  ): void {
    if (!assignment.id) {
      console.error('Running assignment id is missing');
      return;
    }

    const updatedAssignment: LoomItemAssignment = {
      ...assignment,
      status,
    };

    this.assignmentService.update(assignment.id, updatedAssignment).subscribe({
      next: () => {
        if (reloadAfterUpdate) {
          this.reloadProductionsForCurrentLoom();
        }

        onSuccess?.();
      },
      error: (error) => {
        console.error(error);
        onError?.();
      },
    });
  }

  public actions: TableAction<QueuedProductionTableRow>[] = [
        {
          id: 'running',
          label: 'Metti in produzione',
          icon: 'hardware',
          iconColor: 'var(--weavops-color-primary)',
        },
        {
          id: 'delete',
          label: 'Elimina',
          icon: 'delete',
          iconColor: 'var(--weavops-color-danger-bright)',
          deleteItem: (row) => this.deleteAssignment(row),
          deleteItems: (rows) => this.deleteAssignments(rows),
          deleteItemName: (row) => row.itemName,
          deleteSuccessMessage: 'Assegnazione eliminata con successo',
          deleteErrorMessage: "Errore durante l'eliminazione dell'assegnazione",
        }
      ];

  public onTableAction(event: TableActionClick<QueuedProductionTableRow>): void {
    switch (event.action.id) {
      case 'running':
        this.checkIfIsPossibleToStartProduction(event.row);
        break;
      case 'delete':
        this.reloadProductionsForCurrentLoom();
        break;
    }
  }

  public checkIfIsPossibleToStartProduction(row: QueuedProductionTableRow): void {
    if (this.isStartingProduction() || this.isStartProductionRequestPending) {
      return;
    }

    const assignment = row.assignment;

    if (!assignment.id) {
      console.error('Assignment id is missing');
      return;
    }

    if(this.runningAssignment()?.id) {
      this.dialog.open(DialogAlertGeneric, {
        panelClass: 'loom-alert-dialog-panel',
        autoFocus: false,
        data: {
          text: 'Produzione già in corso',
          subtext: 'Non è possibile avviare una nuova produzione finché quella attuale non è terminata.',
          icon: 'report',
          iconColor: 'red',
        },
      });
      console.error('There is already a running assignment');
      return;
    }

    const dialogRef = this.dialog.open<
      DialogAlertGeneric,
      DialogAlertGenericData,
      boolean
    >(DialogAlertGeneric, {
      panelClass: 'loom-alert-dialog-panel',
      autoFocus: false,
      data: {
        text: `Vuoi davvero mettere in produzione ${row.itemName}?`,
        icon: 'help',
        iconColor: 'var(--weavops-color-primary)',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.startProduction(assignment);
    });
  }

  private startProduction(assignment: LoomItemAssignment): void {
    if (!assignment.id || this.isStartingProduction() || this.isStartProductionRequestPending) {
      return;
    }

    this.showStartProductionLoader();
    this.isStartProductionRequestPending = true;

    const updatedAssignment: LoomItemAssignment = {
      ...assignment,
      status: LoomItemAssignment.StatusEnum.Running,
    };

    this.assignmentService.update(assignment.id, updatedAssignment).subscribe({
      next: () => {
        this.isStartProductionRequestPending = false;
        this.showStartProductionFeedbackAfterLoader(() => {
          this.runningAssignment.set(updatedAssignment);
          this.reloadProductionsForCurrentLoom();
          this.snackBar.open('Messa in produzione avvenuta con successo.', 'Chiudi', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        });
      },
      error: (error) => {
        console.error(error);
        this.isStartProductionRequestPending = false;
        this.showStartProductionFeedbackAfterLoader(() => {
          this.snackBar.open('Errore durante la messa in produzione', 'Chiudi', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar'],
          });
        });
      },
    });
  }

  private showStartProductionLoader(): void {
    if (this.startProductionLoaderTimeoutId) {
      clearTimeout(this.startProductionLoaderTimeoutId);
    }

    this.isStartingProduction.set(true);
    this.isStartProductionLoaderFinished = false;
    this.pendingStartProductionFeedback = null;

    this.startProductionLoaderTimeoutId = setTimeout(() => {
      this.isStartProductionLoaderFinished = true;
      this.startProductionLoaderTimeoutId = null;
      this.flushStartProductionFeedback();
    }, this.startProductionLoaderDurationMs);
  }

  private showStartProductionFeedbackAfterLoader(callback: () => void): void {
    this.pendingStartProductionFeedback = callback;
    this.flushStartProductionFeedback();
  }

  private flushStartProductionFeedback(): void {
    if (
      !this.isStartProductionLoaderFinished ||
      this.isStartProductionRequestPending ||
      !this.pendingStartProductionFeedback
    ) {
      return;
    }

    const callback = this.pendingStartProductionFeedback;

    this.isStartingProduction.set(false);
    this.pendingStartProductionFeedback = null;
    callback();
  }

  public onTableBulkAction(event: TableBulkActionClick<QueuedProductionTableRow>): void {
    if (event.action.id === 'delete') {
      this.reloadProductionsForCurrentLoom();
    }
  }

  private deleteAssignment(row: QueuedProductionTableRow): Observable<unknown> {
    return this.assignmentService.remove(this.getAssignmentId(row));
  }

  private deleteAssignments(rows: QueuedProductionTableRow[]): Observable<unknown> {
    return forkJoin(rows.map((row) => this.assignmentService.remove(this.getAssignmentId(row))));
  }

  private getAssignmentId(row: QueuedProductionTableRow): string {
    const assignmentId = row.assignment.id;

    if (!assignmentId) {
      throw new Error('Impossibile eliminare l\'assegnazione: id mancante');
    }

    return assignmentId;
  }

  private reloadProductionsForCurrentLoom(): void {
    const loomId = this.getCurrentLoomId();

    if (!loomId) {
      return;
    }

    this.refreshLoom(loomId);
    this.loadAllProcessesForLoom(loomId);
  }

  private refreshLoom(loomId: string): void {
    this.loomService.getById(loomId).subscribe({
      next: (loom) => {
        this.loom.set(loom);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  private getCurrentLoomId(): string | null {
    return this.loom()?.id
      ?? this.route.snapshot.paramMap.get('id')
      ?? this.route.snapshot.queryParamMap.get('id');
  }
}
