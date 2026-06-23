import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-add-button-component',
  imports: [MatIcon],
  standalone: true,
  templateUrl: './add-button-component.html',
  styleUrl: './add-button-component.scss',
})
export class AddButtonComponent {
  @Input() label: string = 'Aggiungi Nuovo';
  @Input() icon: string = 'add';
  @Input() ariaLabel: string = 'Aggiungi Nuovo';

  @Output() buttonClick = new EventEmitter<void>();

  public emitClick(): void {
    this.buttonClick.emit();
  }
}
