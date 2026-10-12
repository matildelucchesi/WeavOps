import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RatesPage } from './rates-page';
import { RateFacadeService } from '../../../services/rate-facade.service';
import { DialogRate } from '../../reusable-components/dialog/dialog-rate/dialog-rate';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

const services = [{id:'s1', code:'PICKS', name:'Colpi', bandCriterion:'PICKS_PER_DM'}];
async function waitForRates(fixture: ComponentFixture<RatesPage>): Promise<void> {
  await fixture.whenStable();
  await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false), {timeout: 2000});
  await fixture.whenStable();
}
describe('Rates', () => {
  it('keeps the purple loader visible for at least one second', async () => {
    await TestBed.configureTestingModule({imports:[RatesPage],providers:[provideRouter([]),{provide:RateFacadeService,useValue:{getServices:()=>of(services),getAll:()=>of([])}}]}).compileComponents();
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(RatesPage);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-loader-component')).not.toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Caricamento…');
      vi.advanceTimersByTime(999);
      fixture.detectChanges();
      expect(fixture.componentInstance.loading()).toBe(true);
      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(fixture.componentInstance.loading()).toBe(false);
      expect(fixture.nativeElement.querySelector('app-loader-component')).toBeNull();
      fixture.destroy();
    } finally {
      vi.useRealTimers();
    }
  });
  it('shows sample loom duration without an hourly band', async () => {
    const sampleServices = [{id:'sample',code:'SAMPLE_LOOMS',name:'Telai a campione',bandCriterion:'HOURS'}];
    await TestBed.configureTestingModule({imports:[RatesPage],providers:[provideRouter([]),{provide:RateFacadeService,useValue:{getServices:()=>of(sampleServices),getAll:()=>of([{id:'r1',serviceId:'sample',hours:24,amount:140,pricingType:'FIXED'}])}}]}).compileComponents();
    const fixture = TestBed.createComponent(RatesPage);
    await waitForRates(fixture);
    const section = fixture.nativeElement.querySelectorAll('.rate-section')[3];
    expect(section.textContent).toContain('Numero di ore');
    expect(section.textContent).toContain('24');
    expect(section.textContent).toContain('140,00');
    expect(section.textContent).not.toContain('Fascia');
    expect(section.textContent).not.toContain('senza limite');
  });

  it('saves a single positive duration for sample looms', async () => {
    const create = vi.fn().mockReturnValue(of({}));
    const sampleServices = [{id:'sample',code:'SAMPLE_LOOMS',name:'Telai a campione',bandCriterion:'HOURS'}];
    await TestBed.configureTestingModule({imports:[DialogRate],providers:[{provide:RateFacadeService,useValue:{create}},{provide:MAT_DIALOG_DATA,useValue:{services:sampleServices,rate:null}},{provide:MatDialogRef,useValue:{close:vi.fn(),disableClose:false}}]}).compileComponents();
    const fixture = TestBed.createComponent(DialogRate);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('input[name="hours"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input[name="minimum"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[name="maximum"]')).toBeNull();
    const component = fixture.componentInstance;
    const form = {invalid:false,control:{markAllAsTouched:vi.fn()}} as unknown as NgForm;
    component.hours=0;
    component.amount=140;
    component.save(form);
    expect(create).not.toHaveBeenCalled();
    component.hours=24;
    component.save(form);
    expect(create).toHaveBeenCalledWith({serviceId:'sample',hours:24,amount:140,pricingType:'FIXED',description:null});
  });

  it('keeps all four tables visible when the backend is unavailable', async () => {
    await TestBed.configureTestingModule({imports:[RatesPage], providers:[provideRouter([]), {provide:RateFacadeService, useValue:{getServices:()=>throwError(()=>({status:404})), getAll:()=>of([])}}]}).compileComponents();
    const fixture = TestBed.createComponent(RatesPage); await waitForRates(fixture);
    expect(fixture.nativeElement.querySelectorAll('app-table-component')).toHaveLength(4);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-add-button-component')).toHaveLength(4);
    expect(fixture.nativeElement.querySelector('app-filter-button-component')).toBeNull();
    expect(fixture.componentInstance.loading()).toBe(false);
  });
  it('shows service criteria and amounts and filters the list', async () => {
    await TestBed.configureTestingModule({imports:[RatesPage], providers:[provideRouter([]), {provide:RateFacadeService, useValue:{getServices:()=>of(services), getAll:()=>of([{id:'r1', serviceId:'s1', minimum:0, maximum:100, amount:25.5}])}}]}).compileComponents();
    const fixture = TestBed.createComponent(RatesPage); await waitForRates(fixture);
    expect(fixture.nativeElement.querySelectorAll('app-table-component')).toHaveLength(4);
    expect(Array.from(fixture.nativeElement.querySelectorAll('h2')).map((heading: any) => heading.textContent)).toEqual(['Colpi', 'Annodature', 'Licciate', 'Telai a Campione']);
    expect(fixture.nativeElement.textContent).toContain('0 – 100'); expect(fixture.nativeElement.textContent).toContain('25,50');
    fixture.componentInstance.filter({band:'999'}, 'PICKS'); await fixture.whenStable(); expect(fixture.componentInstance.sections()[0].rows).toHaveLength(0);
  });
  it('keeps the form open on overlap and closes it after valid creation', async () => {
    const create = vi.fn().mockReturnValueOnce(throwError(()=>({status:409}))).mockReturnValueOnce(of({})); const close = vi.fn();
    await TestBed.configureTestingModule({imports:[DialogRate], providers:[{provide:RateFacadeService,useValue:{create}}, {provide:MAT_DIALOG_DATA,useValue:{services,rate:null}}, {provide:MatDialogRef,useValue:{close,disableClose:false}}]}).compileComponents();
    const fixture = TestBed.createComponent(DialogRate); await fixture.whenStable(); const component = fixture.componentInstance;
    const form = {invalid:false,control:{markAllAsTouched:vi.fn()}} as unknown as NgForm;
    component.minimum=1.5; component.maximum=10; component.amount=5; component.save(form); expect(create).not.toHaveBeenCalled();
    component.minimum=0; component.save(form); expect(component.error()).toContain('sovrappone'); expect(close).not.toHaveBeenCalled();
    component.save(form); expect(create).toHaveBeenCalledWith({serviceId:'s1',minimum:0,maximum:10,amount:5,pricingType:'FIXED',description:null}); expect(close).toHaveBeenCalledWith(true);
  });
  it('shows the negotiated text and preserves the per-thread decimals', async () => {
    const rates = [
      {id:'r1',serviceId:'s1',minimum:1,maximum:100,amount:null,pricingType:'ON_REQUEST',description:'Tariffa da concordare'},
      {id:'r2',serviceId:'s1',minimum:3001,maximum:null,amount:0.045,pricingType:'PER_THREAD'},
    ];
    await TestBed.configureTestingModule({imports:[RatesPage],providers:[provideRouter([]),{provide:RateFacadeService,useValue:{getServices:()=>of(services),getAll:()=>of(rates)}}]}).compileComponents();
    const fixture = TestBed.createComponent(RatesPage);
    await waitForRates(fixture);
    expect(fixture.nativeElement.textContent).toContain('Tariffa da concordare');
    expect(fixture.nativeElement.textContent).toContain('0,045 €/filo');
  });
  it('saves negotiated descriptions and numeric per-thread prices', async () => {
    const create = vi.fn().mockReturnValue(of({}));
    const threadServices = [{id:'s1',code:'DRAWING_IN',name:'Licciate',bandCriterion:'THREADS'}];
    await TestBed.configureTestingModule({imports:[DialogRate],providers:[{provide:RateFacadeService,useValue:{create}},{provide:MAT_DIALOG_DATA,useValue:{services:threadServices,rate:null}},{provide:MatDialogRef,useValue:{close:vi.fn(),disableClose:false}}]}).compileComponents();
    const fixture = TestBed.createComponent(DialogRate);
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const form = {invalid:false,control:{markAllAsTouched:vi.fn()}} as unknown as NgForm;
    component.minimum=3001;
    component.pricingType='ON_REQUEST';
    component.save(form);
    expect(create).not.toHaveBeenCalled();
    component.description='  Da concordare  ';
    component.save(form);
    expect(create).toHaveBeenCalledWith({serviceId:'s1',minimum:3001,maximum:null,amount:null,pricingType:'ON_REQUEST',description:'Da concordare'});
    component.saving.set(false);
    component.pricingType='PER_THREAD';
    component.description='';
    component.amount=0.045;
    component.save(form);
    expect(create).toHaveBeenCalledWith({serviceId:'s1',minimum:3001,maximum:null,amount:0.045,pricingType:'PER_THREAD',description:null});
  });
});
