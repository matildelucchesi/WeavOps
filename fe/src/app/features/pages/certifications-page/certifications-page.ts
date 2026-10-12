import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Certification } from '../../../api/model/certification';
import { CertificationFacadeService } from '../../../services/certification-facade.service';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { TableComponent, TableColumn, TableFilterButtonConfig } from '../../reusable-components/table-component/table-component';
import { FilterValues } from '../../reusable-components/button/filter-button-component/filter-button-component';
import { DialogCertification } from '../../reusable-components/dialog/dialog-certification/dialog-certification';

@Component({
  selector: 'app-certifications-page', standalone: true, imports: [TitlePageComponent, TableComponent],
  template: `<app-title-page-component title="Certificazioni" iconName="verified" [imageWidth]="40" [imageHeight]="40"></app-title-page-component>
    <div class="body">@if (loading()) { <p role="status">Caricamento…</p> } @if (loadError()) { <p role="alert">Impossibile caricare le certificazioni. <button type="button" (click)="load()">Riprova</button></p> }
    <app-table-component [columns]="columns" [rows]="rows()" [filterButton]="filterButton" [addButton]="addButton" [enableMultiSelection]="false" [sortByCreationDate]="false" [pageSize]="10" (filterSelected)="filter($event)" (addButtonClick)="add()"></app-table-component></div>`,
  styles: `.body { width:100%; margin-top:20px; color:var(--weavops-color-primary); }`,
})
export class CertificationsPage implements OnInit {
  private readonly service = inject(CertificationFacadeService);
  private readonly dialog = inject(MatDialog);
  readonly rows = signal<Certification[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly columns: TableColumn<Certification>[] = [{header:'Codice', field:'value'}, {header:'Descrizione', field:'description'}];
  readonly addButton = {label:'Aggiungi Nuovo', icon:'add', ariaLabel:'Aggiungi certificazione'};
  readonly filterButton: TableFilterButtonConfig = {label:'Filtri', icon:'search', filters:[{id:'value', label:'Codice'}, {id:'description', label:'Descrizione'}]};
  private allRows: Certification[] = [];
  private activeFilters: FilterValues = {};
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true); this.loadError.set(false);
    this.service.getAll().subscribe({next: rows => { this.allRows = rows; this.filter(this.activeFilters); this.loading.set(false); }, error: () => { this.loading.set(false); this.loadError.set(true); }});
  }
  filter(filters: FilterValues): void {
    this.activeFilters = filters;
    this.rows.set(this.allRows.filter(row => Object.entries(filters).every(([key, value]) => String(row[key as keyof Certification] ?? '').toLocaleLowerCase('it').includes(value.trim().toLocaleLowerCase('it')))));
  }
  add(): void {
    this.dialog.open(DialogCertification, {width:'600px', maxWidth:'calc(100vw - 32px)'}).afterClosed().subscribe(saved => { if (saved) this.load(); });
  }
}
