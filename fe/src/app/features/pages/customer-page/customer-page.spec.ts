import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CustomerPage } from './customer-page';
import { CustomerTableService } from '../../../table/table-service/customer-table.service';

const customer = {id: 'c1', name: 'AZIENDA UNO', email: 'cliente@example.it', vatNumber: 'IT123456789012', street: 'VIA ROMA', streetNumber: '1', postalCode: '00100', city: 'ROMA', provinceCode: 'RM', destinationIds: ['d1'], note: 'Nota cliente'};
const row = {id: 'c1', customer, name: customer.name, email: customer.email, vatNumber: customer.vatNumber, destinationNames: 'DESTINAZIONE UNO', referent: '', phoneNumber: '', note: customer.note};
describe('CustomerPage cards', () => {
  it('paginates ten cards at a time and resets the page when filters change', async () => {
    const rows = Array.from({length: 23}, (_, index) => ({...row, id: `c${index + 1}`, name: `AZIENDA ${index + 1}`, customer: {...customer, id: `c${index + 1}`}}));
    await TestBed.configureTestingModule({imports: [CustomerPage], providers: [provideRouter([]),
      {provide: CustomerTableService, useValue: {getRows: () => of(rows)}},
    ]}).compileComponents();
    const fixture = TestBed.createComponent(CustomerPage); await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('app-company-card').length).toBe(10);
    const next = fixture.nativeElement.querySelector('[aria-label="Pagina successiva"]') as HTMLButtonElement;
    next.click(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('AZIENDA 11');
    next.click(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('app-company-card').length).toBe(3);
    expect(next.disabled).toBe(true);
    const pageSize = fixture.nativeElement.querySelector('app-card-pagination select') as HTMLSelectElement;
    pageSize.value = '25'; pageSize.dispatchEvent(new Event('change')); await fixture.whenStable();
    expect(fixture.componentInstance.currentPage()).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('app-company-card').length).toBe(23);
    expect(next.disabled).toBe(true);
    fixture.componentInstance.search('AZIENDA 23'); await fixture.whenStable();
    expect(fixture.componentInstance.currentPage()).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('app-company-card').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.list-toolbar app-add-button-component')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.list-footer app-add-button-component')).toBeNull();
  });
  it('opens customer data in a full card and filters the list without a table or embedded destinations section', async () => {
    await TestBed.configureTestingModule({ imports: [CustomerPage], providers: [provideRouter([]),
      {provide: CustomerTableService, useValue: {getRows: () => of([row])}},
    ] }).compileComponents();
    const fixture = TestBed.createComponent(CustomerPage); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-destinations-section')).toBeNull();
    const details = fixture.nativeElement.querySelector('details') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    details.querySelector('summary')!.click(); await fixture.whenStable();
    expect(details.open).toBe(true);
    expect(details.textContent).toContain('VIA ROMA');
    expect(details.textContent).toContain('DESTINAZIONE UNO');
    expect(details.textContent).toContain('Nota cliente');
    fixture.componentInstance.onFilterSelected({name: 'non esiste'}); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-company-card')).toBeNull();
    fixture.componentInstance.onFilterSelected({}); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-company-card')).toBeTruthy();
  });
});
