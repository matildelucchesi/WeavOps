import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader-component',
  imports: [],
  standalone: true,
  templateUrl: './loader-component.html',
  styleUrl: './loader-component.scss',
})
export class LoaderComponent {
  @Input() ariaLabel: string = 'Caricamento in corso';
}
