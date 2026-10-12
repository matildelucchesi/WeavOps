import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';
import { Item, LoomItemAssignment } from '../../../api';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { CertificationFacadeService } from '../../../services/certification-facade.service';

import { LoomProductionDetailsPage } from './loom-production-details-page';

describe('LoomProductionDetailsPage', () => {
  it('shows article remainder after production on another process', () => {
    const page = TestBed.runInInjectionContext(() => new LoomProductionDetailsPage());
    page.item.set({totalMeters: 1000, metersRun: 350});
    page.process.set({speed: 300, efficiency: 80, totalMeters: 500, metersRun: 100, metersToGo: 400, startDate: '2026-10-12'});
    expect(page.remainingArticleMeters).toBe(650);
    page.item.set({totalMeters: 1000, metersRun: 450});
    expect(page.remainingArticleMeters).toBe(550);
    expect(page.process()?.metersToGo).toBe(400);
  });
  it('does not show negative article remainder after overproduction', () => {
    const page = TestBed.runInInjectionContext(() => new LoomProductionDetailsPage());
    page.item.set({totalMeters: 1000, metersRun: 1050});
    expect(page.remainingArticleMeters).toBe(0);
  });
  let component: LoomProductionDetailsPage;
  let fixture: ComponentFixture<LoomProductionDetailsPage>;
  let itemService: {getById: ReturnType<typeof vi.fn>};
  let certificationService: {getAll: ReturnType<typeof vi.fn>};
  let dialog: {open: ReturnType<typeof vi.fn>};
  let snackBar: {open: ReturnType<typeof vi.fn>};
  let dialogResult: Subject<any>;
  const row = {
    assignment: {id:'assignment',loomId:'loom',itemId:'queued-item',processId:'process',status:LoomItemAssignment.StatusEnum.Queued},
    itemName:'ARTICOLO',totalMeters:'100',completionDays:'2',status:'QUEUED',
  };
  const runningProcess = {speed:300,efficiency:80,totalMeters:100,metersRun:0,metersToGo:100,startDate:'2026-10-12T08:00:00Z'};

  beforeEach(async () => {
    itemService = {getById: vi.fn().mockReturnValue(of({isCertified: Item.IsCertifiedEnum.None}))};
    certificationService = {getAll: vi.fn().mockReturnValue(of([]))};
    dialogResult = new Subject();
    dialog = {open: vi.fn().mockReturnValue({afterClosed: () => dialogResult})};
    snackBar = {open: vi.fn()};
    await TestBed.configureTestingModule({
      imports: [LoomProductionDetailsPage],
      providers: [provideRouter([]),provideHttpClient(),
        {provide:ItemFacadeService,useValue:itemService},
        {provide:CertificationFacadeService,useValue:certificationService},
        {provide:MatDialog,useValue:dialog},
        {provide:MatSnackBar,useValue:snackBar}],
    }).compileComponents();

    fixture = TestBed.createComponent(LoomProductionDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the certification used by the running process for a partial article', () => {
    component.item.set({isCertified:Item.IsCertifiedEnum.Partial});
    component.process.set({...runningProcess,grs:false,gots:true});
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector('#articleCertification');
    expect(field.value).toBe('GOTS');
    expect(field.readOnly).toBe(true);
    component.process.set({...runningProcess,grs:false,gots:false});
    fixture.detectChanges();
    expect(field.value).toBe('Nessuna');
  });

  it('shows the article certification when all pieces are certified', () => {
    itemService.getById.mockReturnValue(of({isCertified:Item.IsCertifiedEnum.All,certificationId:'certification'}));
    certificationService.getAll.mockReturnValue(of([{id:'certification',value:'GRS'}]));
    vi.spyOn(component as any,'resolveProcess').mockReturnValue(of(runningProcess));
    vi.spyOn(component as any,'resolveArrangement').mockReturnValue(of(null));
    (component as any).loadRunningProduction(row.assignment);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#articleCertification').value).toBe('GRS');
    component.item.set({isCertified:Item.IsCertifiedEnum.None});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#articleCertification').value).toBe('Nessuna');
  });

  it('asks for a certification only for partially certified pieces', () => {
    itemService.getById.mockReturnValue(of({isCertified: Item.IsCertifiedEnum.Partial}));
    const start = vi.spyOn(component as any, 'startProduction').mockImplementation(() => {});
    component.checkIfIsPossibleToStartProduction(row);
    expect(itemService.getById).toHaveBeenCalledWith('queued-item');
    expect(dialog.open.mock.calls[0][1].data.productionCertifications).toBe(true);
    expect(certificationService.getAll).not.toHaveBeenCalled();
    const result = {confirmed:true,grs:true,gots:false};
    dialogResult.next(result);
    expect(start).toHaveBeenCalledWith(row.assignment,result);
  });

  it.each([Item.IsCertifiedEnum.None, undefined])('does not ask for certification when state is %s', (isCertified) => {
    itemService.getById.mockReturnValue(of({isCertified}));
    const start = vi.spyOn(component as any, 'startProduction').mockImplementation(() => {});
    component.checkIfIsPossibleToStartProduction(row);
    expect(dialog.open.mock.calls[0][1].data.productionCertifications).toBe(false);
    expect(dialog.open.mock.calls[0][1].data.subtext).not.toContain('Quale certificazione');
    dialogResult.next(true);
    expect(start).toHaveBeenCalledWith(row.assignment,{confirmed:true,grs:false,gots:false});
  });

  it.each(['GRS','GOTS'])('uses the article certification %s automatically when all pieces are certified', (code) => {
    itemService.getById.mockReturnValue(of({isCertified:Item.IsCertifiedEnum.All,certificationId:'certification'}));
    certificationService.getAll.mockReturnValue(of([{id:'certification',value:code}]));
    const start = vi.spyOn(component as any, 'startProduction').mockImplementation(() => {});
    component.checkIfIsPossibleToStartProduction(row);
    expect(dialog.open.mock.calls[0][1].data.productionCertifications).toBe(false);
    dialogResult.next(true);
    expect(start).toHaveBeenCalledWith(row.assignment,{confirmed:true,grs:code==='GRS',gots:code==='GOTS'});
  });

  it('does not start after cancellation', () => {
    const start = vi.spyOn(component as any, 'startProduction').mockImplementation(() => {});
    component.checkIfIsPossibleToStartProduction(row);
    dialogResult.next(false);
    expect(start).not.toHaveBeenCalled();
  });

  it('does not open the start dialog when the article cannot be loaded', () => {
    vi.spyOn(console,'error').mockImplementation(() => {});
    itemService.getById.mockReturnValue(throwError(() => new Error('Unavailable')));
    component.checkIfIsPossibleToStartProduction(row);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalled();
  });
});
