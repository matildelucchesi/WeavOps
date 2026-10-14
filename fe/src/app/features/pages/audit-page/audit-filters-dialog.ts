import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

export interface AuditFilters { year: string; from: string; to: string; }

@Component({
  standalone: true, imports: [FormsModule, MatIcon],
  template: `<div class="filters-dialog"><header><h2><mat-icon>search</mat-icon>Filtri</h2><button class="cancel" type="button" (click)="ref.close()">Annulla</button></header>
    <form (ngSubmit)="apply()"><div class="fields">
      <label class="year-field"><select aria-label="Anno" name="year" [(ngModel)]="filters.year"><option value="" disabled>Anno</option>@for(year of yearOptions; track year) { <option [value]="year">{{year}}</option> }</select></label>
      <label><span>Dal</span><input name="from" type="date" aria-label="Dal" lang="it" [(ngModel)]="filters.from" [max]="filters.to"></label>
      <label><span>Al</span><input name="to" type="date" aria-label="Al" lang="it" [(ngModel)]="filters.to" [min]="filters.from"></label>
    </div>@if(invalidPeriod) { <p role="alert">La data iniziale deve precedere o coincidere con quella finale.</p> }
    <div class="actions"><button class="clear" type="button" (click)="clear()">Rimuovi filtri</button><button class="apply" type="submit" [disabled]="invalidPeriod">Filtra</button></div></form></div>`,
  styles: `.filters-dialog { padding:24px; color:var(--weavops-color-primary); background:white; font-family:'Instrument Sans',sans-serif; }
    header,h2 { display:flex; align-items:center; gap:8px; } header { justify-content:space-between; margin-bottom:16px; } h2 { margin:0; font-size:20px; font-weight:700; }
    .fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    .year-field { grid-column:1 / -1; }
    label { display:flex; align-items:center; gap:8px; min-width:0; padding:6px 12px; border:1px solid var(--weavops-color-primary); border-radius:4px; background:var(--weavops-color-surface-muted); font-size:16px; }
    input,select { width:100%; min-width:0; box-sizing:border-box; padding:4px 0; border:0; background:transparent; color:var(--weavops-color-primary); font:inherit; }
    .actions { display:flex; justify-content:flex-end; gap:12px; margin-top:24px; flex-wrap:wrap; }
    button { padding:8px 20px; min-height:35px; border-radius:12px; font:inherit; font-weight:700; cursor:pointer; }
    .cancel { border:1.5px solid var(--weavops-color-primary); background:white; color:var(--weavops-color-primary); }
    .apply { border:0; background:var(--weavops-color-accent); color:white; }
    .apply,.cancel { width:100px; min-width:100px; height:30px; min-height:30px; box-sizing:border-box; padding:0 12px; border-radius:10px; font-size:14px; }
    .clear { border:0; background:transparent; color:var(--weavops-color-primary); font-size:13px; text-decoration:underline; }
    button:disabled { opacity:.5; cursor:default; }`,
})
export class AuditFiltersDialog {
  readonly data = inject<AuditFilters & { years: string[] }>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<AuditFiltersDialog, AuditFilters>);
  readonly currentYear = Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Europe/Rome' }).format(new Date()));
  readonly yearOptions = [...new Set([
    ...Array.from({ length: 10 }, (_, index) => String(this.currentYear - index)),
    ...this.data.years,
  ])].sort().reverse();
  filters: AuditFilters = { year: this.data.year, from: this.data.from, to: this.data.to };
  get invalidPeriod(): boolean { return !!this.filters.from && !!this.filters.to && this.filters.from > this.filters.to; }
  apply(): void { if (!this.invalidPeriod) this.ref.close({ ...this.filters }); }
  clear(): void { this.ref.close({ year: '', from: '', to: '' }); }
}
