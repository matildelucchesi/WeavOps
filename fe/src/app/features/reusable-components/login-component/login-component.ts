import { Component, inject } from '@angular/core';
import { InputComponent } from "../input-component/input-component";
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthControllerService } from '../../../api';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login-component',
  imports: [
    InputComponent,
    MatButtonModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
  standalone: true,
})
export class LoginComponent {

  private authApi = inject(AuthControllerService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading: boolean = false;
  errorMessage: string = '';
  username: string = '';
  password: string = '';

  login(): void {
    if (this.isLoading) {
      return;
    }

    const username = this.username.trim();
    const password = this.password;

    if (!username || !password) {
      this.showError();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authApi.login({
      loginRequest: {
        username,
        password,
      },
    }, 'body', false, {
      httpHeaderAccept: 'application/json' as '*/*',
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      }),
    ).subscribe({
      next: response => {
        if (!response.token) {
          this.showError();
          return;
        }

        localStorage.setItem('access_token', response.token);
        const welcomeUsername = response.user?.username ?? username;
        this.snackBar.open(`Benvenuto ${welcomeUsername}`, 'Chiudi', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
        this.router.navigate(['/home']);
      },
      error: () => {
        this.showError();
      },
    });
  }

  private showError(): void {
    this.isLoading = false;
    this.errorMessage = 'Credenziali non valide';
    this.snackBar.open(this.errorMessage, 'Chiudi', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }
}
