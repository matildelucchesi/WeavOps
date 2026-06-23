import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-input-component',
  imports: [
    MatInputModule,
    MatFormFieldModule,
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
  @Input() value: string = '';
  @Input() width: string = '450px';
  @Input() height: string = '80px';
  @Input() required: boolean = true;
  @Input() minLength: number | null = 5;
  
  @Output() valueChange = new EventEmitter<string>();
}
