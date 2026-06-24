import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ButtonGeneralActionComponent } from "../button-general-action-component/button-general-action-component";
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { Loom } from '../../../api';
import { LoomCardComponent } from "../loom-card-component/loom-card-component";
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../loader-component/loader-component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-assign-loom-component',
  imports: [ButtonGeneralActionComponent, LoomCardComponent, MatIcon, LoaderComponent],
  standalone: true,
  templateUrl: './dialog-assign-loom-component.html',
  styleUrl: './dialog-assign-loom-component.scss',
})
export class DialogAssignLoomComponent implements OnInit {
  
  private readonly loomService = inject(LoomFacadeService);
  private readonly pageSize = 6;

  public readonly looms = signal<Loom[]>([]);
  public readonly currentPage = signal(1);
  public readonly isLoadingLooms = signal(true);

  private readonly dialogRef = inject(MatDialogRef<DialogAssignLoomComponent>, { optional: true });

  public get paginatedLooms(): Loom[] {
    const startIndex = (this.currentPage() - 1) * this.pageSize;

    return this.looms().slice(startIndex, startIndex + this.pageSize);
  }

  public get totalPages(): number {
    return Math.max(1, Math.ceil(this.looms().length / this.pageSize));
  }

  public get shouldShowPagination(): boolean {
    return this.looms().length > this.pageSize;
  }

  public get isPreviousPageDisabled(): boolean {
    return this.currentPage() <= 1;
  }

  public get isNextPageDisabled(): boolean {
    return this.currentPage() >= this.totalPages;
  }

  ngOnInit(): void {
    this.isLoadingLooms.set(true);

    this.loomService.getAll().pipe(
      finalize(() => {
        this.isLoadingLooms.set(false);
      }),
    ).subscribe((looms) => {
        this.looms.set(looms);
        this.currentPage.set(1);
      });
  }

  public goToPreviousPage(): void {
    if (this.isPreviousPageDisabled) {
      return;
    }

    this.currentPage.update((page) => page - 1);
  }

  public goToNextPage(): void {
    if (this.isNextPageDisabled) {
      return;
    }

    this.currentPage.update((page) => page + 1);
  }
  public onCloseDialog(): void {
    
    this.dialogRef?.close(false);
  }

}
