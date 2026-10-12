import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { Customer, Destination } from '../../../../api';
import { DialogCustomerDestinations } from './dialog-customer-destinations';
import { CustomerFacadeService } from '../../../../services/customer-facade.service';
import { DestinationFacadeService } from '../../../../services/destination-facade.service';

describe('DialogCustomerDestinations', () => {
  for (const fails of [false, true]) {
    it(fails ? 'replaces loading with an asynchronous error' : 'shows asynchronous results without requiring a user click', async () => {
      const customer: Customer = {id: 'c1', name: 'CLIENTE', email: '', vatNumber: 'IT12345', destinationIds: ['d1']};
      const customers = new Subject<Customer>();
      const destinations = new Subject<Destination[]>();
      await TestBed.configureTestingModule({imports: [DialogCustomerDestinations], providers: [
        {provide: MAT_DIALOG_DATA, useValue: customer},
        {provide: MatDialogRef, useValue: {close: vi.fn()}},
        {provide: MatDialog, useValue: {open: vi.fn()}},
        {provide: CustomerFacadeService, useValue: {getById: () => customers}},
        {provide: DestinationFacadeService, useValue: {getAll: () => destinations}},
      ]}).compileComponents();
      const fixture = TestBed.createComponent(DialogCustomerDestinations); await fixture.whenStable();
      expect(fixture.nativeElement.textContent).toContain('Caricamento');
      if (fails) destinations.error(new Error('API unavailable'));
      else {
        customers.next(customer); customers.complete();
        destinations.next([{id: 'd1', name: 'AZIENDA UNO', street: 'VIA ROMA', streetNumber: '1', postalCode: '00100', city: 'ROMA', provinceCode: 'RM'}]); destinations.complete();
      }
      await fixture.whenStable();
      expect(fixture.nativeElement.textContent).not.toContain('Caricamento');
      if (fails) expect(fixture.nativeElement.querySelector('[role=alert]')?.textContent).toContain('Impossibile caricare');
      else {
        expect(fixture.nativeElement.textContent).toContain('AZIENDA UNO');
        expect(fixture.nativeElement.querySelector('input[type=checkbox]').checked).toBe(true);
      }
    });
  }
  it('updates associations while preserving other customer data', async () => {
    const customer = {id: 'c1', name: 'CLIENTE', email: 'cliente@example.it', vatNumber: 'IT123456789012', street: 'VIA ROMA', destinationIds: ['d1']};
    const update = vi.fn().mockReturnValue(of(customer));
    const close = vi.fn();
    await TestBed.configureTestingModule({imports: [DialogCustomerDestinations], providers: [
      {provide: MAT_DIALOG_DATA, useValue: customer},
      {provide: MatDialogRef, useValue: {close}},
      {provide: MatDialog, useValue: {open: vi.fn()}},
      {provide: CustomerFacadeService, useValue: {getById: () => of(customer), update}},
      {provide: DestinationFacadeService, useValue: {getAll: () => of([
        {id: 'd1', name: 'UNO', street: 'VIA ROMA', streetNumber: '1', postalCode: '00100', city: 'ROMA', provinceCode: 'RM'},
        {id: 'd2', name: 'DUE', street: 'VIA MILANO', streetNumber: '2', postalCode: '20100', city: 'MILANO', provinceCode: 'MI'},
      ])}},
    ]}).compileComponents();
    const fixture = TestBed.createComponent(DialogCustomerDestinations); await fixture.whenStable();
    const component = fixture.componentInstance;
    expect(component.selected).toEqual(['d1']);
    component.toggle('d1', false); component.search = 'milano'; component.toggle('d2', true); component.save();
    expect(update).toHaveBeenCalledWith('c1', {...customer, destinationIds: ['d2']});
    expect(customer.destinationIds).toEqual(['d1']);
    expect(close).toHaveBeenCalledWith(true);
  });
});
