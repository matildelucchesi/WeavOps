import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panel',
  imports: [],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
  standalone: true,
})
export class Panel {
  @Input() width: string = '100%';
  @Input() height: string = '100%';
  @Input() backgroundColor: string = '#fff';
  @Input() title: string = '';
}
