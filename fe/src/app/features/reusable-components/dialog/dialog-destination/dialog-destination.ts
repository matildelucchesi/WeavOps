import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Destination } from '../../../../api/model/destination';
import { DestinationFacadeService } from '../../../../services/destination-facade.service';

@Component({
  selector: 'app-dialog-destination', standalone: true, imports: [FormsModule],
  templateUrl: './dialog-destination.html', styleUrl: './dialog-destination.scss',
})
export class DialogDestination {
  private readonly dialogRef = inject(MatDialogRef<DialogDestination, boolean>);
  public readonly original = inject<Destination | null>(MAT_DIALOG_DATA);
  private readonly service = inject(DestinationFacadeService);
  public model: Destination = this.original ? {...this.original, name: this.original.name.toLocaleUpperCase('it'), street: this.original.street.toLocaleUpperCase('it'), streetNumber: this.original.streetNumber.toLocaleUpperCase('it'), city: this.original.city.toLocaleUpperCase('it'), provinceCode: this.original.provinceCode.toUpperCase()} : {name: '', street: '', streetNumber: '', postalCode: '', city: '', provinceCode: ''};
  public submitted = false;
  public isSaving = false;
  public errorMessage = '';
  public close(): void { if (!this.isSaving) this.dialogRef.close(false); }
  public save(form: NgForm): void {
    if (this.isSaving) return;
    this.submitted = true;
    if (form.invalid || ![this.model.name, this.model.street, this.model.streetNumber, this.model.city].every(value => value.trim())) {
      form.control.markAllAsTouched(); this.errorMessage = 'Compilare tutti i campi. Il CAP deve avere 5 cifre e la provincia 2 lettere.'; return;
    }
    const destination: Destination = {
      name: this.model.name.trim().toLocaleUpperCase('it'), street: this.model.street.trim().toLocaleUpperCase('it'), streetNumber: this.model.streetNumber.trim().toLocaleUpperCase('it'),
      postalCode: this.model.postalCode.trim(), city: this.model.city.trim().toLocaleUpperCase('it'), provinceCode: this.model.provinceCode.trim().toUpperCase(),
    };
    this.isSaving = true; this.errorMessage = ''; this.dialogRef.disableClose = true;
    const request = this.original?.id ? this.service.update(this.original.id, destination) : this.service.create(destination);
    request.subscribe({
      next: () => this.dialogRef.close(true),
      error: error => { this.isSaving = false; this.dialogRef.disableClose = false; this.errorMessage = error.error?.message ?? 'Impossibile salvare la destinazione.'; },
    });
  }
}
