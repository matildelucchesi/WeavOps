import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AuditFiltersDialog, AuditFilters } from './audit-filters-dialog';
import { forkJoin } from 'rxjs';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { FabricFacadeService } from '../../../services/fabric-facade.service';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { TableComponent, TableColumn } from '../../reusable-components/table-component/table-component';

interface AuditArticleRow {
  id: string;
  name: string;
  customer: string;
  endDate: string;
  certifications: string;
  pieces: number;
}

@Component({
  selector: 'app-audit-page', standalone: true,
  imports: [FormsModule, TitlePageComponent, TableComponent, MatIcon],
  templateUrl: './audit-page.html', styleUrl: './audit-page.scss',
})
export class AuditPage implements OnInit {
  private readonly dialog = inject(MatDialog);
  openFilters(): void {
    this.dialog.open<AuditFiltersDialog, AuditFilters & { years: string[] }, AuditFilters>(AuditFiltersDialog, {
      width: '600px', maxWidth: 'calc(100vw - 32px)', panelClass: 'filter-dialog-panel',
      data: { year: this.year(), from: this.from(), to: this.to(), years: this.years() },
    }).afterClosed().subscribe(filters => {
      if (filters) {
        this.year.set(filters.year); this.from.set(filters.from); this.to.set(filters.to);
      }
    });
  }
  private readonly itemsApi = inject(ItemFacadeService);
  private readonly arrangementsApi = inject(ArrangementFacadeService);
  private readonly customersApi = inject(CustomerFacadeService);
  private readonly fabricsApi = inject(FabricFacadeService);
  readonly allRows = signal<AuditArticleRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly year = signal('');
  readonly from = signal('');
  readonly to = signal('');
  readonly search = signal('');
  readonly years = computed(() => [...new Set(this.allRows().filter(row => row.endDate).map(row => row.endDate.slice(0, 4)))].sort().reverse());
  readonly invalidPeriod = computed(() => !!this.from() && !!this.to() && this.from() > this.to());
  readonly rows = computed(() => {
    if (this.invalidPeriod()) return [];
    const search = this.search().trim().toLocaleLowerCase('it');
    return this.allRows().filter(row =>
      (!this.year() || row.endDate.startsWith(this.year() + '-')) &&
      (!this.from() || !!row.endDate && row.endDate >= this.from()) &&
      (!this.to() || !!row.endDate && row.endDate <= this.to()) &&
      `${row.name} ${row.customer} ${row.certifications}`.toLocaleLowerCase('it').includes(search));
  });
  readonly columns: TableColumn<AuditArticleRow>[] = [
    { header: 'Articolo', field: 'name' },
    { header: 'Cliente', field: 'customer' },
    { header: 'Fine produzione', value: row => row.endDate ? row.endDate.split('-').reverse().join('/') : '—' },
    { header: 'Certificazioni', field: 'certifications' },
    { header: 'Pezze prodotte', field: 'pieces' },
  ];
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true);
    this.error.set(false);
    forkJoin({ items: this.itemsApi.getAll(), arrangements: this.arrangementsApi.getAll(),
      customers: this.customersApi.getAll(), fabrics: this.fabricsApi.getAll() }).subscribe({
      next: data => {
        const arrangements = new Map(data.arrangements.map(value => [value.id, value.itemName]));
        const customers = new Map(data.customers.map(value => [value.id, value.name]));
        this.allRows.set(data.items.filter(item => item.state === 'COMPLETED').map(item => {
          const fabrics = data.fabrics.filter(fabric => fabric.itemId === item.id && (fabric.piecesCount ?? 0) > 0);
          const certifications = [...new Set(fabrics.map(fabric => fabric.certificationValue || 'Non certificate'))];
          const date = item.endDate ? new Date(item.endDate) : null;
          return {
            id: item.id!, name: arrangements.get(item.arrangementId) ?? 'Articolo senza nome',
            customer: customers.get(item.customerId) ?? '—',
            endDate: date && !Number.isNaN(date.getTime())
              ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(date) : '',
            certifications: certifications.join(' · ') || 'Tele non registrate',
            pieces: fabrics.reduce((total, fabric) => total + (fabric.piecesCount ?? 0), 0),
          };
        }).sort((a, b) => b.endDate.localeCompare(a.endDate)));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.error.set(true); },
    });
  }
  resetFilters(): void {
    this.year.set(''); this.from.set(''); this.to.set(''); this.search.set('');
  }
}
