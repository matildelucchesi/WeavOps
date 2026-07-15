import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-home-metric-card-component',
  imports: [MatIcon],
  standalone: true,
  templateUrl: './home-metric-card-component.html',
  styleUrl: './home-metric-card-component.scss',
})
export class HomeMetricCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle: string = '';
  @Input() iconName: string = '';
  @Input() variant: 'primary' | 'accent' | 'danger' | 'warning' | 'neutral' | 'blue' = 'primary';
  @Input() clickable: boolean = false;
  @Input() gaugeValue: number | null = null;
  @Input() showBodyIcon: boolean = true;

  @Output() cardClicked = new EventEmitter<void>();

  public onCardClick(): void {
    if (this.clickable) {
      this.cardClicked.emit();
    }
  }

  public hasGauge(): boolean {
    return typeof this.gaugeValue === 'number' && Number.isFinite(this.gaugeValue);
  }

  public getGaugeNeedleTransform(): string {
    const value = Math.min(Math.max(this.gaugeValue ?? 0, 0), 100);
    const degrees = -90 + (value * 1.8);

    return `translateX(-50%) rotate(${degrees}deg)`;
  }
}
