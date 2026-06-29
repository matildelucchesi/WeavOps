import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize } from 'rxjs';
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

export interface DialogAssignLoomData {
  arrangement?: Arrangement | null;
}

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
  private readonly dialog = inject(MatDialog);
  private readonly data = inject<DialogAssignLoomData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly pageSize = 6;

  public readonly looms = signal<Loom[]>([]);
  public readonly currentPage = signal(1);
  public readonly isLoadingLooms = signal(true);

  public readonly isProcessing = signal(false);
  public isSavingProcess: boolean = false;
  public process: Process = {
    speed: 0,
    efficiency: 0,
    totalMeters: 0,
    metersRun: 0,
    metersToGo: 0,
    startDate: '',
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

  ngOnInit(): void {
    this.isProcessing.set(false);
    this.isLoadingLooms.set(true);

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
    const dialogRef = this.dialog.open<DialogLoomAlertComponent, DialogLoomAlertData, boolean>(
      DialogLoomAlertComponent,
      {
        panelClass: 'loom-alert-dialog-panel',
        autoFocus: false,
        data: {
          loomStatus: loom.status,
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

    if (form.invalid || !this.process.loom) {
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
      metersRun: 0,
      metersToGo: Math.max(totalMeters - metersRun, 0),
      startDate: this.toApiDateTime(this.process.startDate),
      loom: this.process.loom,
      ...(itemHitsPerDm !== undefined ? { itemHitsPerDm } : {}),
      ...(expectedEndDate ? { expectedEndDate } : {}),
    };
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
