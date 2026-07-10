import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-button-general-action-component',
  imports: [MatButtonModule],
  standalone: true,
  templateUrl: './button-general-action-component.html',
  styleUrl: './button-general-action-component.scss',
})
export class ButtonGeneralActionComponent {

  @Input() label: string = '';
  @Input() className: string = '';
  @Input() disabled: boolean = false;
  @Output() buttonClick = new EventEmitter<void>();

  public get buttonClass(): string {
    const baseClass = this.className.trim();
    const cancelClass = this.label.trim().toLowerCase() === 'annulla' ? 'weavops-cancel-button' : '';

    return `${baseClass} ${cancelClass}`.trim();
  }

  public emitClick(): void {
    this.buttonClick.emit();
  }
}
