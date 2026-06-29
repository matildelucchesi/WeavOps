import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";
import { MatIcon } from "@angular/material/icon";
import { ButtonGeneralActionComponent } from "../../reusable-components/button/button-general-action-component/button-general-action-component";
import { ReferentFacadeService } from '../../../services/referent-facade.service';
import { Customer } from '../../../api/model/customer';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timeout } from 'rxjs';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { Referent } from '../../../api';

@Component({
  selector: 'app-customer-details-page',
  imports: [TitlePageComponent, ExitButtonComponent, MatIcon, ButtonGeneralActionComponent, FormsModule, MatFormFieldModule, LoaderComponent, DecorativeLinesComponent],
  standalone: true,
  templateUrl: './customer-details-page.html',
  styleUrl: './customer-details-page.scss',
})
export class CustomerDetailsPage implements OnInit, OnDestroy {
  private readonly loaderDurationMs: number = 1200;
  private readonly saveTimeoutMs: number = 15000;
  private readonly navigationService = inject(Router);
  private readonly customerService = inject(CustomerFacadeService);
  private readonly route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private loaderTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isLoaderFinished: boolean = false;
  private pendingSnackBar: (() => void) | null = null;
  private customerId: string | null = null;

  public customerName: string = '';
  public customerEmail: string = '';
  public note: string = '';
  public referentName1: string = '';
  public referentSurname1: string = '';
  public referentPhone1: string = '';
  public referentName2: string = '';
  public referentSurname2: string = '';
  public referentPhone2: string = '';
  public readonly isSaving = signal(false);
  public isRequestPending: boolean = false;
  public hasSubmitted: boolean = false;
  public readonly personNameMaxLength: number = 40;
  public readonly phoneMaxLength: number = 20;
  public readonly emailMaxLength: number = 120;
  public readonly noteMaxLength: number = 500;
  public readonly phonePattern: string = "^\\+?[0-9\\s().-]{6,20}$";

  //edit mode
  @Input() isEditMode: boolean = false;
  public customer: Customer | null = null;
  public referentsList: Array<Referent> = [];

  public goBackToCustomerPage(): void {
    window.history.back();
  }

  public ngOnInit(): void {
    const navigationCustomer = this.getNavigationCustomer();

    if (navigationCustomer) {
      this.populateForm(navigationCustomer);
    }

    this.customerId = this.route.snapshot.queryParamMap.get('id') ?? navigationCustomer?.id ?? null;
    this.isEditMode = Boolean(this.customerId || navigationCustomer);

    if (this.customerId) {
      this.loadCustomer(this.customerId);
    }
  }

  public ngOnDestroy(): void {
    if (this.loaderTimeoutId) {
      clearTimeout(this.loaderTimeoutId);
    }
  }

  public createNewCustomer(form?: NgForm): void {
    if (this.isSaving() || this.isRequestPending) {
      return;
    }

    this.hasSubmitted = true;

    const validationErrorMessage = this.getValidationErrorMessage();

    if (form?.invalid || validationErrorMessage) {
      form?.control.markAllAsTouched();
      this.openErrorSnackBar(validationErrorMessage ?? 'Controllare i campi evidenziati');
      return;
    }

    const customer: Customer = {
      name: this.customerName.trim(),
      email: this.customerEmail.trim(),
      note: this.note.trim(),
      items: this.customer?.items ?? [],
      referents: this.buildReferents(),
    };

    this.showLoader();
    this.isRequestPending = true;

    const saveRequest = this.isEditMode && this.customerId
      ? this.customerService.update(this.customerId, customer)
      : this.customerService.create(customer);
    const successMessage = this.isEditMode ? 'Cliente modificato con successo' : 'Cliente creato con successo';
    const fallbackErrorMessage = this.isEditMode
      ? 'Errore durante la modifica del cliente'
      : 'Errore durante la creazione del cliente';

    saveRequest.pipe(
      timeout(this.saveTimeoutMs)
    ).subscribe({
      next: () => {
        this.isRequestPending = false;
        console.log(this.isEditMode ? 'Customer updated successfully' : 'Customer created successfully');
        this.showSnackBarAfterLoader(() => {
          this.snackBar.open(successMessage, 'Chiudi', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          this.navigationService.navigate(['/clienti']);
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isRequestPending = false;
        console.error(this.isEditMode ? 'Error updating customer:' : 'Error creating customer:', err);
        const errorMessage = err.error?.message ?? fallbackErrorMessage;
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

  private loadCustomer(customerId: string): void {
    this.customerService.getById(customerId).subscribe({
      next: (customer) => {
        this.populateForm(customer);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading customer:', err);
        const errorMessage = err.error?.message ?? 'Errore durante il caricamento del cliente';
        this.snackBar.open(errorMessage, 'Chiudi', {
          duration: 4000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  public shouldShowControlError(control: NgModel): boolean {
    return Boolean(control.invalid && (control.touched || control.dirty || this.hasSubmitted));
  }

  public hasSecondReferentData(): boolean {
    return Boolean(
      this.referentName2.trim()
        || this.referentSurname2.trim()
        || this.referentPhone2.trim(),
    );
  }

  public hasFirstReferentData(): boolean {
    return Boolean(
      this.referentName1.trim()
        || this.referentSurname1.trim()
        || this.referentPhone1.trim(),
    );
  }

  private getNavigationCustomer(): Customer | null {
    const state = window.history.state as { customer?: unknown } | null;
    const customer = state?.customer;

    if (!this.isCustomer(customer)) {
      return null;
    }

    return customer;
  }

  private isCustomer(value: unknown): value is Customer {
    return Boolean(
      value
        && typeof value === 'object'
        && 'name' in value
        && 'email' in value,
    );
  }

  private populateForm(customer: Customer): void {
    const firstReferent = customer.referents?.[0];
    const secondReferent = customer.referents?.[1];

    this.customer = customer;
    this.referentsList = customer.referents ?? [];
    this.customerName = customer.name;
    this.customerEmail = customer.email;
    this.note = customer.note ?? '';
    this.referentName1 = firstReferent?.firstName ?? '';
    this.referentSurname1 = firstReferent?.lastName ?? '';
    this.referentPhone1 = firstReferent?.phoneNumber ?? '';
    this.referentName2 = secondReferent?.firstName ?? '';
    this.referentSurname2 = secondReferent?.lastName ?? '';
    this.referentPhone2 = secondReferent?.phoneNumber ?? '';
  }

  private buildReferents(): Referent[] {
    const referents: Referent[] = [];

    if (this.hasFirstReferentData()) {
      referents.push({
        firstName: this.referentName1.trim(),
        lastName: this.referentSurname1.trim(),
        phoneNumber: this.referentPhone1.trim(),
      });
    }

    if (this.hasSecondReferentData()) {
      referents.push({
        firstName: this.referentName2.trim(),
        lastName: this.referentSurname2.trim(),
        phoneNumber: this.referentPhone2.trim(),
      });
    }

    return referents;
  }

  private getValidationErrorMessage(): string | null {
    const customerName = this.customerName.trim();
    const customerEmail = this.customerEmail.trim();
    const referentName1 = this.referentName1.trim();
    const referentSurname1 = this.referentSurname1.trim();
    const referentPhone1 = this.referentPhone1.trim();
    const referentName2 = this.referentName2.trim();
    const referentSurname2 = this.referentSurname2.trim();
    const referentPhone2 = this.referentPhone2.trim();
    const hasSecondReferent = this.hasSecondReferentData();

    if (!customerName) {
      return 'Inserire il nome del cliente';
    }

    if (customerEmail && (customerEmail.length > this.emailMaxLength || !this.isValidEmail(customerEmail))) {
      return 'Inserire un indirizzo email valido';
    }

    if (referentName1.length > this.personNameMaxLength) {
      return 'Il nome del referente 1 deve avere massimo 40 caratteri';
    }

    if (referentSurname1.length > this.personNameMaxLength) {
      return 'Il cognome del referente 1 deve avere massimo 40 caratteri';
    }

    if (referentPhone1 && !this.matches(referentPhone1, this.phonePattern)) {
      return 'Il numero di telefono deve essere valido';
    }

    if (hasSecondReferent) {
      if (referentName2.length > this.personNameMaxLength) {
        return 'Il nome del referente 2 deve avere massimo 40 caratteri';
      }

      if (referentSurname2.length > this.personNameMaxLength) {
        return 'Il cognome del referente 2 deve avere massimo 40 caratteri';
      }

      if (referentPhone2 && !this.matches(referentPhone2, this.phonePattern)) {
        return 'Il numero di telefono deve essere valido';
      }
    }

    if (this.note.length > this.noteMaxLength) {
      return `Le note non possono superare ${this.noteMaxLength} caratteri`;
    }

    return null;
  }

  private matches(value: string, pattern: string): boolean {
    return new RegExp(pattern).test(value);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  private openErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Chiudi', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
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
