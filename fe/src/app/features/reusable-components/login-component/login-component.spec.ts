import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../api';
import { LoginComponent } from './login-component';

describe('LoginComponent', () => {
  let authApi: { login: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authApi = {
      login: vi.fn(),
    };
    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };
    snackBar = {
      open: vi.fn(),
    };
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authApi },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();
  });

  it('logs in from the form and navigates to the home page', () => {
    authApi.login.mockReturnValue(of({ token: 'test-token' }));

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.username = 'mario';
    fixture.componentInstance.password = 'password';
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(authApi.login).toHaveBeenCalledWith({
      loginRequest: {
        username: 'mario',
        password: 'password',
      },
    }, 'body', false, {
      httpHeaderAccept: 'application/json',
    });
    expect(localStorage.getItem('access_token')).toBe('test-token');
    expect(snackBar.open).toHaveBeenCalledWith('Benvenuto mario', 'Chiudi', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
