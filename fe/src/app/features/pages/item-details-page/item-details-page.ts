import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DecorativeLinesComponent } from '../../reusable-components/decorative-lines-component/decorative-lines-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { WhitePanel } from '../../reusable-components/white-panel/white-panel';
import { Arrangement, Item } from '../../../api';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { ExitButtonComponent } from "../../reusable-components/exit-button-component/exit-button-component";
import { MatIcon } from "@angular/material/icon";
import { DialogAssignLoomComponent } from "../../reusable-components/dialog-assign-loom-component/dialog-assign-loom-component";
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-item-details-page',
  imports: [
    DecorativeLinesComponent,
    TitlePageComponent,
    WhitePanel,
    ExitButtonComponent,
    MatIcon,
    FormsModule
],
  standalone: true,
  templateUrl: './item-details-page.html',
  styleUrl: './item-details-page.scss',
})
export class ItemDetailsPage implements OnInit {

  private item: Item | null = null;
  private arrangement: Arrangement | null = null;
  public itemName: string = '';
  public isEditEnabled: boolean = false;
  
  private readonly itemService = inject(ItemFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  public get pageTitle(): string {
    return this.itemName ? `Dettagli ${this.itemName}` : 'Dettagli Articolo';
  }

  public get arrangementData(): Arrangement | null {
    return this.arrangement;
  }

  public get itemData(): Item | null {
    return this.item;
  }

  public get productionRows() {
    return this.item?.processing ?? [];
  }

  public get hasProductionRows(): boolean {
    return this.productionRows.length > 0;
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
    if (!this.arrangement) {
      return;
    }

    const pdfContent = this.createArrangementPdf(this.arrangement);
    const fileName = `disposizione-${this.getSafeFileName(this.arrangement.itemName)}.pdf`;
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

    if (itemId) {
      const fallbackArrangement = this.isNavigationItemForId(navigationItem, itemId)
        ? navigationArrangement
        : null;

      this.loadItem(itemId, fallbackArrangement);
      return;
    }

    this.item = navigationItem;

    if (this.item) {
      this.setArrangement(navigationArrangement);
      this.loadArrangement(this.item.arrangementId);
    }
  }

  private loadItem(itemId: string, fallbackArrangement: Arrangement | null = null): void {
    this.setArrangement(fallbackArrangement);

    this.itemService.getById(itemId).subscribe((item) => {
      this.item = item;
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

  private setArrangement(arrangement: Arrangement | null): void {
    if (!arrangement) {
      return;
    }

    this.arrangement = arrangement;
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

    return date.toLocaleDateString('it-IT');
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
    if (!this.item || !this.item.totalMeters || !this.item.metersRun) {
      return null;
    }

    return this.item.totalMeters - this.item.metersRun;
  }

  public getPercentage(): number | null {
    if (!this.item || !this.item.totalMeters || !this.item.metersRun) {
      return null;
    }

    const percentage = (this.item.metersRun / this.item.totalMeters) * 100;
    return Math.round(percentage * 100) / 100; // Round to two decimal places
  }

  public openAssignLoomDialog(): void {
    this.dialog.open(DialogAssignLoomComponent, {
      panelClass: 'assign-loom-dialog-panel',
      width: '720px',
      maxWidth: 'calc(100vw - 48px)',
      autoFocus: false,
    });
  }
}
