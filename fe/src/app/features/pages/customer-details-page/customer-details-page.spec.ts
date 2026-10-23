import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { of, Subject } from 'rxjs';
import { CustomerDetailsPage } from './customer-details-page';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { DestinationFacadeService } from '../../../services/destination-facade.service';
import { Customer } from '../../../api/model/customer';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

const destinations = [
  { id: 'd1', name: 'Centro Uno', street: 'Via Roma', streetNumber: '1', postalCode: '00100', city: 'Roma', provinceCode: 'RM' },
  { id: 'd2', name: 'Centro Due', street: 'Via Milano', streetNumber: '2', postalCode: '20100', city: 'Milano', provinceCode: 'MI' },
];
describe('CustomerDetailsPage', () => {
  const customers = { create: vi.fn(), update: vi.fn(), getById: vi.fn() };
  beforeEach(async () => {
    vi.clearAllMocks();
    customers.create.mockReturnValue(of({})); customers.update.mockReturnValue(of({}));
    window.history.replaceState({}, '', window.location.pathname);
    await TestBed.configureTestingModule({
      imports: [CustomerDetailsPage],
      providers: [provideRouter([]),
        { provide: CustomerFacadeService, useValue: customers },
        { provide: DestinationFacadeService, useValue: { getAll: () => of(destinations) } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();
  });
  async function create(existing?: Customer) {
    if (existing) { window.history.replaceState({ customer: existing }, '', window.location.pathname); customers.getById.mockReturnValue(of(existing)); }
    const fixture = TestBed.createComponent(CustomerDetailsPage);
    await fixture.whenStable();
    return fixture;
  }
  it('edits the supplied customer in a dialog and closes after saving', async () => {
    const existing: Customer = {id: 'c1', name: 'CLIENTE', email: '', vatNumber: 'IT12345', destinationIds: ['d1']};
    const dialog = {close: vi.fn(), disableClose: false};
    customers.getById.mockReturnValue(of(existing));
    TestBed.overrideProvider(MAT_DIALOG_DATA, {useValue: existing});
    TestBed.overrideProvider(MatDialogRef, {useValue: dialog});
    const fixture = await create();
    expect(fixture.componentInstance.canEdit).toBe(true);
    expect(fixture.componentInstance.selectedDestinationIds).toEqual(['d1']);
    expect(fixture.nativeElement.querySelector('.toggle-modifications')).toBeNull();
    vi.useFakeTimers();
    try {
      fixture.componentInstance.customerName = 'MODIFICATO';
      fixture.componentInstance.createNewCustomer();
      expect(customers.update).toHaveBeenCalledWith('c1', expect.objectContaining({name: 'MODIFICATO', destinationIds: ['d1']}));
      expect(dialog.disableClose).toBe(true);
      vi.advanceTimersByTime(1200);
      expect(dialog.close).toHaveBeenCalledWith(true);
    } finally { fixture.destroy(); vi.useRealTimers(); }
  });
  it('saves the VAT number and shared destination references', async () => {
    const fixture = await create(); const component = fixture.componentInstance;
    component.customerName = 'Cliente'; component.vatNumber = 'IT001234567891234'; component.street = 'Via Roma'; component.streetNumber = '1/a'; component.postalCode = '00100'; component.city = 'Roma'; component.provinceCode = 'rm'; component.selectedDestinationIds = ['d1', 'd2'];
    component.country = ' Italia ';
    component.createNewCustomer();
    expect(customers.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'CLIENTE', vatNumber: 'IT001234567891234', street: 'VIA ROMA', streetNumber: '1/A', postalCode: '00100', city: 'ROMA', provinceCode: 'RM', country: 'ITALIA', destinationIds: ['d1', 'd2'] }));
  });
  it('ripristina la nazione e accetta codici postali e regioni estere', async () => {
    const fixture = await create({id:'c1', name:'Estero', email:'', vatNumber:'GB123', country:'REGNO UNITO', postalCode:'SW1A 1AA', provinceCode:'LONDON'});
    const page = fixture.componentInstance;
    expect(page.country).toBe('REGNO UNITO');
    expect(fixture.nativeElement.querySelector('#customer-country').value).toBe('REGNO UNITO');
    page.toggleModifications(); page.createNewCustomer();
    expect(customers.update).toHaveBeenCalledWith('c1', expect.objectContaining({country:'REGNO UNITO', postalCode:'SW1A 1AA', provinceCode:'LONDON'}));
  });
  it('shows assigned destinations as soon as asynchronous requests complete without a user click', async () => {
    const destinationResponse = new Subject<typeof destinations>();
    const customerResponse = new Subject<Customer>();
    TestBed.overrideProvider(DestinationFacadeService, { useValue: { getAll: () => destinationResponse } });
    const existing: Customer = { id: 'c1', name: 'CLIENTE', email: '', vatNumber: 'IT12345', destinationIds: [] };
    window.history.replaceState({ customer: existing }, '', window.location.pathname);
    customers.getById.mockReturnValue(customerResponse);
    const fixture = TestBed.createComponent(CustomerDetailsPage);
    await fixture.whenStable();
    customerResponse.next({ ...existing, destinationIds: ['d1'] });
    await fixture.whenStable();
    destinationResponse.next(destinations);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.selected-destinations')?.textContent).toContain('Centro Uno');
    expect(fixture.nativeElement.querySelector('mat-select')?.textContent).toContain('1 destinazioni selezionate');
    customerResponse.complete(); destinationResponse.complete();
  });
  it('requires an alphanumeric VAT number', async () => {
    const fixture = await create(); const component = fixture.componentInstance;
    component.customerName = 'Cliente'; component.createNewCustomer();
    component.vatNumber = 'IT-12345'; component.createNewCustomer();
    expect(customers.create).not.toHaveBeenCalled();
  });
  it('converts the name to uppercase while typing and restores saved addresses', async () => {
    const fixture = await create({ id: 'c1', name: 'Cliente', email: '', vatNumber: 'IT00123456789', street: 'Via Roma', streetNumber: '1', postalCode: '00100', city: 'Roma', provinceCode: 'RM' });
    expect(fixture.componentInstance.street).toBe('VIA ROMA');
    expect(fixture.componentInstance.postalCode).toBe('00100');
    fixture.nativeElement.querySelector('.toggle-modifications').click();
    await fixture.whenStable();
    const name = fixture.nativeElement.querySelector('#name') as HTMLInputElement;
    name.value = 'azienda prova'; name.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.customerName).toBe('AZIENDA PROVA');
    expect(name.value).toBe('AZIENDA PROVA');
    for (const [id, value, expected] of [['street', 'via milano', 'VIA MILANO'], ['streetNumber', '2/b', '2/B'], ['city', 'milano', 'MILANO']]) {
      const input = fixture.nativeElement.querySelector('#customer-' + id) as HTMLInputElement;
      input.value = value; input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
      expect(input.value).toBe(expected);
    }
  });
  it('keeps selected checkboxes when searching for another destination', async () => {
    const fixture = await create();
    const select = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatSelectHarness);
    await select.open(); await select.clickOptions({ text: /Centro Uno/ });
    expect(fixture.componentInstance.selectedDestinationIds).toEqual(['d1']);
    const search = document.querySelector<HTMLInputElement>('input[aria-label="Cerca aziende di destinazione"]')!;
    search.value = 'milano'; search.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.destinationMatchesSearch(destinations[0])).toBe(false);
    expect(document.querySelector('mat-option mat-pseudo-checkbox')).toBeTruthy();
    await select.clickOptions({ text: /Centro Due/ });
    expect([...fixture.componentInstance.selectedDestinationIds].sort()).toEqual(['d1', 'd2']);
  });
  it('requires VAT when editing a historical customer and preserves its destinations', async () => {
    const fixture = await create({ id: 'c1', name: 'Cliente', email: '', destinationIds: ['d1'] } as Customer);
    const component = fixture.componentInstance; component.toggleModifications(); component.createNewCustomer();
    expect(customers.update).not.toHaveBeenCalled();
    component.vatNumber = '00123456789'; component.createNewCustomer();
    expect(customers.update).toHaveBeenCalledWith('c1', expect.objectContaining({ vatNumber: '00123456789', destinationIds: ['d1'] }));
  });
  it('opens customer data read only and toggles editing and save visibility', async () => {
    const fixture = await create({ id: 'c1', name: 'CLIENTE', email: '', vatNumber: 'IT12345', destinationIds: ['d1'] });
    const component = fixture.componentInstance;
    const fields = fixture.nativeElement.querySelector('fieldset') as HTMLFieldSetElement;
    const toggle = fixture.nativeElement.querySelector('.toggle-modifications') as HTMLButtonElement;
    expect(fields.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('app-button-general-action-component')).toBeNull();
    component.createNewCustomer();
    expect(customers.update).not.toHaveBeenCalled();
    toggle.click(); await fixture.whenStable();
    expect(fields.disabled).toBe(false);
    expect(toggle.textContent).toContain('Disabilita modifiche');
    expect(fixture.nativeElement.querySelector('app-button-general-action-component')).toBeTruthy();
    toggle.click(); await fixture.whenStable();
    expect(fields.disabled).toBe(true);
    expect(toggle.textContent).toContain('Abilita modifiche');
    expect(fixture.nativeElement.querySelector('app-button-general-action-component')).toBeNull();
  });
});
