import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DecorativeLinesComponent } from '../../reusable-components/decorative-lines-component/decorative-lines-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { WhitePanel } from '../../reusable-components/white-panel/white-panel';
import { Arrangement, Item, Loom, Process } from '../../../api';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";
import { MatIcon } from "@angular/material/icon";
import { DialogAssignLoomComponent, type DialogAssignLoomData } from "../../reusable-components/dialog/dialog-assign-loom-component/dialog-assign-loom-component";
import { DialogItemAlertState, type DialogItemAlertStateData, type DialogItemAlertStateResult } from "../../reusable-components/dialog/dialog-item-alert-state/dialog-item-alert-state";
import { MatDialog } from '@angular/material/dialog';
import { TableComponent, type TableColumn } from "../../reusable-components/table-component/table-component";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface ProcessTableRow {
  loomName: string;
  metersRun: string;
  metersToGo: string;
  days: string;
  expectedEndDate: string;
}

@Component({
  selector: 'app-item-details-page',
  imports: [
    DecorativeLinesComponent,
    TitlePageComponent,
    WhitePanel,
    ExitButtonComponent,
    MatIcon,
    FormsModule,
    TableComponent,
    MatSnackBarModule,
  ],
  standalone: true,
  templateUrl: './item-details-page.html',
  styleUrl: './item-details-page.scss',
})
export class ItemDetailsPage implements OnInit {

  private readonly item = signal<Item | null>(null);
  private readonly arrangement = signal<Arrangement | null>(null);
  private readonly loomNamesById = signal<Record<string, string>>({});
  public itemName: string = '';
  public isEditEnabled: boolean = false;

  public readonly processesColumns: TableColumn<ProcessTableRow>[] = [
    { header: 'Nome Telaio', field: 'loomName' },
    { header: 'Metri Fatti', field: 'metersRun' },
    { header: 'Metri da Fare', field: 'metersToGo' },
    { header: 'Tempo stimato', field: 'days' },
    { header: 'Data di fine prevista', field: 'expectedEndDate' },
  ];
  public readonly rows = computed<ProcessTableRow[]>(() => this.productionRows.map((process) => ({
    loomName: this.getProcessLoomName(process),
    metersRun: this.formatTableMeters(process.metersRun),
    metersToGo: this.formatTableMeters(process.metersToGo),
    days: this.formatTableDays(process.days),
    expectedEndDate: this.formatDate(process.expectedEndDate),
  })));
  
  private readonly itemService = inject(ItemFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly loomService = inject(LoomFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  public get pageTitle(): string {
    return this.itemName ? `Dettagli ${this.itemName}` : 'Dettagli Articolo';
  }

  public get arrangementData(): Arrangement | null {
    return this.arrangement();
  }

  public get itemData(): Item | null {
    return this.item();
  }

  public get productionRows() {
    return this.item()?.processing ?? [];
  }

  public get hasProductionRows(): boolean {
    return this.productionRows.length > 0;
  }

  public get isTerminated(): boolean {
    const state = this.item()?.state;

    return state === Item.StateEnum.Completed || state === Item.StateEnum.Abandoned;
  }

  public get editButtonLabel(): string {
    return this.isEditEnabled ? 'Disabilita Modifiche' : 'Abilita Modifiche';
  }

  public get editButtonIcon(): string {
    return this.isEditEnabled ? 'lock' : 'edit';
  }

  public toggleEditMode(): void {
    this.isEditEnabled = !this.isEditEnabled;
  }

  public exportArrangementData(): void {
    const arrangement = this.arrangement();

    if (!arrangement) {
      return;
    }

    const pdfContent = this.createArrangementPdf(arrangement);
    const fileName = `disposizione-${this.getSafeFileName(arrangement.itemName)}.pdf`;
    const pdfBlob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  ngOnInit(): void {
    const itemId = this.route.snapshot.queryParamMap.get('id');
    const navigationItem = this.getNavigationItem();
    const navigationArrangement = this.getNavigationArrangement();

    this.loadLoomNames();

    if (itemId) {
      const fallbackArrangement = this.isNavigationItemForId(navigationItem, itemId)
        ? navigationArrangement
        : null;

      this.loadItem(itemId, fallbackArrangement);
      return;
    }

    this.item.set(navigationItem);

    if (navigationItem) {
      this.setArrangement(navigationArrangement);
      this.loadArrangement(navigationItem.arrangementId);
    }
  }

  private loadItem(itemId: string, fallbackArrangement: Arrangement | null = null): void {
    this.setArrangement(fallbackArrangement);

    this.itemService.getById(itemId).subscribe((item) => {
      this.item.set(item);
      this.loadArrangement(item.arrangementId);
    });
  }

  public getNavigationItem(): Item | null {
    const state = window.history.state as { item?: unknown } | null;
    const item = state?.item;

    if (!this.isItem(item)) {
      return null;
    }

    return item;
  }

  private getNavigationArrangement(): Arrangement | null {
    const state = window.history.state as { arrangement?: unknown } | null;
    const arrangement = state?.arrangement;

    if (!this.isArrangement(arrangement)) {
      return null;
    }

    return arrangement;
  }

  private isNavigationItemForId(item: Item | null, itemId: string): boolean {
    return item?.id === itemId;
  }

  private loadArrangement(arrangementId: string | undefined): void {
    if (!arrangementId) {
      return;
    }

    this.arrangementService.getById(arrangementId).subscribe((arrangement) => {
      this.setArrangement(arrangement);
    });
  }

  private loadLoomNames(): void {
    this.loomService.getAll().subscribe((looms) => {
      const loomNamesById = looms.reduce<Record<string, string>>((accumulator, loom) => {
        if (loom.id) {
          accumulator[loom.id] = this.formatLoomName(loom);
        }

        return accumulator;
      }, {});

      this.loomNamesById.set(loomNamesById);
    });
  }

  private setArrangement(arrangement: Arrangement | null): void {
    if (!arrangement) {
      return;
    }

    this.arrangement.set(arrangement);
    this.itemName = arrangement.itemName;
  }

  private isItem(value: unknown): value is Item {
    return Boolean(
      value
        && typeof value === 'object'
        && (
          'id' in value
          || 'arrangementId' in value
          || 'state' in value
          || 'customerId' in value
        ),
    );
  }

  private isArrangement(value: unknown): value is Arrangement {
    return Boolean(
      value
        && typeof value === 'object'
        && 'itemName' in value
        && typeof value.itemName === 'string',
    );
  }

  public formatDate(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  public formatNumber(value: number | undefined, suffix: string = ''): string {
    if (value === undefined || value === null) {
      return '-';
    }

    return `${value}${suffix}`;
  }

  public formatPercentage(value: number | undefined): string {
    return this.formatNumber(value, '%');
  }

  public formatState(state: Item.StateEnum | undefined): string {
    switch (state) {
      case Item.StateEnum.Initialized:
        return 'Inizializzato';
      case Item.StateEnum.Running:
        return 'In produzione';
      case Item.StateEnum.Completed:
        return 'Completato';
      case Item.StateEnum.Abandoned:
        return 'Abbandonato';
      default:
        return '-';
    }
  }

  private createArrangementPdf(arrangement: Arrangement): string {
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const halfWidth = pageWidth / 2;
    const halfHeight = pageHeight / 2;
    const contentParts = [
      '0.8 w',
      `0 ${halfHeight} m ${pageWidth} ${halfHeight} l S`,
      `${halfWidth} 0 m ${halfWidth} ${pageHeight} l S`,
    ];
    const rows = this.getArrangementPdfRows(arrangement);
    const quadrants = [
      { x: 0, y: halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: 0, y: 0 },
      { x: halfWidth, y: 0 },
    ];

    for (const quadrant of quadrants) {
      contentParts.push(...this.createArrangementPdfQuadrant(rows, quadrant.x, quadrant.y, halfHeight));
    }

    return this.createPdfDocument(contentParts.join('\n'), pageWidth, pageHeight);
  }

  private createArrangementPdfQuadrant(
    rows: string[],
    left: number,
    bottom: number,
    quadrantHeight: number,
  ): string[] {
    const parts: string[] = [];
    const x = left + 18;
    let y = bottom + quadrantHeight - 28;

    parts.push(this.createPdfTextCommand(x, y, 11, 'Dati Disposizione'));
    y -= 20;

    for (const row of rows) {
      const lines = this.wrapPdfText(row);

      for (const line of lines) {
        parts.push(this.createPdfTextCommand(x, y, 9, line));
        y -= 12;
      }

      y -= 3;
    }

    return parts;
  }

  private getArrangementPdfRows(arrangement: Arrangement): string[] {
    return [
      `Nome articolo: ${this.formatPdfValue(arrangement.itemName)}`,
      `Numero pezze: ${this.formatPdfValue(arrangement.piecesCount)}`,
      `Lunghezza pezza: ${this.formatPdfValue(arrangement.pieceLength, 'm')}`,
      `Numero colpi per dm: ${this.formatPdfValue(arrangement.hitsPerDm)}`,
      `Misura pettine: ${this.formatPdfValue(arrangement.reedCount)} in ${this.formatPdfValue(arrangement.reedCM)} cm`,
      `Altezza pettine: ${this.formatPdfValue(arrangement.reedHeight, 'm')}`,
      `Lunghezza ordito: ${this.formatPdfValue(arrangement.warpLength, 'm')}`,
      `Numero fili ordito: ${this.formatPdfValue(arrangement.warpEndCount)}`,
      `Data di consegna: ${this.formatDate(arrangement.deliveryDate)}`,
    ];
  }

  private createPdfDocument(content: string, pageWidth: number, pageHeight: number): string {
    const encoder = new TextEncoder();
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`,
    ];
    const offsets: number[] = [];
    let pdf = '%PDF-1.4\n';

    objects.forEach((objectContent, index) => {
      offsets.push(encoder.encode(pdf).length);
      pdf += `${index + 1} 0 obj\n${objectContent}\nendobj\n`;
    });

    const xrefOffset = encoder.encode(pdf).length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    pdf += offsets
      .map((offset) => `${offset.toString().padStart(10, '0')} 00000 n \n`)
      .join('');
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return pdf;
  }

  private createPdfTextCommand(x: number, y: number, fontSize: number, text: string): string {
    return `BT /F1 ${fontSize} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${this.escapePdfText(text)}) Tj ET`;
  }

  private wrapPdfText(text: string, maxLength: number = 46): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;

      if (nextLine.length <= maxLength) {
        currentLine = nextLine;
        continue;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = word;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private formatPdfValue(value: string | number | undefined, unit: string = ''): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    return unit ? `${value} ${unit}` : `${value}`;
  }

  private escapePdfText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  private getSafeFileName(value: string | undefined): string {
    const normalizedValue = value
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return normalizedValue || 'articolo';
  }

  public getMetersToGo(): number | null {
    const item = this.item();

    if (!item || !item.totalMeters || !item.metersRun) {
      return null;
    }

    return item.totalMeters - item.metersRun;
  }

  public getPercentage(): number | null {
    const item = this.item();

    if (!item || !item.totalMeters || !item.metersRun) {
      return null;
    }

    const percentage = (item.metersRun / item.totalMeters) * 100;
    return Math.round(percentage * 100) / 100; // Round to two decimal places
  }

  public openAssignLoomDialog(): void {
    const dialogRef = this.dialog.open<DialogAssignLoomComponent, DialogAssignLoomData, Process | false>(
      DialogAssignLoomComponent,
      {
        panelClass: 'assign-loom-dialog-panel',
        width: '720px',
        maxWidth: 'calc(100vw - 48px)',
        autoFocus: false,
        data: {
          arrangement: this.arrangementData,
        },
      },
    );

    dialogRef.afterClosed().subscribe((process) => {
      if (!process) {
        return;
      }

      this.addProcessToItem(process);
    });
  }

  public openTerminateProductionDialog(): void {
    const currentItem = this.item();

    if (!currentItem?.id) {
      this.snackBar.open("Impossibile terminare la produzione: id dell'articolo mancante", 'Chiudi', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
      return;
    }

    const dialogRef = this.dialog.open<DialogItemAlertState, DialogItemAlertStateData, DialogItemAlertStateResult>(
      DialogItemAlertState,
      {
        width: '520px',
        maxWidth: 'calc(100vw - 48px)',
        autoFocus: false,
        data: {
          item: currentItem,
        },
      },
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.saveTerminatedItemState(currentItem, result);
    });
  }

  private saveTerminatedItemState(currentItem: Item, state: Item.StateEnum): void {
    if (!currentItem.id) {
      return;
    }

    const updatedItem: Item = {
      ...currentItem,
      state,
      isArchived: true,
    };

    this.itemService.update(currentItem.id, updatedItem).subscribe({
      next: (item) => {
        this.item.set(item);
        this.snackBar.open('Stato articolo aggiornato con successo', 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      },
      error: (error) => {
        this.item.set(currentItem);
        console.error("Errore durante l'aggiornamento dello stato dell'item:", error);
        this.snackBar.open("Errore durante l'aggiornamento dello stato articolo", 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      },
    });
  }

  private addProcessToItem(process: Process): void {
    const currentItem = this.item();

    if (!currentItem?.id) {
      console.error("Impossibile assegnare il processo: id dell'item mancante");
      return;
    }

    const updatedItem: Item = {
      ...currentItem,
      processing: [...(currentItem.processing ?? []), process],
    };

    this.item.set(updatedItem);

    this.itemService.update(currentItem.id, updatedItem).subscribe({
      next: (item) => {
        this.item.set(item);
        this.snackBar.open('Assegnazione avvenuta con successo', 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      },
      error: (error) => {
        this.item.set(currentItem);
        console.error("Errore durante l'aggiornamento dell'item:", error);
      },
    });
  }

  private getProcessLoomName(process: Process): string {
    if (process.loom) {
      return this.formatLoomName(process.loom);
    }

    const legacyLoomId = (process as Process & { loomId?: string }).loomId;

    if (legacyLoomId) {
      return this.getLoomNameById(legacyLoomId);
    }

    return 'Telaio non disponibile';
  }

  private getLoomNameById(loomId: string | undefined): string {
    if (!loomId) {
      return '-';
    }

    return this.loomNamesById()[loomId] ?? 'Telaio non disponibile';
  }

  private formatLoomName(loom: Loom): string {
    return `Telaio ${loom.serialNumber}`;
  }

  private formatTableMeters(value: number | undefined): string {
    return this.formatNumber(value, ' m');
  }

  private formatTableDays(value: number | undefined): string {
    if (value === undefined || value === null || !Number.isFinite(value)) {
      return '-';
    }

    if (value <= 0) {
      return '0 min';
    }

    const rawMinutes = value * 24 * 60;

    if (rawMinutes < 1) {
      return '< 1 min';
    }

    const totalMinutes = Math.round(rawMinutes);
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
}
