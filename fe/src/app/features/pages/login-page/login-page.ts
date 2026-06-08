import { Component } from '@angular/core';
import { LoginComponent } from '../../reusable-components/login-component/login-component';

@Component({
  selector: 'app-login-page',
  imports: [LoginComponent],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  standalone: true,
})
export class LoginPage {}
