import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CertificationsPage } from './certifications-page';
import { CertificationFacadeService } from '../../../services/certification-facade.service';
import { TableComponent } from '../../reusable-components/table-component/table-component';
import { By } from '@angular/platform-browser';

describe('CertificationsPage', () => {
  it('paginates and filters certifications and reloads after adding one', async () => {
    const records = Array.from({length:12}, (_, index) => ({id:String(index), value:`CODE${index}`, description:`Descrizione ${index}`}));
    const getAll = vi.fn(() => of(records));
    const open = vi.fn(() => ({afterClosed: () => of(true)}));
    await TestBed.configureTestingModule({imports:[CertificationsPage], providers:[provideRouter([]), {provide:CertificationFacadeService, useValue:{getAll}}, {provide:MatDialog, useValue:{open}}]}).compileComponents();
    const fixture = TestBed.createComponent(CertificationsPage); await fixture.whenStable();
    const table = fixture.debugElement.query(By.directive(TableComponent)).componentInstance as TableComponent;
    expect(table.rows.length).toBe(12); expect(table.pageSize).toBe(10);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(10);
    fixture.componentInstance.filter({value:'CODE11', description:'11'}); await fixture.whenStable();
    expect(table.rows.length).toBe(1); expect(table.rows[0].value).toBe('CODE11');
    fixture.componentInstance.add(); await fixture.whenStable();
    expect(open).toHaveBeenCalled(); expect(getAll).toHaveBeenCalledTimes(2);
  });
});
