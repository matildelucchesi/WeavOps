import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { Destination } from '../../../api';
import { DestinationFacadeService } from '../../../services/destination-facade.service';
import { DestinationsPage } from './destinations-page';
import { DestinationsSection } from '../../reusable-components/destinations-section/destinations-section';
import { By } from '@angular/platform-browser';

describe('DestinationsPage cards', () => {
  it('renders asynchronous destination data in expandable cards and keeps filters working', async () => {
    const response = new Subject<Destination[]>();
    await TestBed.configureTestingModule({imports: [DestinationsPage], providers: [
      {provide: DestinationFacadeService, useValue: {getAll: () => response}},
    ]}).compileComponents();
    const fixture = TestBed.createComponent(DestinationsPage); await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Caricamento');
    response.next([{id: 'd1', name: 'DESTINAZIONE UNO', street: 'VIA ROMA', streetNumber: '12/A', postalCode: '00100', city: 'ROMA', provinceCode: 'RM'}]); response.complete();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    const details = fixture.nativeElement.querySelector('details') as HTMLDetailsElement;
    details.querySelector('summary')!.click(); await fixture.whenStable();
    expect(details.open).toBe(true);
    expect(details.textContent).toContain('12/A');
    expect(details.textContent).toContain('00100');
    const section = fixture.debugElement.query(By.directive(DestinationsSection)).componentInstance as DestinationsSection;
    section.search('MILANO'); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-company-card')).toBeNull();
  });
});
