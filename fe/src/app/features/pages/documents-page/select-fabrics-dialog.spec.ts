import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectFabricsDialog } from './select-fabrics-dialog';

registerLocaleData(localeIt, 'it');

describe('Selezione Tele per DDT', () => {
  it('separa i gruppi, indica il DDT e impedisce di selezionare Tele già associate', async () => {
    const row = { key: 'free', code: 'T1', fabricCode: 'T1', description: 'Articolo', pieces: 1, meters: 10, weight: 2 };
    const close = vi.fn();
    TestBed.configureTestingModule({
      imports: [SelectFabricsDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {
          customerName: 'Cliente', rows: [row], selected: ['used'],
          assignedRows: [{ ...row, key: 'used', code: 'T2', fabricCode: 'T2',
            deliveryNote: { _id: 'ddt', number: 12, year: 2026, date: '2026-10-12' } }],
        } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });
    const fixture = TestBed.createComponent(SelectFabricsDialog);
    fixture.detectChanges();
    const dialog = fixture.componentInstance;
    expect(dialog.selected.size).toBe(0);
    expect(fixture.nativeElement.querySelector('.assigned-card').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.document-state').textContent).toContain('12/2026');
    expect(fixture.nativeElement.querySelector('.document-state').textContent).toContain('12/10/2026');
    dialog.toggle('used', true);
    dialog.toggle('free', true);
    dialog.confirm();
    expect(close).toHaveBeenCalledWith(['free']);
    dialog.search = 'T2';
    expect(dialog.filtered.length).toBe(0);
    expect(dialog.filteredAssigned.length).toBe(1);
    fixture.destroy();
  });
  it('consente di selezionare anche le tele con DDT quando usato dalla fattura', async () => {
    const row = {key:'free', fabricCode:'T1', description:'Articolo', pieces:1, meters:10, weight:2};
    const close = vi.fn();
    TestBed.configureTestingModule({imports:[SelectFabricsDialog], providers:[
      {provide:MAT_DIALOG_DATA, useValue:{customerName:'Cliente', rows:[row], selected:['used'], allowAssignedSelection:true,
        assignedRows:[{...row,key:'used',fabricCode:'T2',deliveryNote:{number:12,year:2026,date:'2026-10-12'}}]}},
      {provide:MatDialogRef,useValue:{close}},
    ]});
    const fixture = TestBed.createComponent(SelectFabricsDialog); fixture.detectChanges();
    const dialog = fixture.componentInstance;
    expect(fixture.nativeElement.querySelector('.assigned-card').disabled).toBe(false);
    expect(dialog.selected.has('used')).toBe(true);
    dialog.toggle('free',true); dialog.confirm();
    expect(close).toHaveBeenCalledWith(['used','free']);
    fixture.destroy();
  });
});
