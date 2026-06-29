import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from "@angular/material/icon";
import { Item } from '../../../../api';

export interface DialogItemAlertStateData {
  item?: Item | null;
}

export type DialogItemAlertStateResult = Item.StateEnum | false;

@Component({
  selector: 'app-dialog-item-alert-state',
  imports: [MatIcon],
  standalone: true,
  templateUrl: './dialog-item-alert-state.html',
  styleUrl: './dialog-item-alert-state.scss',
})
export class DialogItemAlertState {
  private readonly dialogRef = inject(MatDialogRef<DialogItemAlertState, DialogItemAlertStateResult>, { optional: true });
  private readonly dialogData = inject<DialogItemAlertStateData | null>(MAT_DIALOG_DATA, { optional: true });

  public readonly item = this.dialogData?.item ?? null;
  public readonly itemState = Item.StateEnum;

  public isConfirmed: boolean = false;

  public onConfirm(): void {
    this.isConfirmed = true;
  }

  public onCloseDialog(): void {
    this.dialogRef?.close(false);
  }

  public onSelectState(state: Item.StateEnum): void {
    this.dialogRef?.close(state);
  }


}
