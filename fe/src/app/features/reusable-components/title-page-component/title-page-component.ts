import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-title-page-component',
  imports: [MatIconModule],
  templateUrl: './title-page-component.html',
  styleUrl: './title-page-component.scss',
  standalone: true,
})
export class TitlePageComponent {

  @Input() title: string = '';
  @Input() imageLink: string = '/icon/loomicon-violet.png';
  @Input() imageAlt: string = 'Page icon';
  @Input() imageWidth: string | number = 50;
  @Input() imageHeight: string | number = 50;
  @Input() iconName: string = '';

  get imageWidthStyle(): string {
    return this.toCssSize(this.imageWidth);
  }

  get imageHeightStyle(): string {
    return this.toCssSize(this.imageHeight);
  }

  private toCssSize(size: string | number): string {
    return typeof size === 'number' ? `${size}px` : size;
  }
}
