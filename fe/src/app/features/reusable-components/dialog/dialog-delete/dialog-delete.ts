import { Component, OnDestroy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import type { Observable } from 'rxjs';
import { LoaderComponent } from '../../loader-component/loader-component';

export interface DialogDeleteData<T = unknown> {
  title?: string;
  message?: string;
  item?: T;
  itemName?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  deleteItem?: (item: T) => Observable<unknown>;
}

@Component({
  selector: 'app-dialog-delete',
  imports: [LoaderComponent, MatSnackBarModule],
  templateUrl: './dialog-delete.html',
  styleUrl: './dialog-delete.scss',
  standalone: true,
})
export class DialogDelete implements OnDestroy {
  private readonly loaderDurationMs: number = 2000;
  private readonly dialogRef = inject(MatDialogRef<DialogDelete, boolean>, { optional: true });
  private readonly data = inject<DialogDeleteData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly snackBar = inject(MatSnackBar);
  private deleteStartedAt: number = 0;
  private loaderTimeoutId: ReturnType<typeof setTimeout> | null = null;

  public readonly title: string = this.data?.title ?? 'Elimina elemento';
  public readonly cancelLabel: string = this.data?.cancelLabel ?? 'Annulla';
  public readonly confirmLabel: string = this.data?.confirmLabel ?? 'Conferma';
  public readonly message: string = this.resolveMessage();
  public isDeleting: boolean = false;

  public ngOnDestroy(): void {
    if (this.loaderTimeoutId) {
      clearTimeout(this.loaderTimeoutId);
    }
  }

  public close(): void {
    if (this.isDeleting) {
      return;
    }

    this.dialogRef?.close(false);
  }

  public confirm(): void {
    if (this.isDeleting) {
      return;
    }

    if (!this.data?.deleteItem) {
      this.dialogRef?.close(true);
      return;
    }

    this.isDeleting = true;
    this.deleteStartedAt = Date.now();

    try {
      this.data.deleteItem(this.data.item).subscribe({
        next: () => {
          this.runAfterLoaderDuration(() => {
            this.snackBar.open(this.data?.successMessage ?? 'Elemento eliminato con successo', 'Chiudi', {
              duration: 2000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            });
            this.dialogRef?.close(true);
          });
        },
        error: (err) => {
          this.handleDeleteError(err);
        },
      });
    } catch (err) {
      this.handleDeleteError(err);
    }
  }

  private resolveMessage(): string {
    if (this.data?.message) {
      return this.data.message;
    }

    if (this.data?.itemName) {
      return `Vuoi eliminare ${this.data.itemName}?`;
    }

    return "Vuoi eliminare l'elemento selezionato?";
  }

  private handleDeleteError(err: unknown): void {
    this.runAfterLoaderDuration(() => this.showDeleteError(err));
  }

  private showDeleteError(err: unknown): void {
    this.isDeleting = false;
    console.error("Errore durante l'eliminazione:", err);

    const apiErrorMessage = this.isRecord(err) && this.isRecord(err['error'])
      ? err['error']['message']
      : undefined;
    const errorMessage = typeof apiErrorMessage === 'string'
      ? apiErrorMessage
      : this.data?.errorMessage ?? "Errore durante l'eliminazione dell'elemento";

    this.snackBar.open(errorMessage, 'Chiudi', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }

  private runAfterLoaderDuration(callback: () => void): void {
    const elapsedMs = Date.now() - this.deleteStartedAt;
    const remainingMs = Math.max(this.loaderDurationMs - elapsedMs, 0);

    if (this.loaderTimeoutId) {
      clearTimeout(this.loaderTimeoutId);
    }

    this.loaderTimeoutId = setTimeout(() => {
      this.loaderTimeoutId = null;
      callback();
    }, remainingMs);
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object');
  }

}
