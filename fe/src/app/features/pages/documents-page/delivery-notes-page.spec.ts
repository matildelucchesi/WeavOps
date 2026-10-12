import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { DeliveryNoteService } from '../../../services/delivery-note.service';
import { provideRouter } from '@angular/router';
import { DeliveryNotesPage } from './delivery-notes-page';

describe('Composizione DDT', () => {
  let page: DeliveryNotesPage;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(),
      { provide: ChangeDetectorRef, useValue: { markForCheck: () => {} } },
    ] });
    page = TestBed.runInInjectionContext(() => new DeliveryNotesPage());
    page.customers = [{id: 'a', name: 'Cliente A', email: '', vatNumber: 'A', destinationIds: ['da']},
      {id: 'b', name: 'Cliente B', email: '', vatNumber: 'B', destinationIds: ['db']}];
    page.destinations = ['da', 'db'].map(id => ({id, name: id, street: 'Via', streetNumber: '1', city: 'Prato', postalCode: '59100', provinceCode: 'PO'}));
    page.items = [{id: 'ia', customerId: 'a', arrangementId: 'arr', totalMeters: 100, warpWeight: 10, weftWeight: 10}];
    page.arrangements = [{ id: 'arr', itemName: 'Articolo', reedCount: 1, reedCM: 1, piecesCount: 1, warpEndCount: 1, hitsPerDm: 1 }];
    page.fabrics = [{id: 'fa', itemId: 'ia', code: '123', certificationValue: 'GRS', status: 'AVAILABLE', piecesCount: 1, totalMeters: 50}];
    page.customerId = 'a'; page.selected.add('fa');
  });
  it('richiede una destinazione associata al cliente', () => {
    page.reason = 'LAVORAZIONE';
    expect(page.canGenerate).toBe(false);
    page.destinationId = 'db'; expect(page.canGenerate).toBe(false);
    page.destinationId = 'da'; expect(page.canGenerate).toBe(true);
  });
  it('apre ogni nuovo DDT con solo numero automatico e data odierna', () => {
    vi.spyOn(TestBed.inject(DeliveryNoteService), 'reserveNumber').mockReturnValue(of({ number: 7, year: 2026 }));
    page.loading = false;
    page.destinationId = 'da';
    page.reason = 'LAVORAZIONE';
    page.transport = 'Mittente';
    page.freight = 'FRANCO';
    page.carrier = 'Vettore';
    page.pickupDate = '2026-01-01';
    page.pickupTime = '12:30';
    page.appearance = 'PEZZE';
    page.notes = 'Note precedenti';
    page.start();
    expect(page.number).toBe(7);
    expect(page.date).toBe(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date()));
    expect([page.customerId, page.destinationId, page.reason, page.transport, page.freight,
      page.carrier, page.pickupDate, page.pickupTime, page.appearance, page.notes]).toEqual(Array(10).fill(''));
    expect(page.selected.size).toBe(0);
    expect(page.editing).toBe(true);
  });
  it('azzera destinazione e tele al cambio cliente', () => {
    page.destinationId = 'da'; page.chooseCustomer('b');
    expect(page.destinationId).toBe(''); expect(page.selected.size).toBe(0);
    expect(page.rows.length).toBe(0);
  });
  it('mantiene la certificazione nella stessa colonna del codice', () => {
    expect(page.selectedRows[0].fabricCode).toBe('123 GRS');
    expect(page.availableDestinations.map(d => d.id)).toEqual(['da']);
  });
  it('divide il foglio dopo tredici tele', () => {
    page.fabrics = Array.from({length: 14}, (_, i) => ({...page.fabrics[0], id: String(i)}));
    page.selected = new Set(page.fabrics.map(f => f.id!));
    expect(page.sheets.map(s => s.length)).toEqual([13, 1]);
  });
  it('esclude le tele associate a DDT salvati anche dopo il caricamento della pagina', () => {
    page.fabrics[0].status = 'DELIVERED';
    page.saved = [{ _id: 'ddt', number: 1, year: 2026, date: '2026-10-12', customerName: 'Cliente A', fabricIds: ['fa'] }];
    expect(page.rows).toEqual([]);
    expect(page.selectedRows).toEqual([]);
    expect(page.assignedRows[0].deliveryNote.number).toBe(1);
  });
  it('mantiene disponibili le tele non associate a un DDT', () => {
    page.saved = [{ _id: 'ddt', number: 1, year: 2026, date: '2026-10-12', customerName: 'Cliente A', fabricIds: ['other'] }];
    expect(page.rows.map(row => row.key)).toEqual(['fa']);
  });
  it('rimuove il DDT eliminato e rende nuovamente selezionabili le sue tele', () => {
    page.fabrics[0].status = 'DELIVERED';
    const document = { _id: 'ddt', number: 1, year: 2026, date: '2026-10-12', customerName: 'Cliente A', fabricIds: ['fa'] };
    page.saved = [document];
    page.onDocumentAction({ action: page.documentActions[2], row: document, rowIndex: 0 });
    expect(page.saved).toEqual([]);
    expect(page.rows.map(row => row.key)).toEqual(['fa']);
    expect(page.assignedRows).toEqual([]);
    expect(page.fabrics[0].status).toBe('AVAILABLE');
  });
});

describe('Aggiornamento del foglio DDT', () => {
  it('mostra le tele alla chiusura della dialog senza un ulteriore clic', async () => {
    const closed = new Subject<string[] | undefined>();
    TestBed.configureTestingModule({
      imports: [DeliveryNotesPage],
      providers: [provideHttpClient(), provideRouter([]), {
        provide: MatDialog,
        useValue: { open: () => ({ afterClosed: () => closed.asObservable() }) },
      }],
    });
    // Isola il foglio dalla rete e dal ridimensionamento, mantenendo la vista reale.
    vi.spyOn(DeliveryNotesPage.prototype, 'ngOnInit').mockImplementation(() => {});
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    });
    try {
      const fixture = TestBed.createComponent(DeliveryNotesPage);
      const page = fixture.componentInstance;
      page.loading = false;
      page.editing = true;
      page.issuer = { username: 'user', password: '', companyName: 'AZIENDA EMITTENTE', vatNumber: 'IT987654321' };
      page.customerId = 'a';
      page.customers = [{ id: 'a', name: 'Cliente A', email: '', vatNumber: 'A' }];
      page.items = [{ id: 'ia', customerId: 'a', totalMeters: 100, warpWeight: 10, weftWeight: 10 }];
      page.fabrics = [{ id: 'fa', itemId: 'ia', code: '123', status: 'AVAILABLE', piecesCount: 1, totalMeters: 50 }];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.company h1').textContent).toBe('AZIENDA EMITTENTE');
      expect(fixture.nativeElement.querySelector('.metadata').textContent).toContain('IT987654321');
      expect(fixture.nativeElement.querySelector('.goods-row')).toBeNull();

      page.addFabrics();
      closed.next(['fa']);
      await fixture.whenStable();

      const row = fixture.nativeElement.querySelector('.goods-row');
      expect(row).not.toBeNull();
      expect(row.textContent).toContain('123');
      expect(row.textContent).toContain('50,00');
      expect(row.querySelectorAll('input').length).toBe(0);
      expect(row.querySelector('.numeric:last-child').textContent.trim()).toBe('10,0');
      const editButton = fixture.nativeElement.querySelector('.edit-fabric');
      editButton.click();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelectorAll('.goods-row input').length).toBe(5);
      page.updateDocumentRow('fa', { pieces: 3, meters: 25, weight: 7.4 });
      expect(page.selectedRows[0]).toMatchObject({ pieces: 3, meters: 25, weight: 7.4 });
      expect(page.fabrics[0]).toMatchObject({ piecesCount: 1, totalMeters: 50 });
      editButton.click();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelectorAll('.goods-row input').length).toBe(0);
      expect(fixture.nativeElement.querySelector('.goods-row').textContent).toContain('7,4');
      fixture.destroy();
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });
});

