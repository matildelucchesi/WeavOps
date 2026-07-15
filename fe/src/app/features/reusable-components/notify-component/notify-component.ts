import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-notify-component',
  imports: [MatIcon],
  standalone: true,
  templateUrl: './notify-component.html',
  styleUrl: './notify-component.scss',
})
export class NotifyComponent {

  @Input() iconName: string = '';
  @Input() text: string = '';
  @Input() buttonIcon: string = '';
  @Input() buttonText: string = '';
  @Input() variant: 'default' | 'danger' | 'accent' = 'default';
  @Output() buttonClicked = new EventEmitter<void>();


}
