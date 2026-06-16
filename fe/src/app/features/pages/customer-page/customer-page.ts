import { Component, inject, OnInit, signal } from '@angular/core';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { CustomerTableService } from '../../../table/table-service/customer-table.service';
import { CustomerTableRow } from '../../../table/table-row-interface/customer-table-row';
import { FilterButtonComponent } from "../../reusable-components/filter-button-component/filter-button-component";
import { AddButtonComponent } from "../../reusable-components/add-button-component/add-button-component";
import { Router } from '@angular/router';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TableAction, TableActionClick, TableColumn, TableComponent } from '../../reusable-components/table-component/table-component';

@Component({
  selector: 'app-customer-page',
  imports: [
    TitlePageComponent,
    TableComponent,
    FilterButtonComponent,
    AddButtonComponent,
    DecorativeLinesComponent
  ],
  templateUrl: './customer-page.html',
  styleUrl: './customer-page.scss',
  standalone: true,
})
export class CustomerPage implements OnInit {

  private readonly customerTableService = inject(CustomerTableService);
  private readonly navigationService = inject(Router);
  

  public columns: TableColumn<CustomerTableRow>[] = [
    { header: 'Nome', field: 'name' },
    { header: 'Email', field: 'email' },
    { header: 'Referente', field: 'referent' },
    { header: 'Telefono', field: 'phoneNumber' },
    { header: 'Note', field: 'note' },
  ];
  public readonly rows = signal<CustomerTableRow[]>([]);

  public actions: TableAction<CustomerTableRow>[] = [
    {
      id: 'history',
      label: 'Visualizza cronologia articoli',
      icon: 'history',
      iconColor: 'var(--weavops-color-primary)',
    },
    {
      id: 'edit',
      label: 'Modifica',
      icon: 'edit',
      iconColor: 'var(--weavops-color-accent)',
    },
    {
      id: 'delete',
      label: 'Elimina',
      icon: 'delete',
      iconColor: 'var(--weavops-color-danger-bright)',
    }
  ];

  ngOnInit(): void {
    this.loadCustomerRows();
  }

  public loadCustomerRows(): void {
    this.customerTableService.getRows().subscribe({
      next: (rows) => {
        this.rows.set(rows);
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.rows.set([]);
      },
    });
  }

  goToAddCustomerPage(): void {
    this.navigationService.navigate(['/aggiungi-cliente']);
  }

  public onTableAction(event: TableActionClick<CustomerTableRow>): void {
    switch (event.action.id) {
      case 'history':
        console.log('Visualizza cronologia articoli per cliente', event.row);
        break;
      case 'edit':
        console.log('Modifica cliente', event.row);
        break;
      case 'delete':
        console.log('Elimina cliente', event.row);
        break;
    }
  }
}
