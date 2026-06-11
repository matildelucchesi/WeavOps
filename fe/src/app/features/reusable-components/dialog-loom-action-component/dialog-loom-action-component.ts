import { Component, Input, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Loom } from '../../../api';

export interface DialogLoomActionData {
  loom?: Loom;
  modify?: boolean;
}

@Component({
  selector: 'app-dialog-loom-action-component',
  imports: [
    NgOptimizedImage, 
    MatButtonModule, 
    MatIconModule
  ],
  standalone: true,
  templateUrl: './dialog-loom-action-component.html',
  styleUrl: './dialog-loom-action-component.scss',
})
export class DialogLoomActionComponent {
  private readonly dialogRef = inject(MatDialogRef<DialogLoomActionComponent>, { optional: true });
  private readonly dialogData = inject<DialogLoomActionData | null>(MAT_DIALOG_DATA, { optional: true });

  readonly loom = this.dialogData?.loom ?? null;

  @Input() modify: boolean = this.dialogData?.modify ?? false;

  close(): void {
    this.dialogRef?.close();
  }
}
