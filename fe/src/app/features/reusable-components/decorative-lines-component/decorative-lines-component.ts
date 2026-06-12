import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-decorative-lines-component',
  imports: [],
  templateUrl: './decorative-lines-component.html',
  styleUrl: './decorative-lines-component.scss',
  standalone: true,
})
export class DecorativeLinesComponent {
  @Input() horizontalPositions: string[] = ['15%', '18%', '70%', '74%'];
  @Input() verticalPositions: string[] = ['62%', '95%', '93%', '96%', '60%', '3%', '10%'];

  public readonly horizontalColorClasses = [
    'line-light-orange',
    'line-yellow',
    'line-orange',
    'line-yellow',
  ];

  public readonly verticalColorClasses = [
    'line-yellow',
    'line-orange',
    'line-orange',
    'line-light-yellow',
    'line-light-orange',
    'line-light-orange',
    'line-light-yellow',
  ];

  public getHorizontalColorClass(index: number): string {
    return this.horizontalColorClasses[index] ?? 'line-orange';
  }

  public getVerticalColorClass(index: number): string {
    return this.verticalColorClasses[index] ?? 'line-orange';
  }
}
