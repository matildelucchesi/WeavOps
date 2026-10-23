import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { FabricFacadeService } from '../../../services/fabric-facade.service';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { DeliveryNoteService } from '../../../services/delivery-note.service';
import { of, Subject, throwError } from 'rxjs';
import { InvoicesPage } from './invoices-page';
import { InvoiceService } from '../../../services/invoice.service';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { UserFacadeService } from '../../../services/user-facade.service';
import { newInvoice } from '../../../services/invoice-model';

describe('Navigazione e compilazione fatture', () => {
  const snack = {open: vi.fn()};
  beforeEach(() => {
    snack.open.mockClear();
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideRouter([
      {path: 'documenti/fatture/nuova', component: InvoicesPage, data: {editor: true}},
      {path: 'documenti/fatture/:id/modifica', component: InvoicesPage, data: {editor: true}},
      {path: 'documenti/fatture', component: InvoicesPage},
    ]),
      {provide: MatSnackBar, useValue: snack},
      {provide: CustomerFacadeService, useValue: {getAll: () => of([{id: 'c', name: 'Cliente', email: 'cliente@example.test', vatNumber: 'IT123', street: 'Via Roma', streetNumber: '2', postalCode: '59100', city: 'Prato', provinceCode: 'PO', country: 'ITALIA'}])}},
      {provide: UserFacadeService, useValue: {getCurrent: () => of({companyName: 'Azienda', vatNumber: 'IT456', fiscalCode: '12345678901', email: 'azienda@example.test'})}},
      {provide: InvoiceService, useValue: {list: vi.fn(() => of([])), nextNumber: vi.fn(() => of({number: 8})), get: vi.fn(), save: vi.fn()}},
    ]});
  });
  it('Aggiungi naviga a una pagina dedicata anche se il numero automatico fallisce', async () => {
    vi.mocked(TestBed.inject(InvoiceService).nextNumber).mockReturnValue(throwError(() => ({status: 404})));
    const harness = await RouterTestingHarness.create('/documenti/fatture');
    const add: HTMLButtonElement = harness.routeNativeElement!.querySelector('button[aria-label="Aggiungi nuova fattura"]')!;
    add.click(); await harness.fixture.whenStable(); harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/documenti/fatture/nuova');
    expect(harness.routeNativeElement!.querySelector('article[aria-label="Template fattura"]')).toBeTruthy();
    expect(snack.open).toHaveBeenCalledWith(expect.stringContaining('Numero automatico'), 'Chiudi', expect.anything());
    expect(harness.routeNativeElement!.textContent).not.toContain('Numero automatico non disponibile');
  });
  it('recupera le anagrafiche e le lascia modificabili', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/documenti/fatture/nuova', InvoicesPage);
    expect(page.draft.rows).toEqual([]);
    expect(harness.routeNativeElement!.querySelectorAll('.item-row:not(.blank-row)')).toHaveLength(0);
    expect(page.draft.number).toBe(8); expect(page.draft.issuer.name).toBe('Azienda');
    expect(page.draft.fiscalCode).toBe('12345678901');
    page.draft.customerId = 'c'; page.chooseCustomer();
    expect(page.draft.customer.address).toBe('Via Roma 2\n59100 Prato');
    expect(page.customerProvince).toBe('PO');
    expect(page.customerCountry).toBe('ITALIA');
    page.addRow(); page.draft.customer.name = 'Cliente personalizzato'; page.draft.rows[0].description = 'Lavorazione';
    expect(page.validation()).toBe('');
  });
  it('mostra il paese solo dai dati del cliente scelto senza presumere ITALIA', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/documenti/fatture/nuova', InvoicesPage);
    expect(page.customerCountry).toBe('');
    page.chooseCustomer('c'); expect(page.customerCountry).toBe('ITALIA');
    page.customers.push({id:'foreign', name:'Estero', email:'', vatNumber:'FR123', country:'FRANCIA'});
    page.chooseCustomer('foreign'); expect(page.customerCountry).toBe('FRANCIA');
    page.customers.push({id:'unknown', name:'Senza nazione', email:'', vatNumber:'123'});
    page.chooseCustomer('unknown'); expect(page.customerCountry).toBe('');
  });
  it('apre il modulo anche quando le anagrafiche non sono disponibili', async () => {
    vi.spyOn(TestBed.inject(CustomerFacadeService), 'getAll').mockReturnValue(throwError(() => new Error()));
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/documenti/fatture/nuova', InvoicesPage);
    expect(page.editing).toBe(true); expect(page.loading).toBe(false); expect(page.busy).toBe(false);
    expect(page.draft.issuer.name).toBe('Azienda');
  });
  it('una risposta tardiva non sovrascrive il numero inserito manualmente', async () => {
    const pending = new Subject<{number: number}>();
    vi.mocked(TestBed.inject(InvoiceService).nextNumber).mockReturnValue(pending);
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/documenti/fatture/nuova', InvoicesPage);
    page.draft.number = 1; page.numberEdited = true; pending.next({number: 90});
    expect(page.draft.number).toBe(1);
  });
  it('conserva i campi e notifica un errore di salvataggio', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/documenti/fatture/nuova', InvoicesPage);
    page.addRow(); page.draft.customer.name = 'Cliente'; page.draft.rows[0].description = 'Riga';
    vi.mocked(TestBed.inject(InvoiceService).save).mockReturnValue(throwError(() => ({status: 409})));
    await page.save();
    expect(page.editing).toBe(true); expect(page.busy).toBe(false);
    expect(page.draft.rows[0].description).toBe('Riga');
    expect(snack.open).toHaveBeenCalledWith(expect.stringContaining('già utilizzato'), 'Chiudi', expect.anything());
  });
  it('carica la fattura da modificare anche aprendo direttamente il suo URL', async () => {
    const data = newInvoice(); data.customer.name = 'Cliente';
    vi.mocked(TestBed.inject(InvoiceService).get).mockReturnValue(of({_id:'invoice', number:1, year:2026, date:data.date, customerName:'Cliente', data}));
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/documenti/fatture/invoice/modifica', InvoicesPage);
    page.draft.customer.name = 'Modificato';
    expect(data.customer.name).toBe('Cliente'); expect(page.editingId).toBe('invoice');
    page.back(); await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/documenti/fatture');
  });
  function mockFabrics() {
    const open = vi.fn(() => ({afterClosed: () => of(['free','used','other'])}));
    TestBed.overrideProvider(MatDialog, {useValue:{open}});
    TestBed.overrideProvider(ItemFacadeService, {useValue:{getAll: () => of([{id:'item',customerId:'c',arrangementId:'arr'}, {id:'other-item',customerId:'other-customer',arrangementId:'arr'}])}});
    TestBed.overrideProvider(ArrangementFacadeService, {useValue:{getAll: () => of([{id:'arr',itemName:'Articolo'}])}});
    TestBed.overrideProvider(FabricFacadeService, {useValue:{getAll: () => of([
      {id:'free',itemId:'item',code:'T1',status:'AVAILABLE',piecesCount:1,totalMeters:10},
      {id:'used',itemId:'item',code:'T2',status:'DELIVERED',piecesCount:1,totalMeters:20,certificationValue:'GRS'},
      {id:'other',itemId:'other-item',code:'T3',status:'AVAILABLE',piecesCount:1,totalMeters:30},
    ])}});
    TestBed.overrideProvider(DeliveryNoteService, {useValue:{list: () => of([{_id:'ddt',number:12,year:2026,date:'2026-10-12',customerName:'Cliente',fabricIds:['used']}])}});
    return open;
  }
  it('offre tele con e senza DDT del cliente scelto e richiede la quantità manuale', async () => {
    const open = mockFabrics();
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/documenti/fatture/nuova', InvoicesPage);
    page.chooseCustomer('c'); page.addFabrics();
    const config = (open.mock.calls[0] as unknown as [unknown, {data:any}])[1].data;
    expect(config.rows.map((row:any) => row.key)).toEqual(['free']);
    expect(config.assignedRows.map((row:any) => row.key)).toEqual(['used']);
    expect(config.allowAssignedSelection).toBe(true);
    expect(page.draft.rows.map(row => row.fabricId)).toEqual(['free','used']);
    expect(page.draft.rows[1].reference).toBe('T2');
    expect(page.draft.rows[1].description).toContain('GRS');
    expect(page.validation()).toContain('manualmente la quantità');
    page.draft.rows.forEach(row => row.quantity = 5);
    expect(page.validation()).toBe('');
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('calcolo automatico è ancora da configurare');
    expect(harness.routeNativeElement!.querySelectorAll('.table-add-button')).toHaveLength(2);
  });
  it('riaprire la selezione non duplica le tele e conserva i dati modificati', async () => {
    mockFabrics();
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/documenti/fatture/nuova', InvoicesPage);
    page.chooseCustomer('c'); page.addFabrics();
    page.draft.rows[0].price = 4; page.draft.rows[0].quantity = 10;
    page.draft.rows[0].description = 'Personalizzata'; page.addFabrics();
    expect(page.draft.rows).toHaveLength(2);
    expect(page.draft.rows[0]).toMatchObject({price:4,quantity:10,description:'Personalizzata'});
  });
  it('non apre il dialog senza cliente e conserva le righe se il caricamento fallisce', async () => {
    const open = mockFabrics();
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/documenti/fatture/nuova', InvoicesPage);
    page.addFabrics(); expect(open).not.toHaveBeenCalled();
    expect(page.error).toContain('Seleziona un cliente');
    page.chooseCustomer('c'); page.addRow(); page.draft.rows[0].description = 'Riga manuale';
    vi.spyOn(TestBed.inject(FabricFacadeService),'getAll').mockReturnValue(throwError(() => new Error()));
    page.addFabrics();
    expect(open).not.toHaveBeenCalled(); expect(page.fabricsLoading).toBe(false);
    expect(page.draft.rows[0].description).toBe('Riga manuale');
  });
});
