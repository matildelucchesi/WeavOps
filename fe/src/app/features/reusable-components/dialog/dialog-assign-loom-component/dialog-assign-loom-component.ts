import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { ButtonGeneralActionComponent } from "../../button/button-general-action-component/button-general-action-component";
import { LoomFacadeService } from '../../../../services/loom-facade.service';
import { Arrangement, Loom, Process } from '../../../../api';
import { LoomCardComponent } from "../../loom-card-component/loom-card-component";
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../../loader-component/loader-component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProcessFacadeService } from '../../../../services/process-facade.service';
import { DialogLoomAlertComponent, type DialogLoomAlertData } from '../dialog-loom-alert-component/dialog-loom-alert-component';
import { MatError } from "@angular/material/form-field";
import { LoomItemAssignmentFacadeService } from '../../../../services/loom-item-assignment-facade.service';

export interface DialogAssignLoomData {
  arrangement?: Arrangement | null;
  remainingMetersToAssign?: number;
}

export const TEMPORARY_PROCESS_START_DATE = '1970-01-01T00:00:00.000Z';

@Component({
  selector: 'app-dialog-assign-loom-component',
  imports: [ButtonGeneralActionComponent, FormsModule, LoomCardComponent, MatIcon, LoaderComponent, MatError],
  standalone: true,
  templateUrl: './dialog-assign-loom-component.html',
  styleUrl: './dialog-assign-loom-component.scss',
})
export class DialogAssignLoomComponent implements OnInit {
  private readonly loomService = inject(LoomFacadeService);
  private readonly processService = inject(ProcessFacadeService);
  private readonly assignmentService = inject(LoomItemAssignmentFacadeService);
  private readonly dialog = inject(MatDialog);
  private readonly data = inject<DialogAssignLoomData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly pageSize = 6;

  public readonly looms = signal<Loom[]>([]);
  public readonly currentPage = signal(1);
  public readonly isLoadingLooms = signal(true);
  public readonly remainingMetersToAssign = this.data?.remainingMetersToAssign ?? 0;

  public readonly isProcessing = signal(false);
  public isSavingProcess: boolean = false;
  public process: Process = {
    speed: 0,
    efficiency: 0,
    totalMeters: 0,
    metersRun: 0,
    metersToGo: 0,
    piecesRun: 0,
    totalPieces: 0,
    startDate: TEMPORARY_PROCESS_START_DATE,
    loom: undefined,
    days: undefined,
    expectedEndDate: undefined,
  };

  private readonly dialogRef = inject(MatDialogRef<DialogAssignLoomComponent, Process | false>, { optional: true });

  public get paginatedLooms(): Loom[] {
    const startIndex = (this.currentPage() - 1) * this.pageSize;

    return this.looms().slice(startIndex, startIndex + this.pageSize);
  }

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.looms().length / this.pageSize));
  }

  public get shouldShowPagination(): boolean {
    return this.looms().length > this.pageSize;
  }

  public get isPreviousPageDisabled(): boolean {
    return this.currentPage() <= 1;
  }

  public get isNextPageDisabled(): boolean {
    return this.currentPage() >= this.totalPages;
  }

  public get calculatedTotalPieces(): number {
    const totalMeters = Number(this.process.totalMeters) || 0;
    const metersPerPiece = Number(this.process.metersPerPiece) || 0;

    if (metersPerPiece <= 0) {
      return 0;
    }

    return totalMeters / metersPerPiece;
  }

  public get isTotalMetersOverRemaining(): boolean {
    return Number(this.process.totalMeters) > this.remainingMetersToAssign;
  }

  public get isSpeedBelowMinimum(): boolean {
    return Number(this.process.speed) < 250;
  }

  public get hasActiveMatError(): boolean {
    return this.isTotalMetersOverRemaining || this.isSpeedBelowMinimum;
  }

  ngOnInit(): void {
    this.isProcessing.set(false);
    this.isLoadingLooms.set(true);
    this.setProcessMetersPerPieceFromArrangement();

    this.loomService.getAll().pipe(
      finalize(() => {
        this.isLoadingLooms.set(false);
      }),
    ).subscribe((looms) => {
        this.looms.set(looms);
        this.currentPage.set(1);
      });
  }

  public goToPreviousPage(): void {
    if (this.isPreviousPageDisabled) {
      return;
    }

    this.currentPage.update((page) => page - 1);
  }

  public goToNextPage(): void {
    if (this.isNextPageDisabled) {
      return;
    }

    this.currentPage.update((page) => page + 1);
  }
  public onCloseDialog(): void {
    if (this.isSavingProcess) {
      return;
    }

    this.isProcessing.set(false);
    this.dialogRef?.close(false);
  }

  public onAssignLoom(loom: Loom): void {
    if (loom.status === Loom.StatusEnum.Working && loom.id) {
      this.openBusyLoomAlert(loom);
      return;
    }

    this.openLoomAlert(loom);
  }

  private openBusyLoomAlert(loom: Loom): void {
    this.assignmentService.getRunningAssignmentByLoomId(loom.id ?? '').pipe(
      switchMap((assignment) => assignment.processId
        ? this.processService.getById(assignment.processId)
        : of(null),
      ),
      map((process) => process?.expectedEndDate),
      catchError((error) => {
        console.error('Error loading running process expected end date:', error);
        return of(undefined);
      }),
    ).subscribe((busyUntilDate) => {
      this.openLoomAlert(loom, busyUntilDate);
    });
  }

  private openLoomAlert(loom: Loom, busyUntilDate?: string): void {
    const dialogRef = this.dialog.open<DialogLoomAlertComponent, DialogLoomAlertData, boolean>(
      DialogLoomAlertComponent,
      {
        panelClass: 'loom-alert-dialog-panel',
        autoFocus: false,
        data: {
          loomStatus: loom.status,
          busyUntilDate,
        },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.confirmLoomAssignment(loom);
    });
  }

  private confirmLoomAssignment(loom: Loom): void {
    const assignedLoom: Loom = {
      ...loom,
    };

    this.process.loom = assignedLoom;
    this.isProcessing.set(true);
  }

  public turnBack(): void {
    if (this.isSavingProcess) {
      return;
    }

    this.isProcessing.set(false);
  }

  public onConfirmProcess(form: NgForm): void {
    if (this.isSavingProcess) {
      return;
    }

    if (form.invalid || this.hasActiveMatError || !this.process.loom) {
      form.form.markAllAsTouched();
      return;
    }

    this.isSavingProcess = true;

    this.processService.create(this.createProcessPayload()).subscribe({
      next: (process) => {
        setTimeout(() => {
          this.dialogRef?.close(process);
        }, 1000);
      },
      error: (error) => {
        this.isSavingProcess = false;
        console.error('Error creating process:', error);
      }
    });
  }

  private createProcessPayload(): Process {
    const totalMeters = Number(this.process.totalMeters) || 0;
    const metersRun = Number(this.process.metersRun) || 0;
    const expectedEndDate = this.toApiDateTime(this.process.expectedEndDate);
    const itemHitsPerDm = this.getItemHitsPerDm();

    return {
      speed: Number(this.process.speed) || 0,
      efficiency: Number(this.process.efficiency) || 0,
      totalMeters,
      totalPieces: this.calculatedTotalPieces,
      piecesRun: 0,
      metersPerPiece: this.process.metersPerPiece,
      metersRun: 0,
      metersToGo: Math.max(totalMeters - metersRun, 0),
      startDate: this.toApiDateTime(this.process.startDate) || TEMPORARY_PROCESS_START_DATE,
      loom: this.process.loom,
      ...(itemHitsPerDm !== undefined ? { itemHitsPerDm } : {}),
      ...(expectedEndDate ? { expectedEndDate } : {}),
    };
  }

  private setProcessMetersPerPieceFromArrangement(): void {
    const pieceLength = this.data?.arrangement?.pieceLength;
    const metersPerPiece = Number(pieceLength);

    if (Number.isFinite(metersPerPiece) && metersPerPiece > 0) {
      this.process.metersPerPiece = metersPerPiece;
    }
  }

  private getItemHitsPerDm(): number | undefined {
    const hitsPerDm = this.data?.arrangement?.hitsPerDm;

    if (hitsPerDm === undefined || hitsPerDm === null) {
      return undefined;
    }

    const numericHitsPerDm = Number(hitsPerDm);

    return Number.isFinite(numericHitsPerDm) ? numericHitsPerDm : undefined;
  }

  private toApiDateTime(value: string | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }


}
