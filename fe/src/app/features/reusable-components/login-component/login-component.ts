import { Component } from '@angular/core';
import { InputComponent } from "../input-component/input-component";

@Component({
  selector: 'app-login-component',
  imports: [InputComponent],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
  standalone: true,
})
export class LoginComponent {}
