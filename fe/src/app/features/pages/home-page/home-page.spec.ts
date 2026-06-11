import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { DialogLoomActionComponent } from '../../reusable-components/dialog-loom-action-component/dialog-loom-action-component';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let dialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    dialog = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [{ provide: MatDialog, useValue: dialog }],
    }).compileComponents();
  });

  it('opens the loom action dialog for the clicked loom card', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('app-loom-card-component') as HTMLElement;
    card.click();

    expect(dialog.open).toHaveBeenCalledWith(
      DialogLoomActionComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          modify: true,
          loom: expect.objectContaining({
            serialNumber: 'Telaio',
          }),
        }),
      }),
    );
  });
});
