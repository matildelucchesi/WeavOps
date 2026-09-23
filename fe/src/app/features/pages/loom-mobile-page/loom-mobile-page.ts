import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Arrangement, Item, Loom, LoomItemAssignment, Process } from '../../../api';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { LoomItemAssignmentFacadeService } from '../../../services/loom-item-assignment-facade.service';
import { ProcessFacadeService } from '../../../services/process-facade.service';
import {
  DialogAlertGeneric,
  type DialogAlertGenericData,
} from '../../reusable-components/dialog/dialog-alert-generic/dialog-alert-generic';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';

interface ProductionContext {
  item: Item;
  process: Process;
  arrangement: Arrangement;
}

interface QueuedProductionRow {
  assignment: LoomItemAssignment;
  itemName: string;
  metersToGo: string;
  completionDays: string;
  status: string;
}

interface MobileProductionSummary {
  itemName: string;
  remainingPieces: string;
  loomPiecesRun: string;
}

type MobileAction = 'change-state' | 'add-pieces' | 'end-production' | 'start-production';

@Component({
  selector: 'app-loom-mobile-page',
  standalone: true,
  imports: [FormsModule, MatIcon, LoaderComponent],
  templateUrl: './loom-mobile-page.html',
  styleUrl: './loom-mobile-page.scss',
})
export class LoomMobilePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loomService = inject(LoomFacadeService);
  private readonly assignmentService = inject(LoomItemAssignmentFacadeService);
  private readonly itemService = inject(ItemFacadeService);
  private readonly processService = inject(ProcessFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  public changeState: boolean = false;
  public addPieces: boolean = false;
  public endProduction: boolean = false;
  public startProduction: boolean = false;
  public readonly loomStatus = Loom.StatusEnum;
  public readonly assignmentStatus = LoomItemAssignment.StatusEnum;
  public loomState: Loom.StatusEnum = Loom.StatusEnum.Stopped;
  public isChangingLoomState: boolean = false;
  public meters: number | null = null;
  public isAddingMeters: boolean = false;
  public isRefreshingMobileData: boolean = false;
  public isTerminatingProduction: boolean = false;
  public isQueueLoading: boolean = false;
  public isStartingProduction: boolean = false;

  public readonly loom = signal<Loom | null>(null);
  public readonly queuedProductions = signal<QueuedProductionRow[]>([]);
  public readonly productionSummary = signal<MobileProductionSummary | null>(null);
  public readonly pageTitle = computed(() => {
    const serialNumber = this.loom()?.serialNumber;

    return serialNumber
      ? `Cosa vuoi fare per Telaio ${serialNumber}?`
      : 'Cosa vuoi fare per Telaio?';
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const loomId = params.get('id');

      this.applyAction(this.parseAction(params.get('action')));

      if (loomId) {
        this.refreshLoomData(loomId);
      }
    });
  }

  private refreshLoomData(loomId: string): void {
    this.loomService.getById(loomId).subscribe({
      next: (loom) => {
        this.loom.set(loom);
        if (this.changeState) {
          this.loomState = loom.status ?? Loom.StatusEnum.Stopped;
        }
        if (this.startProduction) {
          this.loadQueuedProductions();
        }
        this.loadProductionSummary(loom.id ?? loomId);
      },
      error: (error) => {
        console.error('Errore durante il caricamento del telaio:', error);
      },
    });
  }

  public changeStateTrue(){
    this.loomState = this.loom()?.status ?? Loom.StatusEnum.Stopped;
    this.openAction('change-state');
  }

  public returnToActionSelection(): void {
    const loomId = this.loom()?.id ?? this.route.snapshot.paramMap.get('id');

    if (!loomId) {
      this.resetActionSelection();
      return;
    }

    void this.router.navigate(['/telaio', loomId, 'mobile'], {
      replaceUrl: true,
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }

  private resetActionSelection(): void {
    this.changeState = false;
    this.addPieces = false;
    this.endProduction = false;
    this.startProduction = false;
    this.meters = null;
  }

  private openAction(action: MobileAction): void {
    const loomId = this.loom()?.id ?? this.route.snapshot.paramMap.get('id');

    if (!loomId) {
      return;
    }

    void this.router.navigate(['/telaio', loomId, 'mobile', action], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }

  private parseAction(action: string | null): MobileAction | null {
    return action === 'change-state' || action === 'add-pieces' || action === 'end-production' || action === 'start-production'
      ? action
      : null;
  }

  private applyAction(action: MobileAction | null): void {
    this.resetActionSelection();

    if (action === 'change-state') {
      this.loomState = this.loom()?.status ?? Loom.StatusEnum.Stopped;
      this.changeState = true;
    } else if (action === 'add-pieces') {
      this.addPieces = true;
    } else if (action === 'end-production') {
      this.endProduction = true;
    } else if (action === 'start-production') {
      this.startProduction = true;
      this.loadQueuedProductions();
    }
  }

  public isCurrentState(state: Loom.StatusEnum): boolean {
    return this.loom()?.status === state;
  }

  public setLoomState(state: Loom.StatusEnum): void {
    this.loomState = state;
  }

  public changeLoomState(): void {
    const currentLoom = this.loom();

    if (!currentLoom?.id || this.isChangingLoomState) {
      return;
    }

    this.isChangingLoomState = true;
    const updatedLoom: Loom = {
      ...currentLoom,
      status: this.loomState,
    };

    this.loomService.update(currentLoom.id, updatedLoom).subscribe({
      next: (loom) => {
        this.loom.set(loom);
        this.isChangingLoomState = false;
        this.returnToActionSelection();
      },
      error: (error) => {
        console.error('Errore durante l’aggiornamento dello stato del telaio:', error);
        this.isChangingLoomState = false;
      },
    });
  }

  public addPiecesTrue() {
    this.openAction('add-pieces');
  }

  public addMeters(): void {
    if (this.isAddingMeters) {
      return;
    }

    const piecesProduced = Number(this.meters);

    if (!Number.isInteger(piecesProduced) || piecesProduced <= 0) {
      this.showErrorSnackbar('Inserisci un numero di pezze valido');
      return;
    }

    const loom = this.loom();

    if (!loom?.id) {
      this.showErrorSnackbar('Telaio non disponibile');
      return;
    }

    const loomId = loom.id;
    this.isAddingMeters = true;
    this.resolveProductionContext(loomId).subscribe({
      next: (productionContext) => {
        if (this.shouldShowOverproductionAlert(piecesProduced, productionContext)) {
          this.isAddingMeters = false;
          this.openOverproductionAlert(piecesProduced);
          return;
        }

        this.confirmAddMeters(loomId, piecesProduced);
      },
      error: (error) => {
        console.error('Errore durante il controllo delle pezze prodotte:', error);
        this.isAddingMeters = false;
        this.showErrorSnackbar('Errore durante il controllo delle pezze prodotte');
      },
    });
  }

  private resolveProductionContext(loomId: string): Observable<ProductionContext | null> {
    return this.assignmentService.getRunningAssignmentByLoomId(loomId).pipe(
      switchMap((assignment) => {
        if (!assignment?.itemId || !assignment.processId) {
          return of(null);
        }

        const itemId = assignment.itemId;
        const processId = assignment.processId;

        return this.itemService.getById(itemId).pipe(
          switchMap((item) => {
            if (!item.arrangementId) {
              return of(null);
            }

            return forkJoin({
              item: of(item),
              process: this.processService.getById(processId),
              arrangement: this.arrangementService.getById(item.arrangementId),
            });
          }),
        );
      }),
      map((productionContext) => productionContext ?? null),
      catchError((error) => {
        console.error('Errore durante il caricamento della produzione:', error);
        return of(null);
      }),
    );
  }

  private shouldShowOverproductionAlert(
    piecesProduced: number,
    productionContext: ProductionContext | null,
  ): boolean {
    const totalPieces = Number(productionContext?.arrangement.piecesCount);
    const piecesRun = productionContext?.item.processing?.reduce(
      (total, process) => total + Number(process.piecesRun ?? 0),
      0,
    ) ?? Number.NaN;

    if (
      !Number.isFinite(totalPieces)
      || !Number.isFinite(piecesRun)
      || totalPieces <= 0
    ) {
      return false;
    }

    return piecesRun + piecesProduced > totalPieces;
  }

  private openOverproductionAlert(piecesProduced: number): void {
    const dialogRef = this.dialog.open<DialogAlertGeneric, DialogAlertGenericData, boolean>(DialogAlertGeneric, {
      panelClass: 'loom-alert-dialog-panel',
      autoFocus: false,
      data: {
        text: 'Pezze oltre il necessario',
        subtext: "Le pezze inserite, sommate a quelle già prodotte, superano il numero previsto per l'articolo. Se procedi, verranno comunque aggiunte al numero di pezze prodotte.",
        icon: 'warning',
        iconColor: 'warning',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      const loomId = this.loom()?.id;

      if (!confirmed || !loomId) {
        return;
      }

      this.confirmAddMeters(loomId, piecesProduced);
    });
  }

  private confirmAddMeters(loomId: string, piecesProduced: number): void {
    this.isAddingMeters = true;
    this.isRefreshingMobileData = true;

    this.loomService.addPieces(loomId, piecesProduced).subscribe({
      next: () => {
        this.isAddingMeters = false;
        this.returnToActionSelection();
        setTimeout(() => window.location.reload(), 500);
      },
      error: (error) => {
        console.error("Errore durante l'aggiunta delle pezze:", error);
        this.isAddingMeters = false;
        this.isRefreshingMobileData = false;
        this.showErrorSnackbar("Errore durante l'aggiunta delle pezze");
      },
    });
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }

  public endProductionTrue() {
    this.openAction('end-production');
  }

  public terminateProduction(status: LoomItemAssignment.StatusEnum): void {
    const loomId = this.loom()?.id;

    if (!loomId || this.isTerminatingProduction) {
      return;
    }

    this.isTerminatingProduction = true;
    this.assignmentService.getRunningAssignmentByLoomId(loomId).pipe(
      switchMap((assignment) => {
        if (!assignment?.id) {
          throw new Error('Nessuna produzione attiva trovata per questo telaio');
        }

        return this.assignmentService.update(assignment.id, {
          ...assignment,
          status,
        });
      }),
    ).subscribe({
      next: () => {
        this.isTerminatingProduction = false;
        this.loadProductionSummary(loomId);
        this.returnToActionSelection();
        this.snackBar.open('Produzione terminata con successo', 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      },
      error: (error) => {
        console.error('Errore durante la terminazione della produzione:', error);
        this.isTerminatingProduction = false;
        this.showErrorSnackbar('Impossibile terminare la produzione');
      },
    });
  }

  public startProductionTrue() {
    this.openAction('start-production');
  }

  public viewLoomLogs(): void {
    const loomId = this.loom()?.id ?? this.route.snapshot.paramMap.get('id');

    if (loomId) {
      void this.router.navigate(['/telaio', loomId, 'mobile', 'logs'], {
        queryParamsHandling: 'preserve',
        preserveFragment: true,
      });
    }
  }

  private loadQueuedProductions(): void {
    const loomId = this.loom()?.id;

    if (!loomId) {
      this.queuedProductions.set([]);
      return;
    }

    this.isQueueLoading = true;
    this.assignmentService.getByLoomId(loomId).subscribe({
      next: (assignments) => {
        const queuedAssignments = assignments.filter(
          (assignment) => assignment.status === LoomItemAssignment.StatusEnum.Queued,
        );

        if (queuedAssignments.length === 0) {
          this.queuedProductions.set([]);
          this.isQueueLoading = false;
          return;
        }

        this.queuedProductions.set([]);
        queuedAssignments.forEach((assignment) => {
          this.buildQueuedProductionRow(assignment).subscribe({
            next: (row) => {
              if (row) {
                this.queuedProductions.update((rows) => [...rows, row]);
              }
              this.isQueueLoading = false;
            },
            error: (error) => {
              console.error('Errore durante il caricamento di una produzione in coda:', error);
              this.isQueueLoading = false;
            },
          });
        });
      },
      error: (error) => {
        console.error('Errore durante il caricamento della coda:', error);
        this.queuedProductions.set([]);
        this.isQueueLoading = false;
      },
    });
  }

  private buildQueuedProductionRow(assignment: LoomItemAssignment): Observable<QueuedProductionRow | null> {
    if (!assignment.itemId) {
      return of(null);
    }

    return this.itemService.getById(assignment.itemId).pipe(
      switchMap((item) => {
        const process = assignment.processId
          ? this.processService.getById(assignment.processId).pipe(catchError(() => of(null)))
          : of(item.processing?.find((itemProcess) => itemProcess.id === assignment.processId) ?? null);
        const arrangement = item.arrangementId
          ? this.arrangementService.getById(item.arrangementId).pipe(catchError(() => of(null)))
          : of(null);

        return forkJoin({ process, arrangement }).pipe(
          map(({ process, arrangement }) => ({
            assignment,
            itemName: arrangement?.itemName ?? item.id ?? '-',
            metersToGo: this.formatNumber(process?.metersToGo),
            completionDays: this.formatDuration(process?.days),
            status: 'In coda',
          })),
        );
      }),
      catchError((error) => {
        console.error('Errore durante il caricamento di una produzione in coda:', error);
        return of(null);
      }),
    );
  }

  public startQueuedProduction(row: QueuedProductionRow): void {
    const loomId = this.loom()?.id;

    if (!loomId || !row.assignment.id || this.isStartingProduction) {
      return;
    }

    this.assignmentService.getByLoomId(loomId).subscribe({
      next: (assignments) => {
        const hasRunningProduction = assignments.some(
          (assignment) => assignment.status === LoomItemAssignment.StatusEnum.Running,
        );

        if (hasRunningProduction) {
          this.dialog.open<DialogAlertGeneric, DialogAlertGenericData>(DialogAlertGeneric, {
            panelClass: 'loom-alert-dialog-panel',
            autoFocus: false,
            data: {
              text: 'Produzione già in corso',
              subtext: 'Non è possibile avviare una nuova produzione finché quella attuale non è terminata.',
              icon: 'report',
              iconColor: 'danger',
              closeOnly: true,
              closeButtonLabel: 'Chiudi',
            },
          });
          return;
        }

        this.confirmStartQueuedProduction(row);
      },
      error: (error) => {
        console.error('Errore durante il controllo delle produzioni attive:', error);
        this.showErrorSnackbar('Impossibile controllare le produzioni attive');
      },
    });
  }

  private confirmStartQueuedProduction(row: QueuedProductionRow): void {
    const dialogRef = this.dialog.open<DialogAlertGeneric, DialogAlertGenericData, boolean>(DialogAlertGeneric, {
      panelClass: 'loom-alert-dialog-panel',
      autoFocus: false,
      data: {
        text: `Vuoi mettere in produzione ${row.itemName}?`,
        icon: 'help',
        iconColor: 'var(--weavops-color-primary)',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed || !row.assignment.id) {
        return;
      }

      this.isStartingProduction = true;
      this.assignmentService.update(row.assignment.id, {
        ...row.assignment,
        status: LoomItemAssignment.StatusEnum.Running,
      }).subscribe({
        next: () => {
          this.isStartingProduction = false;
          const loomId = this.loom()?.id;
          if (loomId) {
            this.loadProductionSummary(loomId);
          }
          this.returnToActionSelection();
          this.snackBar.open('Produzione avviata con successo', 'Chiudi', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        },
        error: (error) => {
          console.error('Errore durante l’avvio della produzione:', error);
          this.isStartingProduction = false;
          this.showErrorSnackbar('Impossibile avviare la produzione');
        },
      });
    });
  }

  private formatNumber(value: number | undefined): string {
    return value === undefined || value === null ? '-' : String(value);
  }

  private formatDuration(value: number | undefined): string {
    if (value === undefined || value === null || !Number.isFinite(value)) {
      return '-';
    }

    const totalMinutes = Math.max(Math.round(value * 24 * 60), 0);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'giorno' : 'giorni'}`);
    }
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'ora' : 'ore'}`);
    }
    if (minutes > 0 || parts.length === 0) {
      parts.push(`${minutes} min`);
    }

    return parts.join(' ');
  }

  private loadProductionSummary(loomId: string): void {
    this.assignmentService.getByLoomId(loomId).pipe(
      switchMap((assignments) => {
        const runningAssignment = assignments.find(
          (assignment) => assignment.status === LoomItemAssignment.StatusEnum.Running,
        );

        if (!runningAssignment?.itemId) {
          return of(null);
        }

        return this.itemService.getById(runningAssignment.itemId).pipe(
          switchMap((item) => {
            const fallbackProcess = item.processing?.find(
              (process) => process.id === runningAssignment.processId,
            ) ?? null;
            const process = runningAssignment.processId
              ? this.processService.getById(runningAssignment.processId).pipe(
                catchError(() => of(fallbackProcess)),
              )
              : of(fallbackProcess);
            const arrangement = item.arrangementId
              ? this.arrangementService.getById(item.arrangementId).pipe(catchError(() => of(null)))
              : of(null);

            return forkJoin({ process, arrangement }).pipe(
              map(({ process, arrangement }) => {
                const producedPieces = item.processing?.reduce(
                  (total, itemProcess) => total + Number(itemProcess.piecesRun ?? 0),
                  0,
                ) ?? 0;
                const remainingPieces = arrangement
                  ? Math.max(arrangement.piecesCount - producedPieces, 0)
                  : null;

                return {
                  itemName: arrangement?.itemName ?? item.id ?? '-',
                  remainingPieces: this.formatNumber(remainingPieces ?? undefined),
                  loomPiecesRun: this.formatNumber(process?.piecesRun),
                };
              }),
            );
          }),
        );
      }),
      catchError((error) => {
        console.error('Errore durante il caricamento del riepilogo produzione:', error);
        return of(null);
      }),
    ).subscribe((summary) => this.productionSummary.set(summary));
  }
}
