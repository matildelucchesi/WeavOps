import { Component, inject, Input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogInformativeData {
  title: string;
  message: string;
  icon: string;
}

@Component({
  selector: 'app-dialog-informative',
  imports: [MatIcon],
  standalone: true,
  templateUrl: './dialog-informative-component.html',
  styleUrl: './dialog-informative-component.scss',
})
export class DialogInformativeComponent {
  private readonly dialogRef = inject(MatDialogRef<DialogInformativeComponent>, { optional: true });
  private readonly data = inject<DialogInformativeData | null>(MAT_DIALOG_DATA, { optional: true });

  @Input() icon: string = this.data?.icon ?? 'info';
  @Input() title: string = this.data?.title ?? '';
  @Input() message: string = this.data?.message ?? '';

  public close(): void {
    this.dialogRef?.close();
  }
}
