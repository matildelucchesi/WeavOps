import { Component, Input, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Loom } from '../../../api';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoomFacadeService } from '../../../services/loom-facade.service';

export interface DialogLoomActionData {
  loom?: Loom;
  modify?: boolean;
}

@Component({
  selector: 'app-dialog-loom-action-component',
  imports: [
    NgOptimizedImage,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
],
  standalone: true,
  templateUrl: './dialog-loom-action-component.html',
  styleUrl: './dialog-loom-action-component.scss',
})
export class DialogLoomActionComponent {
  private readonly dialogRef = inject(MatDialogRef<DialogLoomActionComponent>, { optional: true });
  private readonly dialogData = inject<DialogLoomActionData | null>(MAT_DIALOG_DATA, { optional: true });
  private loomService = inject(LoomFacadeService);

  readonly loom = this.dialogData?.loom ?? null;
  public readonly loomStatus = Loom.StatusEnum;

  public change: boolean = false;
  public meters: boolean = false;
  public loomState: Loom.StatusEnum = this.loom?.status ?? Loom.StatusEnum.Stopped;

  @Input() modify: boolean = this.dialogData?.modify ?? false;

  close(): void {
    this.dialogRef?.close();
  }

  openChangeState(): void {
    this.change = true;
  }

  openMeters(): void {
    this.meters = true;
  }

  goBack(): void {
    this.change = false;
    this.meters = false;
  }

  setLoomState(state: Loom.StatusEnum): void {
    this.loomState = state;
  }

  changeLoomState(): void {
    if (!this.loom) {
      console.error('Loom data is missing');
      return;
    }

    if (!this.loom.id) {
      console.error('Loom id is missing');
      return;
    }

    const updatedLoom: Loom = {
      ...this.loom,
      status: this.loomState,
    };

    this.loomService.update(this.loom.id, updatedLoom).subscribe({
      next: () => {
        console.log('Loom state updated successfully');
        this.dialogRef?.close(true);
      },
      error: (err) => {
        console.error('Error updating loom state:', err);
      }
    });
  }
}
