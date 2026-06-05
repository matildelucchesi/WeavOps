import { Component } from '@angular/core';
import { LoginComponent } from '../../reusable-components/login-component/login-component';

@Component({
  selector: 'app-home-page',
  imports: [LoginComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  standalone: true,
})
export class HomePage {}
