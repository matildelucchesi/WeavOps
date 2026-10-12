import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { FabricCompletionFields } from './fabric-completion-fields';
import { CertificationFacadeService } from '../../../services/certification-facade.service';

describe('FabricCompletionFields', () => {
  it('updates the certification text when the asynchronous request completes', async () => {
    const response = new Subject<any[]>();
    TestBed.configureTestingModule({providers: [{provide: CertificationFacadeService, useValue: {getAll: () => response}}]});
    const fixture = TestBed.createComponent(FabricCompletionFields);
    fixture.componentRef.setInput('item', {isCertified: 'ALL', certificationId: 'grs'});
    fixture.componentRef.setInput('process', {piecesRun: 1});
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Come da articolo');
    response.next([{id: 'grs', value: 'GRS'}]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Certificazione: GRS');
  });
  function create(state: 'ALL' | 'NONE' | 'PARTIAL' = 'NONE') {
    TestBed.configureTestingModule({providers: [{provide: CertificationFacadeService, useValue: {getAll: () => of([{id: 'grs', value: 'GRS', description: 'Global Recycled Standard'}])}}]});
    const fixture = TestBed.createComponent(FabricCompletionFields);
    const component = fixture.componentInstance;
    component.item = {warpWeight: 100, weftWeight: 20, isCertified: state, certificationId: 'grs'};
    component.process = {speed: 1, efficiency: 1, totalMeters: 100, metersRun: 30, metersToGo: 70, startDate: '', piecesRun: 3, metersPerPiece: 999};
    component.arrangement = {piecesCount: 10, pieceLength: 12.5} as typeof component.arrangement;
    fixture.detectChanges();
    return {fixture, component};
  }
  it('calculates the preview from produced pieces and article values, without editable quantities', () => {
    const {fixture, component} = create();
    expect(component.weightPerPiece).toBe(12);
    expect(component.totalWeight).toBe(36);
    expect(component.totalMeters).toBe(37.5);
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(1);
    expect(component.validate()).toBe(false);
    component.code = 'TELA-1';
    expect(component.validate()).toBe(true);
  });
  it('shows the certification selector only for partially certified items', () => {
    const {fixture, component} = create('PARTIAL');
    expect(fixture.nativeElement.querySelector('select')).toBeTruthy();
    fixture.componentRef.setInput('item', {...component.item!, isCertified: 'ALL'});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select')).toBeNull();
    expect(component.certificationLabel).toBe('GRS');
    fixture.componentRef.setInput('item', {...component.item!, isCertified: 'NONE'});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select')).toBeNull();
    expect(component.certificationLabel).toBe('Nessuna');
  });
  it('allows closing without a fabric when no pieces have been produced', () => {
    const {fixture, component} = create();
    fixture.componentRef.setInput('process', {...component.process!, piecesRun: 0});
    fixture.detectChanges();
    expect(component.validate()).toBe(true);
    expect(fixture.nativeElement.querySelector('#fabricCode')).toBeNull();
  });
  it('refuses a fabric when the article has no weights', () => {
    const {component} = create();
    component.code = 'F';
    component.item = {...component.item!, warpWeight: undefined};
    expect(component.validate()).toBe(false);
  });
});
