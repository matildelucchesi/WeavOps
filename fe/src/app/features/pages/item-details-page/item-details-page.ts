import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DecorativeLinesComponent } from '../../reusable-components/decorative-lines-component/decorative-lines-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { WhitePanel } from '../../reusable-components/white-panel/white-panel';
import { Arrangement, Item, Loom, LoomItemAssignment, Process } from '../../../api';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";
import { MatIcon } from "@angular/material/icon";
import {
  DialogAssignLoomComponent,
  TEMPORARY_PROCESS_START_DATE,
  type DialogAssignLoomData,
} from "../../reusable-components/dialog/dialog-assign-loom-component/dialog-assign-loom-component";
import { DialogItemAlertState, type DialogItemAlertStateData, type DialogItemAlertStateResult } from "../../reusable-components/dialog/dialog-item-alert-state/dialog-item-alert-state";
import { MatDialog } from '@angular/material/dialog';
import { TableAction, TableActionClick, TableComponent, type TableColumn } from "../../reusable-components/table-component/table-component";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoomItemAssignmentFacadeService } from '../../../services/loom-item-assignment-facade.service';
import { DialogInformativeComponent, type DialogInformativeData } from '../../reusable-components/dialog/dialog-informative-component/dialog-informative-component';

interface ProcessTableRow {
  id: string;
  assignmentId: string;
  processId?: string;
  loomId?: string;
  status?: LoomItemAssignment.StatusEnum;
  loomName: string;
  piecesRun: string;
  totalPieces: string;
  state: string;
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
  private readonly itemAssignments = signal<LoomItemAssignment[]>([]);
  private readonly remainingMetersToAssign = signal<number>(0);
  public itemName: string = '';
  public isEditEnabled: boolean = false;

  public readonly processesColumns: TableColumn<ProcessTableRow>[] = [
    { header: 'Nome Telaio', field: 'loomName' },
    { header: 'Pezze Fatte', field: 'piecesRun' },
    { header: 'Pezze Totali Assegnate', field: 'totalPieces' },
    {
      header: 'Stato',
      field: 'state',
      chip: {
        defaultStyle: {
          width: '132px',
          minWidth: '132px',
          height: '28px',
        },
        styles: {
          'In coda': {
            label: 'In coda',
            backgroundColor: 'var(--weavops-color-accent-lighter)',
            color: 'var(--weavops-color-accent-deep)',
            borderColor: 'var(--weavops-color-accent-deep)',
          },
          'In lavorazione': {
            label: 'In lavorazione',
            backgroundColor: 'var(--weavops-color-blue-soft)',
            color: 'var(--weavops-color-blue)',
            borderColor: 'var(--weavops-color-blue)',
          },
          'Completato': {
            label: 'Completato',
            backgroundColor: 'var(--weavops-color-success-soft)',
            color: 'var(--weavops-color-success)',
            borderColor: 'var(--weavops-color-success)',
          },
          'Abbandonato': {
            label: 'Abbandonato',
            backgroundColor: 'var(--weavops-color-grey)',
            color: 'var(--weavops-color-grey-dark)',
            borderColor: 'var(--weavops-color-grey-dark)',
          },
        },
      },
    },
    { header: 'Tempo stimato', field: 'days' },
    { header: 'Data di fine prevista', field: 'expectedEndDate' },
  ];
  public readonly rows = computed<ProcessTableRow[]>(() => this.itemAssignments().map((assignment) => {
    const process = this.getAssignmentProcess(assignment);

    return {
      id: assignment.id ?? '',
      assignmentId: assignment.id ?? '',
      processId: assignment.processId,
      loomId: assignment.loomId,
      status: assignment.status,
      loomName: this.getAssignmentLoomName(assignment, process),
      piecesRun: this.formatTablePieces(process?.piecesRun),
      totalPieces: this.formatTablePieces(process?.totalPieces),
      state: this.getAssignmentState(assignment),
      days: this.formatTableDays(process?.days),
      expectedEndDate: this.formatDate(process?.expectedEndDate),
    };
  }));
  
  private readonly itemService = inject(ItemFacadeService);
  private readonly assignmentService = inject(LoomItemAssignmentFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly loomService = inject(LoomFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  public assignmentActions : TableAction<ProcessTableRow>[] = [
        {
          id: 'delete',
          label: 'Elimina',
          icon: 'cancel',
          imageAlt: 'Elimina',
          visible: (row) => row.status !== LoomItemAssignment.StatusEnum.Abandoned && row.status !== LoomItemAssignment.StatusEnum.Completed,
          deleteItemName: () => "l'elemento selezionato",
        },
      ]

  public onTableAction(event: TableActionClick<ProcessTableRow>): void {
      switch (event.action.id) {
        case 'delete':
          this.deleteAssignment(event.row);
          console.log('Elimina assegnazione', event.row);
          break;
      }
    }

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
    return this.itemAssignments();
  }

  public get hasProductionRows(): boolean {
    return this.productionRows.length > 0;
  }

  public get isTerminated(): boolean {
    const state = this.item()?.state;

    return state === Item.StateEnum.Completed || state === Item.StateEnum.Abandoned;
  }

  public get itemStatusMessageClass(): string {
    switch (this.item()?.state) {
      case Item.StateEnum.Completed:
        return 'item-status-message-completed';
      case Item.StateEnum.Abandoned:
        return 'item-status-message-abandoned';
      default:
        return 'item-status-message-default';
    }
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
      this.loadItemAssignments(navigationItem.id);
      this.loadRemainingMetersToAssign(navigationItem.id);
      this.setArrangement(navigationArrangement);
      this.loadArrangement(navigationItem.arrangementId);
    }
  }

  private loadItem(itemId: string, fallbackArrangement: Arrangement | null = null): void {
    this.setArrangement(fallbackArrangement);

    this.itemService.getById(itemId).subscribe((item) => {
      this.item.set(item);
      this.loadItemAssignments(item.id);
      this.loadRemainingMetersToAssign(item.id);
      this.loadArrangement(item.arrangementId);
    });
  }

  private loadRemainingMetersToAssign(itemId: string | undefined): void {
    if (!itemId) {
      this.remainingMetersToAssign.set(0);
      return;
    }

    this.itemService.getRemainingMetersToAssign(itemId).subscribe({
      next: (remainingMeters) => {
        this.remainingMetersToAssign.set(remainingMeters);
      },
      error: (error) => {
        console.error('Error loading remaining meters to assign:', error);
        this.remainingMetersToAssign.set(0);
      },
    });
  }

  private loadItemAssignments(itemId: string | undefined): void {
    if (!itemId) {
      this.itemAssignments.set([]);
      return;
    }

    this.assignmentService.getByItemId(itemId).subscribe({
      next: (assignments) => {
        this.itemAssignments.set(assignments);
      },
      error: (error) => {
        console.error('Error loading item assignments:', error);
        this.itemAssignments.set([]);
      },
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

  public formatItemStartDate(value: string | undefined): string {
    const startDate = this.isRealStartDate(value)
      ? value
      : this.getOldestRealProcessStartDate(this.itemData?.processing ?? []);

    if (!startDate) {
      return '';
    }

    return this.formatDate(startDate);
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
        disableClose: true,
        data: {
          arrangement: this.arrangementData,
          remainingMetersToAssign: this.calculateRemainingMetersToAssign(),
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
        panelClass: 'item-alert-dialog-panel',
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
        if(process.id && item.id && process.loom?.id) {
        this.assignmentService.create(process.loom?.id ?? '', item.id, process.id, LoomItemAssignment.StatusEnum.Queued).subscribe({
          next: (assignment) => {
            this.itemAssignments.set([...this.itemAssignments(), assignment]);
            this.loadRemainingMetersToAssign(item.id);
            this.snackBar.open('Assegnazione avvenuta con successo', 'Chiudi', {
              duration: 4000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            });
          },
          error: (error) => {
            console.error("Errore durante l'assegnazione del processo:", error);
          }
        });
      }
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

  private formatTablePieces(value: number | undefined): string {
    return this.formatNumber(value);
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

  public calculateRemainingMetersToAssign(): number {
    return this.remainingMetersToAssign();
  }

  private isTemporaryProcessStartDate(value: string): boolean {
    const date = new Date(value);
    const temporaryDate = new Date(TEMPORARY_PROCESS_START_DATE);

    return !Number.isNaN(date.getTime()) && date.getTime() === temporaryDate.getTime();
  }

  private isRealStartDate(value: string | undefined): value is string {
    if (!value) {
      return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime()) && !this.isTemporaryProcessStartDate(value);
  }

  private getOldestRealProcessStartDate(processes: Process[]): string | undefined {
    return processes
      .map((process) => process.startDate)
      .filter((startDate): startDate is string => this.isRealStartDate(startDate))
      .sort((left, right) => new Date(left).getTime() - new Date(right).getTime())[0];
  }

  public openInfoDialogEndDate(): void {
    this.dialog.open<DialogInformativeComponent, DialogInformativeData>(DialogInformativeComponent, {
      panelClass: 'informative-dialog-panel',
      width: '520px',
      maxWidth: 'calc(100vw - 48px)',
      autoFocus: false,
      data: {
        title: 'Informazioni',
        message: 'La data PREVISTA per il completamento della lavorazione dell\'intero articolo sarà visualizzabile nel momento in cui saranno assegnati tutti i metri da produrre ai telai.',
      },
    });

  }

   public openInfoDialogStartDate(): void {
    this.dialog.open<DialogInformativeComponent, DialogInformativeData>(DialogInformativeComponent, {
      panelClass: 'informative-dialog-panel',
      width: '520px',
      maxWidth: 'calc(100vw - 48px)',
      autoFocus: false,
      data: {
        title: 'Informazioni',
        message: 'La data di INIZIO della lavorazione dell\'articolo è data dalla data della prima messa in produzione di un processo.',
      },
    });

  }


  public allTheProcessessAreRunning(): boolean {
    const assignments = this.itemAssignments();

    return assignments.length > 0
      && assignments.every((assignment) => assignment.status === LoomItemAssignment.StatusEnum.Running);
  }

  private deleteAssignment(row: ProcessTableRow): void {
    const currentItem = this.item();

    if (!currentItem?.id) {
      console.error("Impossibile eliminare l'assegnazione: id dell'item mancante");
      return;
    }

    const itemId = currentItem.id;

    if (!row.assignmentId) {
      console.error("Impossibile eliminare l'assegnazione: id dell'assegnazione mancante");
      return;
    }

    this.assignmentService.remove(row.assignmentId).subscribe({
      next: () => {
        this.loadItem(itemId);
        this.snackBar.open(this.getDeleteAssignmentSuccessMessage(row), 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      },
      error: (error) => {
        console.error("Errore durante l'eliminazione dell'assegnazione:", error);
        this.snackBar.open("Errore durante l'eliminazione dell'assegnazione", 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      }
    });

  }

  private getAssignmentProcess(assignment: LoomItemAssignment): Process | null {
    if (!assignment.processId) {
      return null;
    }

    return this.item()?.processing?.find((process) => process.id === assignment.processId) ?? null;
  }

  private getAssignmentLoomName(assignment: LoomItemAssignment, process: Process | null): string {
    if (assignment.loomId) {
      const loomName = this.getLoomNameById(assignment.loomId);

      if (loomName !== 'Telaio non disponibile') {
        return loomName;
      }
    }

    if (process) {
      return this.getProcessLoomName(process);
    }

    return 'Telaio non disponibile';
  }

  private getAssignmentState(assignment: LoomItemAssignment): string {
    switch (assignment.status) {
      case LoomItemAssignment.StatusEnum.Queued:
        return 'In coda';
      case LoomItemAssignment.StatusEnum.Running:
        return 'In lavorazione';
      case LoomItemAssignment.StatusEnum.Completed:
        return 'Completato';
      case LoomItemAssignment.StatusEnum.Abandoned:
        return 'Abbandonato';
      default:
        return 'Stato sconosciuto';
    }
  }

  private getDeleteAssignmentSuccessMessage(row: ProcessTableRow): string {
    return row.state === 'In lavorazione'
      ? 'Produzione abbandonata con successo'
      : 'Assegnazione eliminata con successo';
  }

}
