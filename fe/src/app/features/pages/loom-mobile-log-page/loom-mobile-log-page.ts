import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { catchError, finalize, map, of } from 'rxjs';
import { LoomLog, LoomLogService } from '../../../api';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';

interface LoomMobileLogRow {
  event: string;
  dateTime: string;
}

@Component({
  selector: 'app-loom-mobile-log-page',
  standalone: true,
  imports: [MatIcon, LoaderComponent],
  templateUrl: './loom-mobile-log-page.html',
  styleUrl: './loom-mobile-log-page.scss',
})
export class LoomMobileLogPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loomLogService = inject(LoomLogService);

  public readonly rows = signal<LoomMobileLogRow[]>([]);
  public isLoading = true;
  public loadFailed = false;

  ngOnInit(): void {
    const loomId = this.route.snapshot.paramMap.get('id');

    if (!loomId) {
      this.isLoading = false;
      this.loadFailed = true;
      return;
    }

    this.loomLogService.getLoomLogsByLoomId({ loomId }).pipe(
      map((logs) => logs.map((log) => this.toRow(log))),
      catchError(() => {
        this.loadFailed = true;
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
      }),
    ).subscribe((rows) => this.rows.set(rows));
  }

  public goBack(): void {
    const loomId = this.route.snapshot.paramMap.get('id');
    void this.router.navigate(loomId ? ['/telaio', loomId, 'mobile'] : ['/'], {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
    });
  }

  private toRow(log: LoomLog): LoomMobileLogRow {
    return {
      event: this.getEventDescription(log),
      dateTime: this.formatDateTime(log.createdAt),
    };
  }

  private getEventDescription(log: LoomLog): string {
    switch (log.key) {
      case 'LOOM_CREATED':
        return `Aggiunta telaio ${log.loomCode ?? ''}`.trim();
      case 'LOOM_STATUS_CHANGED':
        return `Stato telaio modificato in ${this.getLoomStatusDescription(log.loomStatus)}`;
      case 'PROCESS_STARTED':
        return `Processo di ${log.itemName ?? 'articolo non disponibile'} assegnato`;
      case 'PROCESS_COMPLETED':
        return `Processo di ${log.itemName ?? 'articolo non disponibile'} completato`;
      case 'ADD_METERS':
        return `Aggiunti ${log.metersAdded ?? 0} metri`;
      case 'KNOTTING':
        return 'Annodatura';
      default:
        return log.key;
    }
  }

  private formatDateTime(value: string | undefined): string {
    if (!value) {
      return 'Data non disponibile';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Data non disponibile';
    }

    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }

  private getLoomStatusDescription(status: string | undefined): string {
    return ({
      STOPPED: 'Fermo',
      WORKING: 'In lavorazione',
      MAINTENANCE: 'Manutenzione',
    } as Record<string, string>)[status ?? ''] ?? status ?? 'non disponibile';
  }
}
