import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { Customer, Destination } from '../../../../api';
import { CustomerFacadeService } from '../../../../services/customer-facade.service';
import { DestinationFacadeService } from '../../../../services/destination-facade.service';
import { DialogDestination } from '../dialog-destination/dialog-destination';

@Component({
  selector: 'app-dialog-customer-destinations', standalone: true, imports: [FormsModule, MatIconModule],
  template: `
    <h2>{{ initial.name.toLocaleUpperCase('it') }}</h2>
    @if (loading) { <p>Caricamento…</p> }
    @if (error) { <p role="alert" class="error">{{ error }}</p> }
    @if (!loading && customer) {
      <label for="destinationSearch">Cerca aziende di destinazione</label>
      <input id="destinationSearch" [(ngModel)]="search" placeholder="Nome o indirizzo" [disabled]="saving">
      <div class="destinations">
        @for (destination of destinations; track destination.id) {
          @if (matches(destination)) {
            <div class="destination">
              <label>
                <input type="checkbox" [checked]="selected.includes(destination.id!)" [disabled]="saving"
                  (change)="toggle(destination.id!, $any($event.target).checked)">
                <span><strong>{{ destination.name }}</strong><br>{{ destination.street }} {{ destination.streetNumber }}, {{ destination.postalCode }} {{ destination.city }} ({{ destination.provinceCode }})</span>
              </label>
              <button type="button" class="edit" [disabled]="saving" [attr.aria-label]="'Modifica destinazione ' + destination.name" (click)="edit(destination)"><mat-icon>edit</mat-icon></button>
            </div>
          }
        } @empty { <p>Nessuna destinazione disponibile.</p> }
      </div>
      <p class="hint">Le modifiche ai dati di un’azienda si applicano a tutti i clienti che la utilizzano.</p>
    }
    <div class="actions">
      <button type="button" [disabled]="saving" (click)="close()">Chiudi</button>
      <button type="button" class="save" [disabled]="loading || saving || !customer" (click)="save()">{{ saving ? 'Salvataggio…' : 'Salva associazioni' }}</button>
    </div>
  `,
  styles: `
    :host { display:block; padding:24px; color:var(--weavops-color-primary); font-family:'Instrument Sans',sans-serif; }
    h2 { margin-top:0; } input:not([type=checkbox]) { display:block; width:100%; box-sizing:border-box; padding:10px; margin:8px 0 16px; border:1.5px solid var(--weavops-color-primary); border-radius:10px; font:inherit; }
    .destinations { max-height:45vh; overflow:auto; } .destination { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--weavops-color-primary); }
    .destination label { display:flex; align-items:center; gap:12px; flex:1; cursor:pointer; } input[type=checkbox] { accent-color:var(--weavops-color-primary); }
    button { padding:8px 16px; border:1px solid var(--weavops-color-primary); border-radius:8px; background:transparent; color:inherit; font:inherit; cursor:pointer; }
    .edit { padding:6px; display:flex; } .actions { display:flex; justify-content:flex-end; gap:12px; margin-top:20px; } .save { background:var(--weavops-color-primary); color:white; }
    button:disabled { opacity:.5; cursor:default; } .error { color:var(--weavops-color-danger); } .hint { font-size:12px; }
  `,
})
export class DialogCustomerDestinations implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly initial = inject<Customer>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<DialogCustomerDestinations, boolean>);
  private readonly dialog = inject(MatDialog);
  private readonly customers = inject(CustomerFacadeService);
  private readonly destinationService = inject(DestinationFacadeService);
  customer: Customer | null = null;
  destinations: Destination[] = [];
  selected: string[] = [];
  search = '';
  loading = true;
  saving = false;
  error = '';
  private edited = false;
  ngOnInit(): void {
    this.ref.disableClose = true;
    forkJoin({customer: this.customers.getById(this.initial.id!), destinations: this.destinationService.getAll()}).subscribe({
      next: ({customer, destinations}) => { this.customer = customer; this.selected = [...(customer.destinationIds ?? [])]; this.destinations = destinations; this.loading = false; this.changeDetector.markForCheck(); },
      error: () => { this.error = 'Impossibile caricare le destinazioni del cliente.'; this.loading = false; this.changeDetector.markForCheck(); },
    });
  }
  matches(destination: Destination): boolean {
    return [destination.name, destination.street, destination.streetNumber, destination.postalCode, destination.city, destination.provinceCode].join(' ').toLocaleLowerCase('it').includes(this.search.trim().toLocaleLowerCase('it'));
  }
  toggle(id: string, checked: boolean): void {
    this.selected = checked ? [...new Set([...this.selected, id])] : this.selected.filter(value => value !== id);
  }
  edit(destination: Destination): void {
    this.dialog.open<DialogDestination, Destination, boolean>(DialogDestination, {data: destination, width: '600px', maxWidth: 'calc(100vw - 32px)'}).afterClosed().subscribe(saved => {
      if (saved) {
        this.edited = true;
        this.destinationService.getAll().subscribe({
          next: rows => { this.destinations = rows; this.changeDetector.markForCheck(); },
          error: () => { this.error = 'Destinazione salvata. Impossibile aggiornare l’elenco.'; this.changeDetector.markForCheck(); },
        });
      }
    });
  }
  close(): void { if (!this.saving) this.ref.close(this.edited); }
  save(): void {
    if (!this.customer?.id || this.saving) return;
    this.saving = true; this.error = '';
    this.customers.update(this.customer.id, {...this.customer, destinationIds: [...this.selected]}).subscribe({
      next: () => this.ref.close(true),
      error: err => { this.saving = false; this.error = err.error?.message ?? 'Impossibile salvare le associazioni. Verifica i dati obbligatori del cliente.'; this.changeDetector.markForCheck(); },
    });
  }
}
