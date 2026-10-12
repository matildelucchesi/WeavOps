import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CertificationFacadeService } from '../../../../services/certification-facade.service';

@Component({
  selector:'app-dialog-certification', standalone:true, imports:[FormsModule],
  template: `<div class="destination-dialog"><h2>Aggiungi certificazione</h2><form #form="ngForm" (ngSubmit)="save(form)"><div class="fields">
    <label class="field full">Codice<input name="value" [ngModel]="value" (ngModelChange)="value = $event.toLocaleUpperCase('it')" required [disabled]="saving()"></label>
    <label class="field full">Descrizione<input name="description" [(ngModel)]="description" required [disabled]="saving()"></label></div>
    @if (error()) { <p class="error" role="alert">{{error()}}</p> }
    <div class="actions"><button type="button" class="cancel" [disabled]="saving()" (click)="ref.close(false)">Annulla</button><button type="submit" class="save" [disabled]="saving()">{{saving() ? 'Salvataggio…' : 'Salva'}}</button></div></form></div>`,
  styleUrl:'../dialog-destination/dialog-destination.scss',
})
export class DialogCertification {
  readonly ref = inject(MatDialogRef<DialogCertification, boolean>);
  private readonly service = inject(CertificationFacadeService);
  value = ''; description = '';
  readonly saving = signal(false);
  readonly error = signal('');
  save(form: NgForm): void {
    if (this.saving()) return;
    if (form.invalid || !this.value.trim() || !this.description.trim()) { form.control.markAllAsTouched(); this.error.set('Codice e descrizione sono obbligatori.'); return; }
    this.saving.set(true); this.error.set(''); this.ref.disableClose = true;
    this.service.create({value:this.value.trim().toLocaleUpperCase('it'), description:this.description.trim()}).subscribe({next: () => this.ref.close(true), error: response => { this.saving.set(false); this.ref.disableClose = false; this.error.set(response.status === 409 ? 'Codice certificazione già presente.' : 'Impossibile salvare la certificazione.'); }});
  }
}
