import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Item, Loom, Process } from '../../../../api';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoomFacadeService } from '../../../../services/loom-facade.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { LoomItemAssignmentFacadeService } from '../../../../services/loom-item-assignment-facade.service';
import { ItemFacadeService } from '../../../../services/item-facade.service';
import { ProcessFacadeService } from '../../../../services/process-facade.service';
import {
  DialogAlertGeneric,
  type DialogAlertGenericData,
} from '../dialog-alert-generic/dialog-alert-generic';

interface ProductionContext {
  item: Item;
  process: Process;
}

export interface DialogLoomActionData {
  loom?: Loom;
  item?: Item | null;
  process?: Process | null;
  modify?: boolean;
  initialView?: 'meters';
}

@Component({
  selector: 'app-dialog-loom-action-component',
  imports: [
    NgOptimizedImage,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    FormsModule,
],
  standalone: true,
  templateUrl: './dialog-loom-action-component.html',
  styleUrl: './dialog-loom-action-component.scss',
})
export class DialogLoomActionComponent {
  private readonly dialogRef = inject(MatDialogRef<DialogLoomActionComponent>, { optional: true });
  private readonly dialogData = inject<DialogLoomActionData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialog = inject(MatDialog);
  private loomService = inject(LoomFacadeService);
  private readonly assignmentService = inject(LoomItemAssignmentFacadeService);
  private readonly itemService = inject(ItemFacadeService);
  private readonly processService = inject(ProcessFacadeService);
  private snackBar = inject(MatSnackBar);

  readonly loom = this.dialogData?.loom ?? null;
  readonly item = this.dialogData?.item ?? null;
  readonly process = this.dialogData?.process ?? null;
  public readonly loomStatus = Loom.StatusEnum;
  public readonly isInitialMetersView = this.dialogData?.initialView === 'meters';

  public change: boolean = false;
  public meters: boolean = this.isInitialMetersView;
  public serialNumberChange: boolean = false;
  public loomState: Loom.StatusEnum = this.loom?.status ?? Loom.StatusEnum.Stopped;
  public serialNumber: string = this.loom?.serialNumber ?? '';
  public piecesProduced: number | null = null;
  public isAddingPieces: boolean = false;

  @Input() modify: boolean = this.dialogData?.modify ?? false;

  close(): void {
    this.dialogRef?.close();
  }

  openChangeState(): void {
    this.loomState = this.loom?.status ?? Loom.StatusEnum.Stopped;
    this.meters = false;
    this.serialNumberChange = false;
    this.change = true;
  }

  openChangeSerialNumber(): void {
    this.serialNumber = this.loom?.serialNumber ?? '';
    this.change = false;
    this.meters = false;
    this.serialNumberChange = true;
  }

  public isCurrentState(state: Loom.StatusEnum): boolean {
    return this.loom?.status === state;
  }

  openMeters(): void {
    this.change = false;
    this.serialNumberChange = false;
    this.meters = true;
  }

  isLoomArrangementActionDisabled(): boolean {
    return this.loom?.isAssigned === false;
  }

  goBack(): void {
    this.change = false;
    this.meters = false;
    this.serialNumberChange = false;
  }

  setLoomState(state: Loom.StatusEnum): void {
    this.loomState = state;
  }

  setSerialNumber(event: Event): void {
    this.serialNumber = (event.target as HTMLInputElement).value;
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

  changeSerialNumber(): void {
    if (!this.loom) {
      console.error('Loom data is missing');
      return;
    }

    if (!this.loom.id) {
      console.error('Loom id is missing');
      return;
    }

    const serialNumber = this.serialNumber.trim();

    if (!serialNumber) {
      console.error('Serial number is empty');
      return;
    }

    this.loomService.getAll().subscribe({
      next: (looms) => {
        const hasDuplicateSerialNumber = looms.some((loom) =>
          loom.id !== this.loom?.id &&
          this.normalizeSerialNumber(loom.serialNumber) === this.normalizeSerialNumber(serialNumber)
        );

        if (hasDuplicateSerialNumber) {
          this.showErrorSnackbar('Numero seriale già presente');
          return;
        }

        this.updateLoomSerialNumber(serialNumber);
      },
      error: (err) => {
        console.error('Error checking loom serial number:', err);
        this.showErrorSnackbar('Errore durante il controllo del numero seriale');
      }
    });
  }

  private updateLoomSerialNumber(serialNumber: string): void {
    if (!this.loom?.id) {
      return;
    }

    const updatedLoom: Loom = {
      ...this.loom,
      serialNumber,
    };

    this.loomService.update(this.loom.id, updatedLoom).subscribe({
      next: () => {
        console.log('Loom serial number updated successfully');
        this.dialogRef?.close(true);
      },
      error: (err) => {
        console.error('Error updating loom serial number:', err);
        this.showErrorSnackbar('Errore durante la modifica del numero seriale');
      }
    });
  }

  private normalizeSerialNumber(serialNumber: string | undefined): string {
    return (serialNumber ?? '').trim().toLowerCase();
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }

  public openProductionPage(): void {
    if (!this.loom) {
      console.error('Loom data is missing');
      return;
    }

    if (!this.loom.id) {
      console.error('Loom id is missing');
      return;
    }

    const loomId = this.loom.id;
    const url = `/dettaglio-produzione/${loomId}`;
    window.location.href = url;
  }

  public addPieces(): void {
    if (this.isAddingPieces) {
      return;
    }

    const piecesProduced = this.getValidPiecesProduced();

    if (piecesProduced === null) {
      return;
    }

    if (!this.hasValidLoom()) {
      return;
    }

    this.isAddingPieces = true;
    this.resolveProductionContext().subscribe({
      next: (productionContext) => {
        if (this.shouldShowOverproductionAlert(piecesProduced, productionContext)) {
          this.isAddingPieces = false;
          this.openOverproductionAlert(piecesProduced);
          return;
        }

        this.confirmAddPieces(piecesProduced);
      },
      error: (error) => {
        this.isAddingPieces = false;
        console.error('Error checking overproduction:', error);
        this.showErrorSnackbar('Errore durante il controllo delle pezze prodotte');
      },
    });
  }

  private getValidPiecesProduced(): number | null {
    const piecesProduced = Number(this.piecesProduced);

    if (Number.isInteger(piecesProduced) && piecesProduced > 0) {
      return piecesProduced;
    }

    console.error('Invalid number of pieces produced');
    this.showErrorSnackbar('Inserisci un numero di pezze valido');
    return null;
  }

  private hasValidLoom(): boolean {
    if (!this.loom) {
      console.error('Loom data is missing');
      return false;
    }

    if (!this.loom.id) {
      console.error('Loom id is missing');
      return false;
    }

    return true;
  }

  private resolveProductionContext(): Observable<ProductionContext | null> {
    if (this.item && this.process) {
      return of({
        item: this.item,
        process: this.process,
      });
    }

    if (!this.loom?.id) {
      return of(null);
    }

    return this.assignmentService.getRunningAssignmentByLoomId(this.loom.id).pipe(
      switchMap((assignment) => {
        if (!assignment?.itemId || !assignment?.processId) {
          return of(null);
        }

        return forkJoin({
          item: this.itemService.getById(assignment.itemId),
          process: this.processService.getById(assignment.processId),
        });
      }),
      map((productionContext) => productionContext ?? null),
      catchError((error) => {
        console.error('Error loading production context:', error);
        return of(null);
      }),
    );
  }

  private shouldShowOverproductionAlert(
    piecesProduced: number,
    productionContext: ProductionContext | null,
  ): boolean {
    const totalMeters = Number(productionContext?.item.totalMeters);
    const metersRun = Number(productionContext?.item.metersRun ?? 0);
    const metersPerPiece = Number(productionContext?.process.metersPerPiece);

    if (
      !Number.isFinite(totalMeters)
      || !Number.isFinite(metersRun)
      || !Number.isFinite(metersPerPiece)
      || totalMeters <= 0
      || metersPerPiece <= 0
    ) {
      return false;
    }

    return metersRun + (piecesProduced * metersPerPiece) > totalMeters;
  }

  private openOverproductionAlert(piecesProduced: number): void {
    const dialogRef = this.dialog.open<
      DialogAlertGeneric,
      DialogAlertGenericData,
      boolean
    >(DialogAlertGeneric, {
      panelClass: 'loom-alert-dialog-panel',
      autoFocus: false,
      data: {
        text: 'Pezze oltre il necessario',
        subtext: 'Le pezze inserite superano quelle necessarie per completare l\'articolo. Se procedi, verranno comunque aggiunte al numero di pezze prodotte.',
        icon: 'warning',
        iconColor: 'warning',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.confirmAddPieces(piecesProduced);
    });
  }

  private confirmAddPieces(piecesProduced: number): void {
    if (!this.loom?.id) {
      this.isAddingPieces = false;
      return;
    }

    this.isAddingPieces = true;

    this.loomService.addPieces(this.loom.id, piecesProduced).subscribe({
      next: () => {
        console.log('Pieces added successfully');
        this.dialogRef?.close(true);
      },
      error: (err) => {
        this.isAddingPieces = false;
        console.error('Error adding pieces:', err);
        this.showErrorSnackbar('Errore durante l\'aggiunta delle pezze');
      }
    });
  }
}
