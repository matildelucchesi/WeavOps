import { Component, inject } from '@angular/core';
import { LoomItemAssignment } from '../../../../api';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';

export interface DialogLoomAlertTerminateProductionData {
  assignment?: LoomItemAssignment | null;
}

export interface DialogLoomAlertTerminateProductionResultValue {
  status: LoomItemAssignment.StatusEnum;
  notes: string;
}

export type DialogLoomAlertTerminateProductionResult = DialogLoomAlertTerminateProductionResultValue | false;

@Component({
  selector: 'app-dialog-loom-alert-terminate-production',
  imports: [MatIcon, FormsModule],
  standalone: true,
  templateUrl: './dialog-loom-alert-terminate-production.html',
  styleUrl: './dialog-loom-alert-terminate-production.scss',
})

export class DialogLoomAlertTerminateProduction {
  private readonly dialogRef = inject(MatDialogRef<DialogLoomAlertTerminateProduction, DialogLoomAlertTerminateProductionResult>, { optional: true });
  private readonly dialogData = inject<DialogLoomAlertTerminateProductionData | null>(MAT_DIALOG_DATA, { optional: true });

  public readonly assignment = this.dialogData?.assignment ?? null;
  public readonly state = LoomItemAssignment.StatusEnum;

  public isConfirmed: boolean = false;
  public notes = '';

  public onConfirm(): void {
    this.isConfirmed = true;
  }

  public onCloseDialog(): void {
    this.dialogRef?.close(false);
  }

  public onSelectState(status: LoomItemAssignment.StatusEnum): void {
    this.dialogRef?.close({ status, notes: this.notes.trim() });
  }

}
