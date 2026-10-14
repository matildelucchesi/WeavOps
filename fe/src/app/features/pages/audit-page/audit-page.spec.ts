import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { AuditPage } from './audit-page';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';
import { CustomerFacadeService } from '../../../services/customer-facade.service';
import { FabricFacadeService } from '../../../services/fabric-facade.service';

describe('Audit articoli', () => {
  let page: AuditPage;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AuditPage], providers: [
      provideRouter([]),
      { provide: ItemFacadeService, useValue: { getAll: () => of([
        { id: 'a', state: 'COMPLETED', arrangementId: 'arr', customerId: 'c', endDate: '2025-12-31T23:30:00Z' },
        { id: 'b', state: 'COMPLETED', endDate: '2025-10-01T10:00:00Z' },
        { id: 'running', state: 'RUNNING' }, { id: 'abandoned', state: 'ABANDONED' },
      ]) } },
      { provide: ArrangementFacadeService, useValue: { getAll: () => of([{ id: 'arr', itemName: 'Articolo A' }]) } },
      { provide: CustomerFacadeService, useValue: { getAll: () => of([{ id: 'c', name: 'Cliente A' }]) } },
      { provide: FabricFacadeService, useValue: { getAll: () => of([
        { itemId: 'a', certificationValue: 'GRS', piecesCount: 2 }, { itemId: 'a', piecesCount: 1 },
      ]) } },
    ] });
    page = TestBed.runInInjectionContext(() => new AuditPage());
    page.ngOnInit();
  });
  it('mostra solo gli articoli terminati con le certificazioni effettive delle Tele', () => {
    expect(page.rows().map(row => row.id)).toEqual(['a', 'b']);
    expect(page.rows()[0]).toMatchObject({ name: 'Articolo A', customer: 'Cliente A', certifications: 'GRS · Non certificate', pieces: 3 });
  });
  it('filtra anno e periodo inclusivo secondo la data italiana di fine produzione', () => {
    page.year.set('2026');
    page.from.set('2026-01-01'); page.to.set('2026-01-01');
    expect(page.rows().map(row => row.id)).toEqual(['a']);
    expect(page.rows()[0].endDate).toBe('2026-01-01');
    page.to.set('2025-12-31');
    expect(page.invalidPeriod()).toBe(true);
    expect(page.rows()).toEqual([]);
    page.resetFilters();
    expect(page.rows().length).toBe(2);
  });
  it('cerca anche cliente e certificazioni', () => {
    page.search.set('grs'); expect(page.rows().length).toBe(1);
    page.search.set('cliente a'); expect(page.rows().length).toBe(1);
  });
  it('mostra filtri e tabella nella pagina reale anche senza articoli', async () => {
    const fixture = TestBed.createComponent(AuditPage);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('thead th').length).toBe(5);
    expect(fixture.nativeElement.querySelector('.audit-filters')).not.toBeNull();
    fixture.componentInstance.allRows.set([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
    fixture.destroy();
  });
});
