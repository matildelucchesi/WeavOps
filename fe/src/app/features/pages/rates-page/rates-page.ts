import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { delayWhen, dematerialize, forkJoin, materialize, take, timeout, timer } from 'rxjs';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';
import { RateFacadeService } from '../../../services/rate-facade.service';
import { Service } from '../../../api/model/service';
import { Rate } from '../../../api/model/rate';
import { TableComponent, TableAction, TableActionClick, TableColumn, TableFilterButtonConfig } from '../../reusable-components/table-component/table-component';
import { FilterValues } from '../../reusable-components/button/filter-button-component/filter-button-component';
import { DialogRate } from '../../reusable-components/dialog/dialog-rate/dialog-rate';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';

@Component({
  selector: 'app-rates-page',
  standalone: true,
  imports: [TitlePageComponent, TableComponent, LoaderComponent],
  template: `<app-title-page-component title="Tariffe" iconName="price_change" [imageWidth]="40" [imageHeight]="40"></app-title-page-component>
    <div class="body">
    @if (loading()) { <app-loader-component ariaLabel="Caricamento tariffe in corso"></app-loader-component> }
      @for (section of sections(); track section.code) {
        <section class="rate-section" [attr.aria-labelledby]="'rates-' + section.code">
          <h2 [id]="'rates-' + section.code">{{section.title}}</h2>
          <app-table-component [columns]="section.code === 'SAMPLE_LOOMS' ? hourColumns : columns" [rows]="section.rows" [actions]="actions" [addButton]="addButton" [enableMultiSelection]="false" [sortByCreationDate]="false" (addButtonClick)="edit(null, section.code)" (actionClick)="onAction($event)"></app-table-component>
        </section>
      }
    </div>`,
  styles: `.body { margin-top:20px; color:var(--weavops-color-primary); } .rate-section { margin:32px 0 40px; } h2 { font-size:22px; margin-bottom:8px; }`,
})
export class RatesPage implements OnInit {
  private readonly service = inject(RateFacadeService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  readonly sections = signal<RateSection[]>([]);
  private readonly sectionDefinitions = [
    {code:'PICKS', title:'Colpi', criterion:'colpi per dm'},
    {code:'KNOTTING', title:'Annodature', criterion:'numero di fili'},
    {code:'DRAWING_IN', title:'Licciate', criterion:'numero di fili'},
    {code:'SAMPLE_LOOMS', title:'Telai a Campione', criterion:'ore'},
  ];
  readonly loading = signal(true); readonly loadError = signal(false);
  readonly errorMessage = signal('');
  private allRows: RateRow[] = [];
  private activeFilters: Record<string, FilterValues> = {};
  services: Service[] = [];
  readonly columns: TableColumn<RateRow>[] = [{header:'Fascia (min ≤ valore < max)', field:'band'}, {header:'Importo (€)', field:'formattedAmount'}];
  readonly hourColumns: TableColumn<RateRow>[] = [{header:'Numero di ore', field:'band'}, {header:'Importo (€)', field:'formattedAmount'}];
  readonly filterButton: TableFilterButtonConfig = {label:'Filtri', icon:'search', filters:[{id:'band', label:'Fascia'}, {id:'formattedAmount', label:'Importo'}]};
  readonly addButton = {label:'Aggiungi Nuovo', icon:'add', ariaLabel:'Aggiungi tariffa'};
  readonly actions: TableAction<RateRow>[] = [{id:'edit', label:'Modifica', icon:'edit'}, {id:'delete', label:'Elimina', icon:'delete', deleteItem: row => this.service.remove(row.id!), deleteItemName: row => `${row.serviceName}: ${row.band}`, deleteSuccessMessage:'Tariffa eliminata', deleteErrorMessage:'Impossibile eliminare la tariffa'}];
  ngOnInit(): void { this.refreshSections(); this.load(); }
  load(): void {
    const loadingStartedAt = Date.now();
    this.loading.set(true); this.loadError.set(false);
    forkJoin({services:this.service.getServices(), rates:this.service.getAll()}).pipe(
      timeout(15000),
      // Mantiene il loader per almeno un secondo anche in caso di errore immediato.
      materialize(),
      take(1),
      delayWhen(() => timer(Math.max(0, 1000 - (Date.now() - loadingStartedAt)))),
      dematerialize(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({next: data => {
      this.services = data.services;
      this.allRows = data.rates.map(rate => {
        const service = this.services.find(service => service.id === rate.serviceId);
        const band = service?.bandCriterion === 'HOURS'
          ? rate.hours?.toLocaleString('it', {maximumFractionDigits: 6}) ?? 'Durata da aggiornare'
          : `${rate.minimum?.toLocaleString('it') ?? '-'} – ${rate.maximum == null ? 'senza limite' : rate.maximum.toLocaleString('it')}`;
        return {...rate, serviceName:service?.name ?? 'Servizio non disponibile', criterionLabel: service?.bandCriterion === 'HOURS' ? 'Ore' : service?.bandCriterion === 'THREADS' ? 'Numero di fili' : 'Colpi per dm', band, formattedAmount:this.formatAmount(rate)};
      }).sort((a,b) => a.serviceName.localeCompare(b.serviceName, 'it') || (a.hours ?? a.minimum ?? 0)-(b.hours ?? b.minimum ?? 0));
      this.refreshSections(); this.loading.set(false);
      if (this.sectionDefinitions.some(section => !this.services.some(service => service.code === section.code))) {
        this.loadError.set(true); this.errorMessage.set('Servizi del listino non inizializzati. Riavvia il backend dall’IDE.');
      }
    }, error: error => { this.loading.set(false); this.loadError.set(true); this.errorMessage.set(error.status === 404 ? 'API del listino non disponibili. Riavvia il backend aggiornato dall’IDE.' : error.status === 401 ? 'Sessione scaduta. Accedi nuovamente per caricare il listino.' : 'Impossibile caricare il listino. Verifica che il backend sia avviato e riprova.'); }});
  }
  filter(filters: FilterValues, code: string): void { this.activeFilters[code] = filters; this.refreshSections(code); }
  formatAmount(rate: Rate): string {
    if (rate.pricingType === 'ON_REQUEST') {
      return rate.description || 'Tariffa da concordare';
    }
    if (rate.amount == null) {
      return 'Importo non disponibile';
    }
    const formatted = rate.amount.toLocaleString('it', {
      minimumFractionDigits: 2,
      maximumFractionDigits: rate.pricingType === 'PER_THREAD' ? 6 : 2,
    });
    const value = rate.pricingType === 'PER_THREAD' ? `${formatted} €/filo` : formatted;
    return rate.description ? `${value} — ${rate.description}` : value;
  }
  private refreshSections(changedCode?: string): void {
    this.sections.set(this.sectionDefinitions.map(section => {
      const existing = this.sections().find(previous => previous.code === section.code);
      if (changedCode && section.code !== changedCode && existing) return existing;
      const service = this.services.find(service => service.code === section.code);
      return {...section, rows: this.allRows.filter(row => service && row.serviceId === service.id && Object.entries(this.activeFilters[section.code] ?? {}).every(([key,value]) => String(row[key as keyof RateRow] ?? '').toLocaleLowerCase('it').includes(value.trim().toLocaleLowerCase('it'))))};
    }));
  }
  edit(rate: Rate | null = null, code?: string): void {
    const services = code ? this.services.filter(service => service.code === code) : this.services.filter(service => service.id === rate?.serviceId);
    this.dialog.open(DialogRate, {width:'650px', maxWidth:'calc(100vw - 32px)', data:{services, rate}}).afterClosed().subscribe(saved => { if (saved) this.load(); });
  }
  onAction(event: TableActionClick<RateRow>): void { if (event.action.id === 'edit') this.edit(event.row); if (event.action.id === 'delete') this.load(); }
}
interface RateRow extends Rate { serviceName:string; criterionLabel:string; band:string; formattedAmount:string; }
interface RateSection { code:string; title:string; criterion:string; rows:RateRow[]; }
