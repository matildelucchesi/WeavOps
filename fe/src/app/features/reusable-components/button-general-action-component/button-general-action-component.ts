import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-general-action-component',
  imports: [],
  standalone: true,
  templateUrl: './button-general-action-component.html',
  styleUrl: './button-general-action-component.scss',
})
export class ButtonGeneralActionComponent {

  @Input() label: string = '';
  @Input() className: string = '';
}
