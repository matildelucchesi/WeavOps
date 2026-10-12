import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CertificationFacadeService } from '../../../services/certification-facade.service';
import { Certification } from '../../../api/model/certification';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogProductionSchedule, type ProductionSchedule, type ProductionScheduleDialogData } from '../../reusable-components/dialog/dialog-production-schedule/dialog-production-schedule';
import { Router } from '@angular/router';
import { map, switchMap, timeout } from 'rxjs';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";
import { ButtonGeneralActionComponent } from "../../reusable-components/button/button-general-action-component/button-general-action-component";
import { ItemFacadeService } from '../../../services/item-facade.service';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { Customer, Item } from '../../../api';
import { CustomerItemHistoryFacadeService } from '../../../services/customer-item-history-facade.service';

@Component({
  selector: 'app-item-add-new-page',
  imports: [
    //DecorativeLinesComponent,
    TitlePageComponent,
    ExitButtonComponent,
    FormsModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIcon,
    MatInputModule,
    ButtonGeneralActionComponent,
    LoaderComponent
],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
  ],
  standalone: true,
  templateUrl: './item-add-new-page.html',
  styleUrl: './item-add-new-page.scss',
})
export class ItemAddNewPage implements OnInit, OnDestroy {
  private readonly loaderDurationMs: number = 1200;
  private readonly saveTimeoutMs: number = 15000;
  private readonly certificationService = inject(CertificationFacadeService);
  public certifications: Certification[] = [];
  private readonly itemService = inject(ItemFacadeService);
  private readonly customerService = inject(CustomerFacadeService);
  private readonly customerItemHistoryService = inject(CustomerItemHistoryFacadeService);
  private readonly navigationService = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private loaderTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isLoaderFinished: boolean = false;
  private pendingSnackBar: (() => void) | null = null;

  public warpWeight: number | null = null;
  public weftWeight: number | null = null;
  public isCertified: Item.IsCertifiedEnum | undefined;
  public certificationId: string | undefined;
  public readonly displayCertificationState = (state: Item.IsCertifiedEnum | undefined): string =>
    state === 'ALL' ? 'Tutte' : state === 'NONE' ? 'Nessuna' : state === 'PARTIAL' ? 'Alcune' : 'Non specificato';

  public get certificationStateLabel(): string {
    return this.displayCertificationState(this.isCertified);
  }

  public selectCertificationState(state: Item.IsCertifiedEnum | undefined): void {
    this.isCertified = state;
    if (state !== 'ALL' && state !== 'PARTIAL') this.certificationId = undefined;
  }

  public get totalWeight(): number | null {
    if (this.warpWeight == null || this.weftWeight == null) return null;
    return Number((Number(this.warpWeight) + Number(this.weftWeight)).toPrecision(15));
  }
  public itemName: string = '';
  public customerName: string = '';
  public piecesCount: number | null = null; //numero pezze
  public pieceLength: number | null = null; //lunghezza pezze in metro
  public hitsPerDm: number | null = null; //numero colpi per decimetro
  public reedCount: number | null = null; //misura pettine
  public reedCM: number | null = null; //in quanti centimetri è il pettine
  public reedHeight: number | null = null; //altezza pettine in centimetri
  public warpLength: number | null = null; //lunghezza ordito in metri
  public warpEndCount: number | null = null; //numero fili ordito
  public deliveryDate: Date | null = null;

  public readonly isSaving = signal(false);
  public readonly customers = signal<Customer[]>([]);
  public readonly filteredCustomers = signal<Customer[]>([]);
  public isRequestPending: boolean = false;
  public hasSubmitted: boolean = false;

  public ngOnInit(): void {
    this.loadCustomers();
    this.certificationService.getAll().subscribe({next: values => this.certifications = values, error: () => this.snackBar.open('Impossibile caricare le certificazioni', 'Chiudi')});
  }

  public ngOnDestroy(): void {
    if (this.loaderTimeoutId) {
      clearTimeout(this.loaderTimeoutId);
    }
  }

  public shouldShowControlError(control: NgModel): boolean {
    return Boolean(control.invalid && (control.touched || control.dirty || this.hasSubmitted));
  }

  public filterCustomers(value: string): void {
    const normalizedValue = value.trim().toLowerCase();
    const customers = this.customers();

    this.filteredCustomers.set(
      normalizedValue
        ? customers.filter((customer) => customer.name.toLowerCase().includes(normalizedValue))
        : customers,
    );
  }

  public selectCustomer(customerName: string): void {
    this.customerName = customerName;
    this.filterCustomers(customerName);
  }

  public createNewItem(itemForm: NgForm): void {
    if (this.isSaving() || this.isRequestPending) {
      return;
    }

    this.hasSubmitted = true;

    if (itemForm.invalid) {
      itemForm.control.markAllAsTouched();
      return;
    }

    this.isRequestPending = true;
    const dialogRef = this.dialog.open<
      DialogProductionSchedule,
      ProductionScheduleDialogData,
      ProductionSchedule
    >(DialogProductionSchedule, {
      panelClass: 'loom-alert-dialog-panel',
      width: '520px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: false,
      data: {
        title: 'Turni di produzione nel weekend',
        description: 'Dal lunedì al venerdì la previsione considera 24 ore di lavoro al giorno.',
        confirmLabel: 'Crea articolo',
      },
    });

    dialogRef.afterClosed().subscribe((schedule) => {
      if (!schedule) {
        this.isRequestPending = false;
        return;
      }

      this.persistNewItem(schedule);
    });
  }

  private persistNewItem(schedule: ProductionSchedule): void {
    this.showLoader();
    this.itemService.createItemWithArrangement({
      warpWeight: this.warpWeight ?? undefined,
      weftWeight: this.weftWeight ?? undefined,
      isCertified: this.isCertified,
      certificationId: this.isCertified === 'ALL' || this.isCertified === 'PARTIAL' ? this.certificationId : undefined,
      customerName: this.customerName.trim(),
      arrangement: {
        itemName: this.itemName.trim(),
        piecesCount: Number(this.piecesCount),
        pieceLength: Number(this.pieceLength),
        hitsPerDm: Number(this.hitsPerDm),
        reedCount: Number(this.reedCount),
        reedCM: Number(this.reedCM),
        reedHeight: Number(this.reedHeight),
        warpLength: Number(this.warpLength),
        warpEndCount: Number(this.warpEndCount),
        deliveryDate: this.deliveryDate ? this.deliveryDate.toISOString() : undefined,
        ...schedule,
      },
    }).pipe(
      timeout(this.saveTimeoutMs),
      switchMap((createdItem: Item) => this.createCustomerItemHistory(createdItem)),
    ).subscribe({
      next: (response) => {
        this.isRequestPending = false;
        console.log('Item created successfully:', response);
        this.showSnackBarAfterLoader(() => {
          this.snackBar.open('Articolo creato con successo', 'Chiudi', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          this.navigationService.navigate(['/articoli']);
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isRequestPending = false;
        console.error('Error creating item:', error);
        const errorMessage = error.error?.message ?? "Errore durante la creazione dell'articolo";
        this.showSnackBarAfterLoader(() => {
          this.snackBar.open(errorMessage, 'Chiudi', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar'],
          });
        });
      },
    });
  }
  private loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (customers) => {
        const sortedCustomers = [...customers].sort((firstCustomer, secondCustomer) =>
          firstCustomer.name.localeCompare(secondCustomer.name, 'it', { sensitivity: 'base' })
        );

        this.customers.set(sortedCustomers);
        this.filterCustomers(this.customerName);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading customers:', error);
        this.customers.set([]);
        this.filteredCustomers.set([]);
      },
    });
  }

  private createCustomerItemHistory(createdItem: Item) {
    if (!createdItem.id || !createdItem.customerId) {
      throw new Error('Impossibile creare la cronologia articolo: id articolo o cliente mancante');
    }

    return this.customerItemHistoryService.create({
      customerId: createdItem.customerId,
      itemId: createdItem.id,
    }).pipe(map(() => createdItem));
  }

  private showLoader(): void {
    if (this.loaderTimeoutId) {
      clearTimeout(this.loaderTimeoutId);
    }

    this.isSaving.set(true);
    this.isLoaderFinished = false;
    this.pendingSnackBar = null;

    this.loaderTimeoutId = setTimeout(() => {
      this.isLoaderFinished = true;
      this.loaderTimeoutId = null;

      this.flushPendingSnackBar();
    }, this.loaderDurationMs);
  }

  private showSnackBarAfterLoader(callback: () => void): void {
    this.pendingSnackBar = callback;
    this.flushPendingSnackBar();
  }

  private flushPendingSnackBar(): void {
    if (!this.isLoaderFinished || this.isRequestPending || !this.pendingSnackBar) {
      return;
    }

    const callback = this.pendingSnackBar;

    this.isSaving.set(false);
    this.pendingSnackBar = null;
    callback();
  }
}
