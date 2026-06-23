import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { InputComponent } from '../input-component/input-component';
import { Loom } from '../../../api';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dialog-add-new-loom-component',
  imports: [
    MatButtonModule,
    MatSnackBarModule,
    InputComponent
  ],
  standalone: true,
  templateUrl: './dialog-add-new-loom-component.html',
  styleUrl: './dialog-add-new-loom-component.scss',
})
export class DialogAddNewLoomComponent {


  private loomService = inject(LoomFacadeService);
  private snackBar = inject(MatSnackBar);

  private readonly dialogRef = inject(MatDialogRef<DialogAddNewLoomComponent>, { optional: true });

  public serialNumber: string = '';
  public isSaving: boolean = false;

  public updateSerialNumber(value: string): void {
    this.serialNumber = value;
  }

  public addNewLoom(): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    const loom: Loom = {
      serialNumber: '',
      status: Loom.StatusEnum.Stopped,
      isAssigned: false,
    };
    loom.serialNumber = this.serialNumber;
    loom.isAssigned = false;
    this.loomService.create(loom).subscribe({
      next: () => {
        console.log('Loom created successfully');
        this.snackBar.open('Telaio creato con successo', 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
        this.serialNumber = '';
        this.dialogRef?.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving = false;
        console.error('Error creating loom:', err);
        const errorMessage = err.error?.message ?? 'Errore durante la creazione del telaio';
        this.snackBar.open(errorMessage, 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  public close(): void {
    if (this.isSaving) {
      return;
    }

    this.dialogRef?.close(false);
  }

}
