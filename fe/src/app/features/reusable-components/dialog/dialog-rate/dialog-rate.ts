import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Service } from '../../../../api/model/service';
import { Rate, RatePricingType } from '../../../../api/model/rate';
import { RateFacadeService } from '../../../../services/rate-facade.service';
@Component({
  selector:'app-dialog-rate', standalone:true, imports:[FormsModule],
  template:`<div class="destination-dialog"><h2>{{data.rate ? 'Modifica tariffa' : 'Aggiungi tariffa'}} — {{serviceName}}</h2><form #form="ngForm" (ngSubmit)="save(form)">
    <div class="fields">
    @if (isHourly) {
      <label class="field full">Numero di ore *<input name="hours" type="number" [(ngModel)]="hours" required min="0" step="any" [disabled]="saving()"></label>
    } @else {
    <label class="field">Minimo incluso ({{unit}})<input name="minimum" type="number" [(ngModel)]="minimum" required min="0" [step]="step" [disabled]="saving()"></label>
    <label class="field">Massimo escluso ({{unit}})<input name="maximum" type="number" [(ngModel)]="maximum" min="0" [step]="step" placeholder="Senza limite" [disabled]="saving()"></label>
    }
    <label class="field full">Tipo di tariffa<select name="pricingType" [(ngModel)]="pricingType" [disabled]="saving()"><option value="FIXED">Importo fisso</option>@if (unit === 'fili') {<option value="PER_THREAD">Prezzo per filo totale</option>}<option value="ON_REQUEST">Da concordare</option></select></label>
    @if (pricingType !== 'ON_REQUEST') {
      <label class="field full">{{pricingType === 'PER_THREAD' ? 'Prezzo per filo (€)' : 'Importo fisso (€)'}}, IVA esclusa<input name="amount" type="number" [(ngModel)]="amount" required min="0" [step]="pricingType === 'PER_THREAD' ? '0.000001' : '0.01'" [disabled]="saving()"></label>
    }
    <label class="field full">Descrizione{{pricingType === 'ON_REQUEST' ? ' *' : ''}}<textarea name="description" [(ngModel)]="description" [required]="pricingType === 'ON_REQUEST'" [disabled]="saving()"></textarea></label></div>
    @if (!isHourly) {<p>Il minimo è incluso, il massimo è escluso. Lascia vuoto il massimo per una fascia senza limite.</p>}
    @if (error()) { <p class="error" role="alert">{{error()}}</p> }
    <div class="actions"><button type="button" class="cancel" [disabled]="saving()" (click)="ref.close(false)">Annulla</button><button class="save" type="submit" [disabled]="saving()">{{saving() ? 'Salvataggio…' : 'Salva'}}</button></div></form></div>`,
  styleUrl:'../dialog-destination/dialog-destination.scss',
})
export class DialogRate {
  readonly data = inject<{services:Service[]; rate:Rate | null}>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<DialogRate, boolean>);
  private readonly service = inject(RateFacadeService);
  serviceId = this.data.rate?.serviceId ?? this.data.services[0]?.id ?? '';
  get serviceName(): string { return this.data.services.find(service => service.id === this.serviceId)?.name ?? ''; }
  minimum: number | null = this.data.rate?.minimum ?? null;
  maximum: number | null = this.data.rate?.maximum ?? null;
  hours: number | null = this.data.rate?.hours ?? null;
  amount: number | null = this.data.rate?.amount ?? null;
  pricingType: RatePricingType = this.data.rate?.pricingType ?? 'FIXED';
  description = this.data.rate?.description ?? '';
  readonly saving = signal(false); readonly error = signal('');
  get unit(): string { const criterion = this.data.services.find(service => service.id === this.serviceId)?.bandCriterion; return criterion === 'HOURS' ? 'ore' : criterion === 'THREADS' ? 'fili' : 'colpi/dm'; }
  get step(): string { return this.unit === 'ore' ? 'any' : '1'; }
  get isHourly(): boolean { return this.unit === 'ore'; }
  save(form: NgForm): void {
    if (this.saving()) return;
    const factor = this.pricingType === 'PER_THREAD' ? 1000000 : 100;
    const invalidPrice = this.pricingType === 'ON_REQUEST'
      ? !this.description.trim()
      : this.amount == null || !Number.isFinite(this.amount) || this.amount < 0
        || Math.abs(this.amount * factor - Math.round(this.amount * factor)) > 0.000001;
    const invalidQuantity = this.isHourly
      ? this.hours == null || !Number.isFinite(this.hours) || this.hours <= 0
      : this.minimum == null || this.minimum < 0 || !Number.isInteger(this.minimum)
        || (this.maximum != null && (!Number.isInteger(this.maximum) || this.maximum <= this.minimum));
    if (form.invalid || !this.serviceId || invalidQuantity || invalidPrice || (this.pricingType === 'PER_THREAD' && this.unit !== 'fili')) {
      form.control.markAllAsTouched(); this.error.set(this.isHourly ? 'Inserisci un numero di ore positivo e un importo valido.' : 'Controlla fascia e tariffa: colpi e fili interi, importo fisso con due decimali, prezzo per filo con massimo sei decimali oppure una descrizione per la tariffa da concordare.'); return;
    }
    const rate: Rate = {
      serviceId:this.serviceId,
      ...(this.isHourly ? {hours:this.hours} : {minimum:this.minimum,maximum:this.maximum}),
      amount:this.pricingType === 'ON_REQUEST' ? null : this.amount,
      pricingType:this.pricingType,description:this.description.trim() || null,
    };
    this.saving.set(true); this.error.set(''); this.ref.disableClose = true;
    const request = this.data.rate?.id ? this.service.update(this.data.rate.id, rate) : this.service.create(rate);
    request.subscribe({next: () => this.ref.close(true), error: response => { this.saving.set(false); this.ref.disableClose = false; this.error.set(response.status === 409 ? this.isHourly ? 'Esiste già una tariffa per questo numero di ore.' : 'La fascia si sovrappone a una tariffa dello stesso servizio.' : 'Impossibile salvare. Verifica i dati e riprova.'); }});
  }
}
