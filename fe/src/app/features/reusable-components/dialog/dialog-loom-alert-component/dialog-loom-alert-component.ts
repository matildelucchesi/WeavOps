import { Component, inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Loom } from '../../../../api/model/loom';
import { LoaderComponent } from '../../loader-component/loader-component';
import { MatIcon } from "@angular/material/icon";

export interface DialogLoomAlertData {
  loomStatus?: Loom.StatusEnum;
}

@Component({
  selector: 'app-dialog-loom-alert-component',
  imports: [LoaderComponent, MatIcon],
  standalone: true,
  templateUrl: './dialog-loom-alert-component.html',
  styleUrl: './dialog-loom-alert-component.scss',
})
export class DialogLoomAlertComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<DialogLoomAlertComponent, boolean>, { optional: true });
  private readonly dialogData = inject<DialogLoomAlertData | null>(MAT_DIALOG_DATA, { optional: true });

  @Input()
  public loomStatus: Loom.StatusEnum = Loom.StatusEnum.Stopped;

  public isLoading: boolean = false;

  ngOnInit(): void {
    this.loomStatus = this.dialogData?.loomStatus ?? this.loomStatus;
  }

  public get alertMessage(): string {
    switch (this.loomStatus) {
      case Loom.StatusEnum.Working:
        return "Il telaio scelto è OCCUPATO con la produzione di un altro articolo, vuoi comunque procedere con l'assegnazione?";
      case Loom.StatusEnum.Maintenance:
        return "Il telaio scelto è in MANUTENZIONE, vuoi comunque procedere con l'assegnazione?";
      case Loom.StatusEnum.Stopped:
        return "Il telaio scelto è FERMO, vuoi comunque procedere con l'assegnazione?";
      default:
        return "Vuoi procedere con l'assegnazione del telaio?";
    }
  }

  public onCloseDialog(): void {
    this.dialogRef?.close(false);
  }

  public onConfirm(): void {
    this.dialogRef?.close(true);
  }
}
