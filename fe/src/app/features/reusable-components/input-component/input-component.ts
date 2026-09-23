import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input-component',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    FormsModule,
],
  templateUrl: './input-component.html',
  styleUrl: './input-component.scss',
  standalone: true,
})
export class InputComponent {
  @Input() inputId: string = '';
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() showVisibilityToggle: boolean = false;
  passwordVisible: boolean = false;
  @Input() value: string = '';
  @Input() width: string = '450px';
  @Input() height: string = '80px';
  @Input() required: boolean = true;
  @Input() minLength: number | null = 5;
  
  @Output() valueChange = new EventEmitter<string>();

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
