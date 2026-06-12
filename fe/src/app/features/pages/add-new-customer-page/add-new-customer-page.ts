import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ExitButtonComponent } from "../../reusable-components/exit-button-component/exit-button-component";
import { MatIcon } from "@angular/material/icon";
import { ButtonGeneralActionComponent } from "../../reusable-components/button-general-action-component/button-general-action-component";
import { ReferentFacadeService } from '../../../services/referent-facade.service';
import { Customer } from '../../../api/model/customer';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timeout } from 'rxjs';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";

@Component({
  selector: 'app-add-new-customer-page',
  imports: [TitlePageComponent, ExitButtonComponent, MatIcon, ButtonGeneralActionComponent, FormsModule, LoaderComponent, DecorativeLinesComponent],
  standalone: true,
  templateUrl: './add-new-customer-page.html',
  styleUrl: './add-new-customer-page.scss',
})
export class AddNewCustomerPage implements OnDestroy {
  private readonly loaderDurationMs: number = 1200;
  private readonly saveTimeoutMs: number = 15000;
  private readonly referentService = inject(ReferentFacadeService);
  private readonly customerService = inject(CustomerFacadeService);
  private snackBar = inject(MatSnackBar);
  private loaderTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isLoaderFinished: boolean = false;
  private pendingSnackBar: (() => void) | null = null;

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

  public goBackToCustomerPage(): void {
    window.history.back();
  }

  public ngOnDestroy(): void {
    if (this.loaderTimeoutId) {
      clearTimeout(this.loaderTimeoutId);
    }
  }

  public createNewCustomer(): void {
    if (this.isSaving() || this.isRequestPending) {
      return;
    }

    const customer: Customer = {
      name: this.customerName,
      email: this.customerEmail,
      note: this.note,
      items: [],
      referents: [
        {
          firstName: this.referentName1,
          lastName: this.referentSurname1,
          phoneNumber: this.referentPhone1
        },
        {
          firstName: this.referentName2,
          lastName: this.referentSurname2,
          phoneNumber: this.referentPhone2
        }
      ]
    };

    this.showLoader();
    this.isRequestPending = true;

    this.customerService.create(customer).pipe(
      timeout(this.saveTimeoutMs)
    ).subscribe({
      next: () => {
        this.isRequestPending = false;
        console.log('Customer created successfully');
        this.showSnackBarAfterLoader(() => {
          this.snackBar.open('Cliente creato con successo', 'Chiudi', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isRequestPending = false;
        console.error('Error creating customer:', err);
        const errorMessage = err.error?.message ?? 'Errore durante la creazione del cliente';
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

  private showLoader(): void {
    if (this.loaderTimeoutId) {
      clearTimeout(this.loaderTimeoutId);
    }

    this.isSaving.set(true);
    this.isLoaderFinished = false;
    this.pendingSnackBar = null;

    this.loaderTimeoutId = setTimeout(() => {
      this.isSaving.set(false);
      this.isLoaderFinished = true;

      if (this.pendingSnackBar) {
        this.pendingSnackBar();
        this.pendingSnackBar = null;
      }

      this.loaderTimeoutId = null;
    }, this.loaderDurationMs);
  }

  private showSnackBarAfterLoader(callback: () => void): void {
    if (this.isLoaderFinished) {
      callback();
      return;
    }

    this.pendingSnackBar = callback;
  }

}
