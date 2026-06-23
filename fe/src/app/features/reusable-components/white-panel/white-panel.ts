import { Component, Input } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-white-panel',
  imports: [MatIcon],
  standalone: true,
  templateUrl: './white-panel.html',
  styleUrl: './white-panel.scss',
})
export class WhitePanel {

  @Input() text: string = '';
  @Input() title: string = 'Attenzione';
  @Input() iconName: string = 'brightness_alert';
  @Input() iconFontSet: string = 'material-symbols-outlined';
  @Input() iconFill: 0 | 1 = 1;

}
