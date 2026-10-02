import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { LoomLog, LoomLogService } from '../../../api';
import { ProductionSummaryPdfService } from '../../../services/production-summary-pdf.service';
import type { ProductionSummaryPdf } from '../../../services/production-summary-pdf.service';
import type { FilterValues } from '../../reusable-components/button/filter-button-component/filter-button-component';
import {
  TableColumn,
  TableComponent,
  TableAction,
  TableActionClick,
  TableFilterButtonConfig,
} from '../../reusable-components/table-component/table-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';

interface LoomLogRow {
  id: string;
  eventType: string;
  event: string;
  loomCode: string;
  createdAt: string;
}

@Component({
  selector: 'app-loom-log-page',
  imports: [TitlePageComponent, TableComponent, MatIconModule],
  templateUrl: './loom-log-page.html',
  styleUrl: './loom-log-page.scss',
  standalone: true,
})
export class LoomLogPage implements OnInit {
  private readonly loomLogService = inject(LoomLogService);
  private readonly productionSummaryPdfService = inject(ProductionSummaryPdfService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly loomId = this.route.snapshot.paramMap.get('id');
  public readonly isLoomSpecific = Boolean(this.loomId);
  public readonly isMobileView = this.route.snapshot.url.some((segment) => segment.path === 'logs');
  private readonly allRows = signal<LoomLogRow[]>([]);

  public readonly rows = signal<LoomLogRow[]>([]);
  public readonly productionSummaryRows = signal<ProductionSummaryPdf[]>([]);
  public readonly productionSummaryColumns: TableColumn<ProductionSummaryPdf>[] = [
    { header: 'Telaio', field: 'loomNumber' },
    { header: 'Data di chiusura', value: (row) => this.formatDateTime(row.createdAt) },
    { header: 'File PDF', field: 'fileName' },
  ];
  public readonly productionSummaryActions: TableAction<ProductionSummaryPdf>[] = [
    { id: 'download-summary', label: 'Scarica PDF', icon: 'download', iconColor: 'var(--weavops-color-primary)' },
  ];
  public readonly isPrintingPdf = signal(false);
  public readonly columns: TableColumn<LoomLogRow>[] = this.isMobileView
    ? [
      { header: 'Data e ora', field: 'createdAt' },
      { header: 'Azione', field: 'event' },
    ]
    : this.isLoomSpecific
      ? [
        { header: 'Azione', field: 'event' },
        { header: 'Data e ora', field: 'createdAt' },
      ]
      : [
        { header: 'Evento', field: 'event' },
        { header: 'Telaio di riferimento', field: 'loomCode' },
      ];
  public readonly filterButton: TableFilterButtonConfig | null = this.isLoomSpecific ? null : {
    label: 'Filtri',
    icon: 'search',
    ariaLabel: 'Filtri log telai',
    filters: [
      {
        id: 'eventType',
        label: 'Evento',
        type: 'select',
        options: [
          { value: 'LOOM_CREATED', label: 'Aggiunta telaio' },
          { value: 'LOOM_STATUS_CHANGED', label: 'Cambio stato telaio' },
          { value: 'PROCESS_STARTED', label: 'Processo assegnato' },
          { value: 'PROCESS_COMPLETED', label: 'Processo completato' },
          { value: 'ADD_METERS', label: 'Aggiunta metri' },
          { value: 'KNOTTING', label: 'Annodatura' },
        ],
      },
      { id: 'loomCode', label: 'Telaio di riferimento' },
    ],
  };

  public goBack(): void {
    if (this.isMobileView && this.loomId) {
      void this.router.navigate(['/telaio', this.loomId, 'mobile'], {
        queryParamsHandling: 'preserve',
        preserveFragment: true,
      });
      return;
    }

    void this.router.navigate(['/telai']);
  }
  public ngOnInit(): void {
    if (!this.isMobileView) {
      this.productionSummaryPdfService.list(this.loomId ?? undefined).subscribe({
        next: (summaries) => this.productionSummaryRows.set(summaries),
        error: (error) => {
          console.error('Errore durante il caricamento dei riepiloghi produzione:', error);
          this.productionSummaryRows.set([]);
        },
      });
    }

    const logsRequest = this.loomId
      ? this.loomLogService.getLoomLogsByLoomId({ loomId: this.loomId })
      : this.loomLogService.getLoomLogs();

    logsRequest.subscribe({
      next: (logs) => {
        const orderedLogs = [...logs].sort(
          (first, second) => this.toTimestamp(second.createdAt) - this.toTimestamp(first.createdAt),
        );
        const rows = orderedLogs.map((log) => this.toRow(log));
        this.allRows.set(rows);
        this.rows.set(rows);
      },
      error: (error) => {
        console.error('Error loading loom logs:', error);
        this.allRows.set([]);
        this.rows.set([]);
      },
    });
  }

  public onProductionSummaryAction(event: TableActionClick<ProductionSummaryPdf>): void {
    if (event.action.id !== 'download-summary') return;

    this.productionSummaryPdfService.download(event.row.id).subscribe({
      next: (file) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = event.row.fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: (error) => console.error('Errore durante il download del riepilogo PDF:', error),
    });
  }

  public async printLogs(): Promise<void> {
    if (this.isPrintingPdf()) {
      return;
    }

    this.isPrintingPdf.set(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const margin = 14;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const tableWidth = pageWidth - margin * 2;
      const dateColumnWidth = 48;
      let y = 34;

      pdf.setTextColor(63, 23, 123);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Log delle azioni sul telaio', margin, 17);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Telaio: ${this.getLoomCodeForPdf()}`, margin, 24);
      pdf.text(`Stampato il: ${new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())}`, margin, 29);

      const drawHeader = (): void => {
        pdf.setFillColor(63, 23, 123);
        pdf.setDrawColor(63, 23, 123);
        pdf.rect(margin, y, dateColumnWidth, 10, 'FD');
        pdf.rect(margin + dateColumnWidth, y, tableWidth - dateColumnWidth, 10, 'FD');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('Data-ora', margin + 3, y + 6.5);
        pdf.text('Azione eseguita', margin + dateColumnWidth + 3, y + 6.5);
        y += 10;
      };

      drawHeader();
      const rows = this.rows();
      if (rows.length === 0) {
        pdf.setFillColor(255, 255, 255);
        pdf.setTextColor(70, 70, 70);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.rect(margin, y, tableWidth, 10, 'FD');
        pdf.text('Nessuna azione registrata', margin + dateColumnWidth + 3, y + 6.5);
      }

      rows.forEach((row, index) => {
        const actionLines = pdf.splitTextToSize(row.event, tableWidth - dateColumnWidth - 8) as string[];
        const rowHeight = Math.max(10, actionLines.length * 5 + 5);
        if (y + rowHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          drawHeader();
        }

        pdf.setFillColor(index % 2 === 0 ? 255 : 246, index % 2 === 0 ? 255 : 243, 255);
        pdf.setDrawColor(205, 195, 222);
        pdf.rect(margin, y, dateColumnWidth, rowHeight, 'FD');
        pdf.rect(margin + dateColumnWidth, y, tableWidth - dateColumnWidth, rowHeight, 'FD');
        pdf.setTextColor(45, 37, 56);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(row.createdAt, margin + 3, y + 6.5);
        pdf.text(actionLines, margin + dateColumnWidth + 3, y + 6.5);
        y += rowHeight;
      });

      pdf.save(`log-telaio-${this.getSafeFileName(this.getLoomCodeForPdf())}.pdf`);
    } catch (error) {
      console.error('Errore durante la creazione del PDF dei log:', error);
    } finally {
      this.isPrintingPdf.set(false);
    }
  }

  private getLoomCodeForPdf(): string {
    return this.rows().find((row) => row.loomCode !== 'Non disponibile')?.loomCode ?? this.loomId ?? 'telaio';
  }

  private getSafeFileName(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-');
  }
  public onFilterSelected(filters: FilterValues): void {
    const activeFilters = Object.entries(filters)
      .map(([field, value]) => [field, value.trim().toLowerCase()] as const)
      .filter(([, value]) => value.length > 0);

    this.rows.set(activeFilters.length === 0
      ? this.allRows()
      : this.allRows().filter((row) => activeFilters.every(([field, value]) =>
        String(row[field as keyof LoomLogRow]).toLowerCase().includes(value))));
  }

  private toRow(log: LoomLog): LoomLogRow {
    const loomCode = log.loomCode ?? 'Non disponibile';

    return {
      id: log.id ?? '-',
      eventType: log.key,
      event: this.getEventDescription(log, loomCode, log.itemName ?? 'articolo non disponibile'),
      loomCode,
      createdAt: this.formatDateTime(log.createdAt),
    };
  }

  private formatDateTime(value: string | undefined): string {
    if (!value) return 'Data non disponibile';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data non disponibile';
    return new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  }

  private toTimestamp(value: string | undefined): number {
    if (!value) {
      return 0;
    }

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private getEventDescription(log: LoomLog, loomCode: string, itemName: string): string {
    switch (log.key) {
      case 'LOOM_CREATED':
        return `Aggiunta telaio ${loomCode}`;
      case 'LOOM_STATUS_CHANGED':
        return `Stato telaio modificato in ${this.getLoomStatusDescription(log.loomStatus)}`;
      case 'PROCESS_STARTED':
        return `Processo di ${itemName} assegnato`;
      case 'PROCESS_COMPLETED':
        return `Processo di ${itemName} completato`;
      case 'ADD_METERS':
        return `Aggiunti ${log.metersAdded ?? 0} metri`;
      case 'KNOTTING':
        return 'Annodatura';
      default:
        return log.key;
    }
  }

  private getLoomStatusDescription(status: string | undefined): string {
    switch (status) {
      case 'STOPPED':
        return 'Fermo';
      case 'WORKING':
        return 'In lavorazione';
      case 'MAINTENANCE':
        return 'Manutenzione';
      default:
        return status ?? 'non disponibile';
    }
  }
}
