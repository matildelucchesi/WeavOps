import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DecorativeLinesComponent } from '../../reusable-components/decorative-lines-component/decorative-lines-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { WhitePanel } from '../../reusable-components/white-panel/white-panel';
import { Arrangement, Item, Loom, LoomItemAssignment, Process, ProductionAdvice } from '../../../api';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";
import { MatIcon } from "@angular/material/icon";
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
import { DialogAlertGeneric, type DialogAlertGenericData } from '../../reusable-components/dialog/dialog-alert-generic/dialog-alert-generic';
import { forkJoin } from 'rxjs';
import type { jsPDF as JsPdfDocument } from 'jspdf';

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

interface ArrangementPdfSection {
  assignment: LoomItemAssignment;
  process: Process;
  loomName: string;
  qrUrl: string;
  qrCodeDataUrl: string;
}

@Component({
  selector: 'app-item-details-page',
  imports: [
    DecorativeLinesComponent,
    TitlePageComponent,
    WhitePanel,
    ExitButtonComponent,
    MatIcon,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TableComponent,
    MatSnackBarModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
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
  public readonly productionAdvice = signal<ProductionAdvice | null>(null);
  public itemName: string = '';
  public isEditEnabled: boolean = false;
  public deliveryDate: Date | null = null;

  public readonly processesColumns: TableColumn<ProcessTableRow>[] = [
    { header: 'Nome Telaio', field: 'loomName' },
    { header: 'Pezze Fatte', field: 'piecesRun' },
    {
      header: 'Stato Processo',
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
  private readonly router = inject(Router);

  public assignmentActions : TableAction<ProcessTableRow>[] = [
    {
          id: 'production',
          label: 'Visualizza dettagli produzione',
          imageIcon: '/icon/work-icon-violet.png',
          imageAlt: 'Dettagli produzione',
        },    
    {
          id: 'delete',
          label: 'Elimina',
          icon: 'cancel',
          imageAlt: 'Elimina',
          visible: (row) => row.status !== LoomItemAssignment.StatusEnum.Abandoned && row.status !== LoomItemAssignment.StatusEnum.Completed,
          deleteItemName: () => "l'elemento selezionato",
        }
      ]

  public onTableAction(event: TableActionClick<ProcessTableRow>): void {
      switch (event.action.id) {
        case 'delete':
          this.deleteAssignment(event.row);
          console.log('Elimina assegnazione', event.row);
          break;
        case 'production':
          this.goToProductionDetailsPage(event);
          break;
      }
    }

  public goToProductionDetailsPage(event: TableActionClick<ProcessTableRow>): void {
      const loomId = event.row.loomId;
      this.router.navigate(['/dettaglio-produzione', loomId]);
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
    const willEnableEdit = !this.isEditEnabled;

    if (willEnableEdit) {
      this.deliveryDate = this.toDatePickerValue(this.arrangement()?.deliveryDate);
    }

    this.isEditEnabled = willEnableEdit;
  }

  public saveChanges(): void {
    const currentItem = this.item();
    const currentArrangement = this.arrangement();

    if (!currentItem?.id || !currentArrangement?.id) {
      this.snackBar.open("Impossibile salvare le modifiche: dati dell'articolo non completi", 'Chiudi', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
      return;
    }

    const dialogRef = this.dialog.open<
      DialogAlertGeneric,
      DialogAlertGenericData,
      boolean
    >(DialogAlertGeneric, {
      panelClass: 'loom-alert-dialog-panel',
      width: '520px',
      maxWidth: 'calc(100vw - 48px)',
      autoFocus: false,
      data: {
        text: 'Confermare le modifiche?',
        subtext: "ATTENZIONE: prima di procedere assicurarsi che tutti i dati siano corretti.",
        icon: 'save',
        iconColor: 'var(--weavops-color-primary)',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.persistChanges(currentItem, currentArrangement);
    });
  }

  public cancelEditMode(): void {
    this.isEditEnabled = false;

    const currentItemId = this.item()?.id;

    if (currentItemId) {
      this.loadItem(currentItemId);
    }
  }

  public onPiecesCountChange(arrangement: Arrangement, value: number | string | null): void {
    const piecesCount = this.toFiniteNumber(value);
    const updatedArrangement: Arrangement = {
      ...arrangement,
      piecesCount: piecesCount ?? 0,
    };

    this.setArrangement(updatedArrangement);
    this.recalculateItemTotalMetersFromArrangement(updatedArrangement);
  }

  public onPieceLengthChange(arrangement: Arrangement, value: number | string | null): void {
    const pieceLength = this.toFiniteNumber(value);
    const updatedArrangement: Arrangement = {
      ...arrangement,
      pieceLength: pieceLength ?? undefined,
    };

    this.setArrangement(updatedArrangement);
    this.recalculateItemTotalMetersFromArrangement(updatedArrangement);
  }

  public onItemTotalMetersChange(item: Item, value: number | string | null): void {
    const totalMeters = this.toFiniteNumber(value);
    const updatedItem: Item = {
      ...(this.item() ?? item),
      totalMeters: totalMeters ?? undefined,
    };

    this.item.set(updatedItem);

    if (totalMeters !== null) {
      this.updateRemainingMetersToAssignFromTotalMeters(totalMeters);
    }
  }

  private persistChanges(currentItem: Item, currentArrangement: Arrangement): void {
    if (!currentItem.id || !currentArrangement.id) {
      return;
    }

    forkJoin({
      item: this.itemService.update(currentItem.id, this.buildItemSavePayload(currentItem)),
      arrangement: this.arrangementService.update(
        currentArrangement.id,
        this.buildArrangementSavePayload(currentArrangement),
      ),
    }).subscribe({
      next: ({ item, arrangement }) => {
        this.item.set(item);
        this.setArrangement(arrangement);
        this.loadRemainingMetersToAssign(item.id);
        this.isEditEnabled = false;
        this.snackBar.open('Modifiche salvate con successo', 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      },
      error: (error) => {
        console.error('Errore durante il salvataggio delle modifiche:', error);
        this.snackBar.open('Errore durante il salvataggio delle modifiche', 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  private buildItemSavePayload(item: Item): Item {
    return {
      ...item,
      startDate: this.normalizeDateTime(item.startDate),
      expectedEndDate: this.normalizeDateTime(item.expectedEndDate),
    };
  }

  private buildArrangementSavePayload(arrangement: Arrangement): Arrangement {
    return {
      ...arrangement,
      deliveryDate: this.normalizeDateTime(arrangement.deliveryDate),
    };
  }

  private normalizeDateTime(value: string | undefined): string | undefined {
    const trimmedValue = value?.trim();

    if (!trimmedValue || trimmedValue === '-') {
      return undefined;
    }

    const italianDateMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmedValue);

    if (!italianDateMatch) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
        return `${trimmedValue}T00:00:00.000Z`;
      }

      return trimmedValue;
    }

    const day = Number(italianDateMatch[1]);
    const month = Number(italianDateMatch[2]);
    const year = Number(italianDateMatch[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year
      || date.getUTCMonth() !== month - 1
      || date.getUTCDate() !== day
    ) {
      return trimmedValue;
    }

    return date.toISOString();
  }

  public toDateInputValue(value: string | undefined): string {
    if (!this.isRealStartDate(value)) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  public toDatePickerValue(value: string | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  public onDeliveryDateChange(value: Date | null): void {
    const currentArrangement = this.arrangement();

    if (!currentArrangement) {
      return;
    }

    this.arrangement.set({
      ...currentArrangement,
      deliveryDate: value ? value.toISOString() : undefined,
    });
  }

  public async exportArrangementData(): Promise<void> {
    const arrangement = this.arrangement();

    if (!arrangement) {
      return;
    }

    try {
      const [{ jsPDF }, QRCode] = await Promise.all([
        import('jspdf'),
        import('qrcode'),
      ]);
      const sections = await this.createArrangementPdfSections(QRCode);

      if (sections.length === 0) {
        this.snackBar.open('Nessun telaio associato a un processo esportabile', 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const fileName = `disposizione-${this.getSafeFileName(arrangement.itemName)}.pdf`;

      this.createArrangementPdf(pdf, arrangement, sections);
      pdf.save(fileName);
    } catch (error) {
      console.error('Errore durante la generazione della disposizione:', error);
      this.snackBar.open('Errore durante la generazione della disposizione', 'Chiudi', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar'],
      });
    }
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
      this.loadProductionAdvice(navigationItem.id);
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
      this.loadProductionAdvice(item.id);
      this.loadArrangement(item.arrangementId);
    });
  }

  private loadProductionAdvice(itemId: string | undefined): void {
    this.productionAdvice.set(null);

    if (!itemId) {
      return;
    }

    this.itemService.getProductionAdvice(itemId).subscribe({
      next: (advice) => this.productionAdvice.set(advice),
      error: () => this.productionAdvice.set(null),
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

  private createArrangementPdf(
    pdf: JsPdfDocument,
    arrangement: Arrangement,
    sections: ArrangementPdfSection[],
  ): void {
    const pages = this.chunkArray(sections, 4);

    pages.forEach((pageSections, pageIndex) => {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      this.drawArrangementPdfPage(pdf);
      pageSections.forEach((section, sectionIndex) => {
        this.drawArrangementPdfSection(pdf, arrangement, section, sectionIndex);
      });
    });
  }

  private async createArrangementPdfSections(
    qrCode: typeof import('qrcode'),
  ): Promise<ArrangementPdfSection[]> {
    const sections = await Promise.all(
      this.itemAssignments()
        .filter((assignment) => this.isExportableArrangementAssignment(assignment))
        .map(async (assignment): Promise<ArrangementPdfSection | null> => {
          const process = this.getAssignmentProcess(assignment);

          if (!assignment.loomId || !process) {
            return null;
          }

          const qrUrl = this.createLoomProductionDetailsUrl(assignment.loomId);
          const qrCodeDataUrl = await this.createLoomQrCodeWithLogo(qrCode, qrUrl);

          return {
            assignment,
            process,
            loomName: this.getAssignmentLoomName(assignment, process),
            qrUrl,
            qrCodeDataUrl,
          };
        }),
    );

    return sections.filter((section): section is ArrangementPdfSection => section !== null);
  }

  private async createLoomQrCodeWithLogo(
    qrCode: typeof import('qrcode'),
    qrUrl: string,
  ): Promise<string> {
    const qrCodeDataUrl = await qrCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 220,
      color: {
        dark: '#3f177b',
        light: '#ffffff',
      },
    });

    try {
      return await this.addLogoToQrCode(qrCodeDataUrl);
    } catch (error) {
      console.warn('Unable to add the logo to the loom QR code:', error);
      return qrCodeDataUrl;
    }
  }

  private async addLogoToQrCode(qrCodeDataUrl: string): Promise<string> {
    const [qrImage, logoImage] = await Promise.all([
      this.loadImage(qrCodeDataUrl),
      this.loadImage('/images/Copilot_20260520_122802.png'),
    ]);
    const canvas = document.createElement('canvas');
    const qrSize = qrImage.naturalWidth || 220;
    const logoSize = Math.round(qrSize * 0.3);
    const logoX = Math.round((qrSize - logoSize) / 2);
    const logoY = Math.round((qrSize - logoSize) / 2);
    const context = canvas.getContext('2d');

    if (!context) {
      return qrCodeDataUrl;
    }

    canvas.width = qrSize;
    canvas.height = qrSize;
    context.drawImage(qrImage, 0, 0, qrSize, qrSize);
    context.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    context.strokeStyle = '#ffffff';
    context.lineWidth = Math.max(2, Math.round(qrSize * 0.009));
    context.strokeRect(logoX, logoY, logoSize, logoSize);

    return canvas.toDataURL('image/png');
  }

  private loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Unable to load image: ${source}`));
      image.src = source;
    });
  }

  private isExportableArrangementAssignment(assignment: LoomItemAssignment): boolean {
    return Boolean(assignment.loomId && assignment.processId)
      && assignment.status !== LoomItemAssignment.StatusEnum.Completed
      && assignment.status !== LoomItemAssignment.StatusEnum.Abandoned;
  }

  private drawArrangementPdfPage(pdf: JsPdfDocument): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const halfWidth = pageWidth / 2;
    const halfHeight = pageHeight / 2;

    pdf.setDrawColor(63, 23, 123);
    pdf.setLineWidth(0.25);
    pdf.line(halfWidth, 0, halfWidth, pageHeight);
    pdf.line(0, halfHeight, pageWidth, halfHeight);
  }

  private drawArrangementPdfSection(
    pdf: JsPdfDocument,
    arrangement: Arrangement,
    section: ArrangementPdfSection,
    sectionIndex: number,
  ): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const quadrantWidth = pageWidth / 2;
    const quadrantHeight = pageHeight / 2;
    const left = sectionIndex % 2 === 0 ? 0 : quadrantWidth;
    const top = sectionIndex < 2 ? 0 : quadrantHeight;
    const margin = 7;
    const contentLeft = left + margin;
    const contentTop = top + margin;
    const contentWidth = quadrantWidth - margin * 2;
    const qrSize = 32;
    const qrX = left + quadrantWidth - margin - qrSize;
    const qrY = top + quadrantHeight - margin - qrSize - 6;
    const rows = this.getArrangementPdfSectionRows(arrangement, section);

    pdf.setDrawColor(63, 23, 123);
    pdf.setLineWidth(0.35);
    pdf.roundedRect(left + 4, top + 4, quadrantWidth - 8, quadrantHeight - 8, 2, 2);

    pdf.setTextColor(63, 23, 123);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Dati Disposizione', contentLeft, contentTop + 3);

    pdf.setFontSize(8.5);
    pdf.text(section.loomName, left + quadrantWidth - margin, contentTop + 3, { align: 'right' });

    pdf.setDrawColor(63, 23, 123);
    pdf.setLineWidth(0.2);
    pdf.line(contentLeft, contentTop + 7, left + quadrantWidth - margin, contentTop + 7);

    this.drawPdfRows(pdf, rows, contentLeft, contentTop + 13, contentWidth, qrY - 5);

    pdf.addImage(section.qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    pdf.setTextColor(63, 23, 123);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.text('Telaio', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });

    pdf.setTextColor(80, 80, 80);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(5.5);
    pdf.text(this.truncatePdfText(section.qrUrl, 45), contentLeft, top + quadrantHeight - 7);
  }

  private drawPdfRows(
    pdf: JsPdfDocument,
    rows: string[],
    x: number,
    startY: number,
    maxWidth: number,
    maxY: number,
  ): void {
    let y = startY;

    pdf.setTextColor(33, 33, 33);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.3);

    for (const row of rows) {
      const wrappedRows = pdf.splitTextToSize(row, maxWidth) as string[];

      for (const wrappedRow of wrappedRows) {
        if (y > maxY) {
          return;
        }

        pdf.text(wrappedRow, x, y);
        y += 4.2;
      }

      y += 1.1;
    }
  }

  private getArrangementPdfSectionRows(arrangement: Arrangement, section: ArrangementPdfSection): string[] {
    const process = section.process;

    return [
      `Articolo: ${this.formatPdfValue(arrangement.itemName)}`,
      `Metri previsti: ${this.formatPdfValue(process.totalMeters, 'm')}`,
      `Lunghezza pezza: ${this.formatPdfValue(process.metersPerPiece, 'm')}`,
      `Velocita: ${this.formatPdfValue(process.speed)}`,
      `Efficienza: ${this.formatPdfValue(process.efficiency, '%')}`,
      `Colpi per dm: ${this.formatPdfValue(arrangement.hitsPerDm)}`,
      `Pettine: ${this.formatPdfValue(arrangement.reedCount)} in ${this.formatPdfValue(arrangement.reedCM)} cm`,
      `Data consegna: ${this.formatDate(arrangement.deliveryDate)}`,
      `Fine prevista: ${this.formatDate(process.expectedEndDate)}`,
    ];
  }

  private createLoomProductionDetailsUrl(loomId: string): string {
    return new URL(`/dettaglio-produzione/${encodeURIComponent(loomId)}`, window.location.origin).toString();
  }

  private chunkArray<T>(items: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];

    for (let index = 0; index < items.length; index += chunkSize) {
      chunks.push(items.slice(index, index + chunkSize));
    }

    return chunks;
  }

  private truncatePdfText(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength - 3)}...`;
  }

  private formatPdfValue(value: string | number | undefined, unit: string = ''): string {
    if (value === undefined || value === null || value === '') {
      return '-';
    }

    return unit ? `${value} ${unit}` : `${value}`;
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

    if (!item || item.totalMeters === undefined || item.totalMeters === null) {
      return null;
    }

    return Math.max(item.totalMeters - (item.metersRun ?? 0), 0);
  }

  public getPercentage(): number | null {
    const item = this.item();

    if (!item || item.totalMeters === undefined || item.totalMeters === null || item.totalMeters <= 0) {
      return null;
    }

    const percentage = ((item.metersRun ?? 0) / item.totalMeters) * 100;
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
          itemId: this.item()?.id,
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
        this.router.navigate(['/articoli']);
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
            this.loadProductionAdvice(item.id);
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

  private recalculateItemTotalMetersFromArrangement(arrangement: Arrangement): void {
    const piecesCount = this.toFiniteNumber(arrangement.piecesCount);
    const pieceLength = this.toFiniteNumber(arrangement.pieceLength);

    if (piecesCount === null || pieceLength === null) {
      return;
    }

    const totalMeters = Math.round(piecesCount * pieceLength);
    const currentItem = this.item();

    if (!currentItem) {
      return;
    }

    this.item.set({
      ...currentItem,
      totalMeters,
    });
    this.updateRemainingMetersToAssignFromTotalMeters(totalMeters);
  }

  private updateRemainingMetersToAssignFromTotalMeters(totalMeters: number): void {
    const metersRun = this.item()?.metersRun ?? 0;

    this.remainingMetersToAssign.set(Math.max(totalMeters - metersRun, 0));
  }

  private toFiniteNumber(value: unknown): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const numericValue = Number(value);

    return Number.isFinite(numericValue) ? numericValue : null;
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
        icon: 'info',
        message: 'La data PREVISTA per il completamento della lavorazione dell\'intero articolo sarà visualizzabile quando almeno un processo sarà in produzione e avrà i dati necessari per calcolare la capacità giornaliera.',
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
        icon: 'info',
        message: 'La data di INIZIO della lavorazione dell\'articolo è data dalla data della prima messa in produzione di un processo.',
      },
    });

  }


  public allTheProcessessAreRunning(): boolean {
    const assignments = this.itemAssignments();

    return assignments.length > 0
      && assignments.every((assignment) => assignment.status === LoomItemAssignment.StatusEnum.Running);
  }

  public hasExpectedEndDateForecast(): boolean {
    return this.isRealStartDate(this.getExpectedEndDateForecast());
  }

  public getExpectedEndDateForecast(): string | undefined {
    const forecastExpectedEndDate = this.productionAdvice()?.estimatedCompletionDate;
    const savedExpectedEndDate = this.itemData?.expectedEndDate;

    return this.isRealStartDate(forecastExpectedEndDate)
      ? forecastExpectedEndDate
      : savedExpectedEndDate;
  }

  public isExpectedEndDateAfterDeliveryDate(): boolean {
    const advice = this.productionAdvice();

    if (advice) {
      return advice.meetsDeliveryDate === false;
    }

    const expectedEndDate = this.getComparableDateValue(this.getExpectedEndDateForecast());
    const deliveryDate = this.getComparableDateValue(
      this.arrangementData?.deliveryDate,
    );

    return expectedEndDate !== null
      && deliveryDate !== null
      && expectedEndDate > deliveryDate;
  }

  public isExpectedEndDateOnSchedule(): boolean {
    return this.hasExpectedEndDateForecast()
      && this.productionAdvice()?.meetsDeliveryDate === true;
  }

  public getEstimatedArticleCompletionDays(): string {
    const expectedEndDate = this.getExpectedEndDateForecast();

    if (!this.isRealStartDate(expectedEndDate)) {
      return '-';
    }

    const expectedEndTimestamp = new Date(expectedEndDate).getTime();

    if (Number.isNaN(expectedEndTimestamp)) {
      return '-';
    }

    const remainingDays = Math.max(
      (expectedEndTimestamp - Date.now()) / (24 * 60 * 60 * 1000),
      0,
    );

    return this.formatTableDays(remainingDays);
  }

  private hasRunningAssignment(): boolean {
    return this.itemAssignments()
      .some((assignment) => assignment.status === LoomItemAssignment.StatusEnum.Running);
  }

  private getComparableDateValue(value: string | undefined): number | null {
    if (!this.isRealStartDate(value)) {
      return null;
    }

    const date = new Date(value);

    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
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

  public openSaveChangesDialog(): void {
    const dialogRef = this.dialog.open<DialogInformativeComponent, DialogInformativeData>(DialogInformativeComponent, {
      panelClass: 'informative-dialog-panel',
      width: '520px',
      maxWidth: 'calc(100vw - 48px)',
      autoFocus: false,
      data: {
        title: 'Salvataggio modifiche',
        icon: 'info',
        message: 'Le modifiche apportate all\'articolo sono state salvate con successo.',
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isEditEnabled = false;
    });
  }



  public getProductionAdviceMessage(advice: ProductionAdvice): string {
    if (advice.meetsDeliveryDate || advice.recommendedAdditionalLooms === 0) {
      const sufficientLoomsMessage = `I ${advice.currentRunningLooms} telai già assegnati sono sufficienti per rispettare la data di consegna.`;

      if (this.isRealStartDate(this.itemData?.startDate)) {
        return sufficientLoomsMessage;
      }

      const marginDays = this.getProductionAdviceMarginDays(advice);

      if (marginDays === null) {
        return sufficientLoomsMessage;
      }

      if (marginDays === 0) {
        return `${sufficientLoomsMessage} L'articolo deve essere messo in produzione oggi.`;
      }

      const dayLabel = marginDays === 1 ? 'giorno' : 'giorni';
      return `${sufficientLoomsMessage} Hai ${marginDays} ${dayLabel} di margine per iniziare la produzione.`;
    }

    const additionalLoomLabel = advice.recommendedAdditionalLooms === 1 ? 'telaio' : 'telai';
    const totalLoomLabel = advice.recommendedTotalLooms === 1 ? 'telaio' : 'telai';

    return `Per rispettare la data di consegna, si consiglia di aggiungere almeno ${advice.recommendedAdditionalLooms} ${additionalLoomLabel} alla produzione.`;
  }

  private getProductionAdviceMarginDays(advice: ProductionAdvice): number | null {
    const estimatedCompletionDate = this.getComparableDateValue(advice.estimatedCompletionDate);
    const deliveryDate = this.getComparableDateValue(advice.deliveryDate);

    if (estimatedCompletionDate === null || deliveryDate === null) {
      return null;
    }

    return Math.max(Math.floor((deliveryDate - estimatedCompletionDate) / (24 * 60 * 60 * 1000)), 0);
  }

}
