import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserFacadeService } from '../../../services/user-facade.service';

import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(async () => {
    localStorage.setItem('access_token', `header.${btoa(JSON.stringify({ userId: 'user-1' }))}.signature`);
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: UserFacadeService, useValue: {
          getById: () => of({ username: 'utente', companyName: 'Azienda', vatNumber: 'IT123456789', fiscalCode: '12345678901' }),
          update: vi.fn((id, user) => of(user)),
        } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });
  afterEach(() => localStorage.removeItem('access_token'));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('mantiene informazioni personali e aggiunge una card azienda separata senza avatar', () => {
    const personal = fixture.nativeElement.querySelector('[aria-labelledby="profile-details-title"]');
    const company = fixture.nativeElement.querySelector('[aria-labelledby="company-title"]');
    expect(personal.querySelector('input[name="username"]')).not.toBeNull();
    expect(company.querySelector('input[name="companyName"]').value).toBe('Azienda');
    expect(company.querySelector('input[name="companyVatNumber"]').value).toBe('IT123456789');
    expect(company.querySelector('input[name="companyFiscalCode"]').value).toBe('12345678901');
    expect(company.querySelector('mat-icon').textContent.trim()).toBe('factory');
    expect(company.querySelector('.avatar-control')).toBeNull();
    expect(personal.nextElementSibling).toBe(company);
  });
  it('salva i dati aziendali insieme al profilo utente', () => {
    component.company = { name: 'Nuova azienda', vatNumber: 'IT987654321', fiscalCode: '98765432100' };
    component.saveCompany();
    expect(TestBed.inject(UserFacadeService).update).toHaveBeenCalledWith('user-1', expect.objectContaining({ username: 'utente', password: '', companyName: 'Nuova azienda', vatNumber: 'IT987654321', fiscalCode: '98765432100' }));
  });
});
