import { FabricCompletionFields } from '../../fabric-completion-fields/fabric-completion-fields';
import { Component, inject, ViewChild } from '@angular/core';
import { LoomItemAssignment, Item, Process, Arrangement } from '../../../../api';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from "@angular/material/icon";
import { FormsModule } from '@angular/forms';

export interface DialogLoomAlertTerminateProductionData {
  assignment?: LoomItemAssignment | null;
  item?: Item | null;
  process?: Process | null;
  arrangement?: Arrangement | null;
  selectedStatus?: LoomItemAssignment.StatusEnum;
}

export interface DialogLoomAlertTerminateProductionResultValue {
  status: LoomItemAssignment.StatusEnum;
  notes: string;
  fabricCode?: string;
  fabricCertificationId?: string;
}

export type DialogLoomAlertTerminateProductionResult = DialogLoomAlertTerminateProductionResultValue | false;

@Component({
  selector: 'app-dialog-loom-alert-terminate-production',
  imports: [MatIcon, FormsModule, FabricCompletionFields],
  standalone: true,
  templateUrl: './dialog-loom-alert-terminate-production.html',
  styleUrl: './dialog-loom-alert-terminate-production.scss',
})

export class DialogLoomAlertTerminateProduction {
  private readonly dialogRef = inject(MatDialogRef<DialogLoomAlertTerminateProduction, DialogLoomAlertTerminateProductionResult>, { optional: true });
  private readonly dialogData = inject<DialogLoomAlertTerminateProductionData | null>(MAT_DIALOG_DATA, { optional: true });

  public readonly assignment = this.dialogData?.assignment ?? null;
  public readonly state = LoomItemAssignment.StatusEnum;

  @ViewChild(FabricCompletionFields) private fabricFields?: FabricCompletionFields;
  public readonly item = this.dialogData?.item ?? null;
  public readonly process = this.dialogData?.process ?? null;
  public readonly arrangement = this.dialogData?.arrangement ?? null;
  public readonly selectedStatus = this.dialogData?.selectedStatus;
  public isConfirmed: boolean = Boolean(this.selectedStatus);
  public notes = '';

  public onConfirm(): void {
    this.isConfirmed = true;
  }

  public onCloseDialog(): void {
    this.dialogRef?.close(false);
  }

  public onSelectState(status: LoomItemAssignment.StatusEnum): void {
    if (!this.fabricFields?.validate()) return;
    this.dialogRef?.close({ status, notes: this.notes.trim(), fabricCode: this.fabricFields.code.trim(), fabricCertificationId: this.fabricFields.certificationId });
  }

}
