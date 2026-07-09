import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Loom } from '../../../api';
import { LoomCardComponent } from "../../reusable-components/loom-card-component/loom-card-component";
import { DialogLoomActionComponent } from '../../reusable-components/dialog/dialog-loom-action-component/dialog-loom-action-component';
import { DialogAddNewLoomComponent } from '../../reusable-components/dialog/dialog-add-new-loom-component/dialog-add-new-loom-component';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { LoomItemAssignmentFacadeService } from '../../../services/loom-item-assignment-facade.service';
import { ProcessFacadeService } from '../../../services/process-facade.service';

@Component({
  imports: [
    MatIconButton,
    MatIcon,
    LoomCardComponent,
    DecorativeLinesComponent,
],
  standalone: true,
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly loomService = inject(LoomFacadeService);
  private readonly assignmentService = inject(LoomItemAssignmentFacadeService);
  private readonly processService = inject(ProcessFacadeService);

  public readonly loomList = signal<Loom[]>([]);
  public readonly loomDaysById = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.loadLoomList();
  }

  public loadLoomList(): void {
    this.loomService.getAll().subscribe({
      next: (looms) => {
        this.loomList.set(looms);
        this.loadWorkingLoomProcessDays(looms);
      },
      error: (err) => {
        console.error('Error loading looms:', err);
        this.loomList.set([]);
        this.loomDaysById.set({});
      },
    });
  }

  public getLoomDays(loom: Loom): string {
    if (!loom.id || loom.status !== Loom.StatusEnum.Working) {
      return '';
    }

    return this.loomDaysById()[loom.id] ?? '';
  }

  private loadWorkingLoomProcessDays(looms: Loom[]): void {
    const workingLooms = looms.filter((loom) => loom.id && loom.status === Loom.StatusEnum.Working);

    if (workingLooms.length === 0) {
      this.loomDaysById.set({});
      return;
    }

    forkJoin(workingLooms.map((loom) => {
      const loomId = loom.id ?? '';

      return this.assignmentService.getRunningAssignmentByLoomId(loomId).pipe(
        switchMap((assignment) => assignment.processId
          ? this.processService.getById(assignment.processId)
          : of(null),
        ),
        map((process) => [loomId, this.formatProcessDays(process?.days)] as const),
        catchError((error) => {
          console.error('Error loading working loom process days:', error);
          return of([loomId, ''] as const);
        }),
      );
    })).subscribe((entries) => {
      this.loomDaysById.set(entries.reduce<Record<string, string>>((accumulator, [loomId, days]) => {
        if (days) {
          accumulator[loomId] = days;
        }

        return accumulator;
      }, {}));
    });
  }

  private formatProcessDays(value: number | undefined): string {
    if (value === undefined || value === null || !Number.isFinite(value)) {
      return '';
    }

    if (value <= 0) {
      return '0m';
    }

    const rawMinutes = value * 24 * 60;

    if (rawMinutes < 1) {
      return '< 1m';
    }

    const totalMinutes = Math.round(rawMinutes);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days}g`);
    }

    if (hours > 0) {
      parts.push(`${hours}h`);
    }

    if (minutes > 0 || parts.length === 0) {
      parts.push(`${minutes}m`);
    }

    return parts.join(' ');
  }

  openLoomActions(loom: Loom): void {
    const dialogRef = this.dialog.open(DialogLoomActionComponent, {
      panelClass: 'loom-action-dialog-panel',
      data: {
        loom,
        modify: false,
      },
    });
    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.loadLoomList();
      }
    });
  }

  openNewLoomDialog(): void {
    const dialogRef = this.dialog.open(DialogAddNewLoomComponent, {
      panelClass: 'add-new-loom-dialog-panel',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadLoomList();
    });
  }
}
