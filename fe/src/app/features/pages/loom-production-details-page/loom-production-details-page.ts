import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ActivatedRoute } from '@angular/router';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";
import { MatIcon } from "@angular/material/icon";
import { Arrangement, Item, Loom, LoomItemAssignment, LoomLogService, Process } from '../../../api';
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
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { ProductionSummaryPdfService } from '../../../services/production-summary-pdf.service';
import { UserFacadeService } from '../../../services/user-facade.service';
import { catchError, finalize, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { CertificationFacadeService } from '../../../services/certification-facade.service';
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
  type DialogAlertGenericCertificationResult,
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
    //DecorativeLinesComponent,
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
  private readonly userService = inject(UserFacadeService);
  public get remainingArticleMeters(): number | null {
    const item = this.item();
    return item ? this.getRemainingArticleMeters(item) : null;
  }

  private getRemainingArticleMeters(item: Item): number | null {
    if (item.totalMeters == null) return null;
    const producedMeters = item.metersRun ?? (item.processing ?? []).reduce(
      (total, process) => total + (process.metersRun ?? 0), 0,
    );
    return Math.max(item.totalMeters - producedMeters, 0);
  }

  private readonly startProductionLoaderDurationMs: number = 500;
  private readonly loomService = inject(LoomFacadeService);
  private readonly itemService = inject(ItemFacadeService);
  private readonly certificationService = inject(CertificationFacadeService);
  private isCheckingStartCertification = false;
  private readonly assignmentService = inject(LoomItemAssignmentFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly processService = inject(ProcessFacadeService);
  private readonly customerService = inject(CustomerFacadeService);
  private readonly productionSummaryPdfService = inject(ProductionSummaryPdfService);
  private readonly loomLogService = inject(LoomLogService);
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
  private readonly articleCertificationCode = signal<string | null>(null);
  public readonly currentCertificationLabel = computed(() => {
    const item = this.item();
    if (!item) {
      return '';
    }
    if (item.isCertified === Item.IsCertifiedEnum.None) {
      return 'Nessuna';
    }
    if (item.isCertified === Item.IsCertifiedEnum.All) {
      return this.articleCertificationCode() ?? 'Non disponibile';
    }
    const process = this.process();
    const codes = [process?.grs ? 'GRS' : '', process?.gots ? 'GOTS' : ''].filter(Boolean);
    return codes.length ? codes.join(' / ') : item.isCertified === Item.IsCertifiedEnum.Partial ? 'Nessuna' : 'Non specificata';
  });
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
    const totalPieces = this.arrangement()?.piecesCount;

    if (!item || totalPieces === undefined || totalPieces === null || totalPieces <= 0) {
      return null;
    }

    const completedPieces = (item.processing ?? []).reduce(
      (total, process) => total + Math.max(process.piecesRun ?? 0, 0),
      0,
    );

    return Math.round(Math.min((completedPieces / totalPieces) * 100, 100) * 100) / 100;
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
        certificationCode: item.isCertified === Item.IsCertifiedEnum.All && item.certificationId
          ? this.certificationService.getAll().pipe(
              map(values => values.find(value => value.id === item.certificationId)?.value ?? null),
              catchError(() => of(null)),
            )
          : of(null),
      })),
    ).subscribe({
      next: ({ item, process, arrangement, certificationCode }) => {
        this.item.set(item);
        this.articleCertificationCode.set(certificationCode);
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
          totalMeters: this.formatNumber(this.getRemainingArticleMeters(item) ?? undefined),
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
    this.articleCertificationCode.set(null);
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
      panelClass: ['loom-alert-dialog-panel', 'terminate-production-dialog-panel'],
      autoFocus: false,
      data: {
        assignment,
        item: this.item(),
        process: this.process(),
        arrangement: this.arrangement(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.updateAssignmentStatus(assignment, result.status, result.notes, undefined, undefined, true, result.fabricCode, result.fabricCertificationId);
    });
  }

  private updateAssignmentStatus(
    assignment: LoomItemAssignment,
    status: LoomItemAssignment.StatusEnum,
    notes: string,
    onSuccess?: () => void,
    onError?: () => void,
    reloadAfterUpdate: boolean = true,
    fabricCode?: string,
    fabricCertificationId?: string,
  ): void {
    if (!assignment.id || !assignment.processId) {
      console.error('Running assignment or process id is missing');
      return;
    }

    const updatedAssignment: LoomItemAssignment = {
      ...assignment,
      status,
      fabricCode,
      fabricCertificationId,
    };

    this.processService.getById(assignment.processId).pipe(
      switchMap((process) => this.processService.update(assignment.processId!, { ...process, notes })),
      switchMap(() => this.assignmentService.update(assignment.id!, updatedAssignment)),
    ).subscribe({
      next: () => {
        if (reloadAfterUpdate) {
          this.reloadProductionsForCurrentLoom();
        }

        this.generateProductionSummaryPdf(assignment);

        onSuccess?.();
      },
      error: (error) => {
        console.error(error);
        this.snackBar.open(error.error?.message ?? 'Impossibile terminare la produzione: verificare codice Tela e dati articolo.', 'Chiudi', {duration: 6000});
        onError?.();
      },
    });
  }

  private generateProductionSummaryPdf(assignment: LoomItemAssignment): void {
    const loomId = assignment.loomId ?? this.loom()?.id;
    if (!assignment.processId || !assignment.itemId || !loomId) {
      console.error('Dati del processo incompleti: impossibile creare il PDF riepilogativo');
      return;
    }

    forkJoin({
      user: this.userService.getCurrent(),
      process: this.processService.getById(assignment.processId),
      item: this.itemService.getById(assignment.itemId),
      logs: this.loomLogService.getLoomLogsByLoomId({ loomId }),
    }).pipe(
      switchMap(({ user, process, item, logs }) => forkJoin({
        user: of(user),
        process: of(process),
        item: of(item),
        logs: of(logs),
        arrangement: item.arrangementId ? this.arrangementService.getById(item.arrangementId) : of(null),
        customer: item.customerId ? this.customerService.getById(item.customerId) : of(null),
      })),
    ).subscribe({
      next: ({ user, process, item, arrangement, customer, logs }) => {
        const startTime = process.startDate ? new Date(process.startDate).getTime() : Number.NEGATIVE_INFINITY;
        const endDate = process.endDate ?? new Date().toISOString();
        const endTime = new Date(endDate).getTime();
        const knottingCount = logs.filter((log) =>
          log.key === 'KNOTTING'
          && log.itemId === item.id
          && Boolean(log.createdAt)
          && new Date(log.createdAt!).getTime() >= startTime
          && new Date(log.createdAt!).getTime() <= endTime,
        ).length;

        void this.createProductionSummaryPdf({
          companyName: user.companyName ?? '',
          loomId,
          loomNumber: this.loom()?.serialNumber ?? loomId,
          customerName: customer?.name ?? '-',
          startDate: process.startDate ?? '',
          endDate,
          warpEndCount: arrangement?.warpEndCount,
          grs: process.grs ?? false,
          gots: process.gots ?? false,
          knottingCount,
          notes: process.notes ?? '',
        });
      },
      error: (error) => console.error('Impossibile recuperare i dati per il PDF riepilogativo:', error),
    });
  }

  private async createProductionSummaryPdf(data: {
    companyName: string;
    loomId: string;
    loomNumber: string | number;
    customerName: string;
    startDate: string;
    endDate: string;
    warpEndCount?: number;
    grs: boolean;
    gots: boolean;
    knottingCount: number;
    notes: string;
  }): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 22;
    const pageHeight = pdf.internal.pageSize.getHeight();

    const purple: [number, number, number] = [63, 23, 123];
    pdf.setTextColor(...purple);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    if (data.companyName) {
      const companyLines = pdf.splitTextToSize(data.companyName.toLocaleUpperCase('it'), contentWidth);
      pdf.text(companyLines, margin, y);
      y += companyLines.length * 7 + 5;
    }
    pdf.text(`TELAIO A PRODUZIONE N. ${data.loomNumber}`, margin, y);
    y += 12;
    pdf.setDrawColor(...purple);
    pdf.setLineWidth(0.6);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;

    const drawField = (label: string, value: string, minimumHeight = 14): void => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const lines = pdf.splitTextToSize(value || '-', contentWidth - 8);
      const height = Math.max(minimumHeight, 10 + lines.length * 4);
      if (y + height > pageHeight - 14) {
        pdf.addPage();
        y = 20;
      }
      pdf.setFillColor(246, 242, 251);
      pdf.setDrawColor(218, 208, 233);
      pdf.roundedRect(margin, y, contentWidth, height, 2, 2, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...purple);
      pdf.text(label, margin + 4, y + 5.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(45, 40, 52);
      pdf.text(lines, margin + 4, y + 10.5);
      y += height + 4;
    };

    const formatDate = (value: string): string => {
      if (!value) return '-';
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat('it-IT', { dateStyle: 'short' }).format(date);
    };

    drawField('CLIENTE', data.customerName);
    drawField('DAL  /  AL', `${formatDate(data.startDate)}  /  ${formatDate(data.endDate)}`);
    drawField('MONTATURA', `${data.warpEndCount ?? '-'} fili`);

    pdf.setFillColor(246, 242, 251);
    pdf.setDrawColor(218, 208, 233);
    pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...purple);
    pdf.text('CERTIFICAZIONI', margin + 4, y + 6);

    const drawCheckbox = (x: number, label: string, checked: boolean): number => {
      const boxY = y + 10;
      pdf.setDrawColor(...purple);
      pdf.setLineWidth(0.4);
      pdf.rect(x, boxY - 3, 3.5, 3.5);
      if (checked) {
        pdf.setLineWidth(0.7);
        pdf.line(x + 0.6, boxY - 1.2, x + 1.4, boxY - 0.2);
        pdf.line(x + 1.4, boxY - 0.2, x + 3, boxY - 2.6);
      }
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(45, 40, 52);
      pdf.text(label, x + 5, boxY);
      return x + 35;
    };

    let checkboxX = margin + 4;
    checkboxX = drawCheckbox(checkboxX, 'GRS', data.grs);
    drawCheckbox(checkboxX, 'GOTS', data.gots);
    y += 22;
    drawField('ANNODATURA', `${data.knottingCount} annodature`);
    drawField('VARIE', data.notes || '-', 28);

    const filenameDate = new Date(data.endDate).toISOString().slice(0, 10);
    const safeLoomNumber = String(data.loomNumber).replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `riepilogo-produzione-telaio-${safeLoomNumber}-${filenameDate}.pdf`;
    const file = pdf.output('blob');
    this.productionSummaryPdfService.upload(data.loomId, String(data.loomNumber), file, fileName).subscribe({
      next: () => {
        const downloadUrl = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      },
      error: (error) => {
        console.error('Impossibile archiviare il PDF riepilogativo:', error);
        this.snackBar.open('Il processo è stato chiuso, ma non è stato possibile archiviare il PDF.', 'Chiudi', {
          duration: 6000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
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
    if (this.isStartingProduction() || this.isStartProductionRequestPending || this.isCheckingStartCertification) {
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
          closeOnly: true,
          closeButtonLabel: 'Ok',
          closeButtonVariant: 'purple',
        },
      });
      console.error('There is already a running assignment');
      return;
    }

    this.isCheckingStartCertification = true;
    this.itemService.getById(assignment.itemId).pipe(
      switchMap((item) => {
        if (item.isCertified !== Item.IsCertifiedEnum.All) {
          return of({item, certificationCode: ''});
        }
        return this.certificationService.getAll().pipe(map((certifications) => {
          const certification = certifications.find(value => value.id === item.certificationId);
          if (!certification) {
            throw new Error('Certificazione dell’articolo non disponibile');
          }
          return {item, certificationCode: certification.value?.trim().toUpperCase() ?? ''};
        }));
      }),
      finalize(() => { this.isCheckingStartCertification = false; }),
    ).subscribe({
      next: ({item, certificationCode}) => this.openStartProductionDialog(row, item, certificationCode),
      error: (error) => {
        console.error('Errore nel caricamento della certificazione dell’articolo:', error);
        this.snackBar.open('Impossibile verificare la certificazione dell’articolo. Riprova.', 'Chiudi', {duration: 4000});
      },
    });
  }

  private openStartProductionDialog(row: QueuedProductionTableRow, item: Item, certificationCode: string): void {
    const assignment = row.assignment;
    const requiresCertificationChoice = item.isCertified === Item.IsCertifiedEnum.Partial;
    const automaticCertifications: DialogAlertGenericCertificationResult = {
      confirmed: true,
      grs: item.isCertified === Item.IsCertifiedEnum.All && certificationCode === 'GRS',
      gots: item.isCertified === Item.IsCertifiedEnum.All && certificationCode === 'GOTS',
    };
    const dialogRef = this.dialog.open<
      DialogAlertGeneric,
      DialogAlertGenericData,
      boolean | DialogAlertGenericCertificationResult
    >(DialogAlertGeneric, {
      panelClass: 'loom-alert-dialog-panel',
      autoFocus: false,
      data: {
        text: `Stai avviando su Telaio ${this.loom()?.serialNumber ?? ''} la produzione di ${row.itemName}.`,
        subtext: requiresCertificationChoice ? 'Quale certificazione stai usando?' : 'Vuoi avviare questa produzione?',
        productionCertifications: requiresCertificationChoice,
        icon: 'help',
        iconColor: 'var(--weavops-color-primary)',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!requiresCertificationChoice) {
        if (result === true) {
          this.startProduction(assignment, automaticCertifications);
        }
        return;
      }
      if (!result || typeof result !== 'object' || !('grs' in result) || !('gots' in result)) {
        return;
      }
      this.startProduction(assignment, result);
    });
  }

  private startProduction(assignment: LoomItemAssignment, certifications: DialogAlertGenericCertificationResult): void {
    if (!assignment.id || !assignment.processId || this.isStartingProduction() || this.isStartProductionRequestPending) {
      return;
    }

    this.showStartProductionLoader();
    this.isStartProductionRequestPending = true;

    const updatedAssignment: LoomItemAssignment = {
      ...assignment,
      status: LoomItemAssignment.StatusEnum.Running,
    };

    this.processService.getById(assignment.processId).pipe(
      switchMap((process) => this.processService.update(assignment.processId!, {
        ...process,
        grs: certifications.grs,
        gots: certifications.gots,
      })),
      switchMap(() => this.assignmentService.update(assignment.id!, updatedAssignment)),
    ).subscribe({
      next: () => {
        this.isStartProductionRequestPending = false;
        this.showStartProductionFeedbackAfterLoader(() => {
          this.reloadProductionsForCurrentLoom();
          this.snackBar.open('Messa in produzione avvenuta con successo.', 'Chiudi', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          this.dialog.closeAll();
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
