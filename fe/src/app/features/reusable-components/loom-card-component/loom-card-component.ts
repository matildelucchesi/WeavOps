import { Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Loom } from '../../../api';

@Component({
  selector: 'app-loom-card-component',
  imports: [NgOptimizedImage],
  templateUrl: './loom-card-component.html',
  styleUrl: './loom-card-component.scss',
})
export class LoomCardComponent {
  @Input() loom: Loom | null = null;

  get serialNumber(): string {
    return this.loom?.serialNumber ?? 'Numero Seriale Mancante';
  }

  get statusLabel(): string {
    switch (this.loom?.status) {
      case Loom.StatusEnum.Maintenance:
        return 'Manutenzione';
      case Loom.StatusEnum.Stopped:
        return '---';
      case Loom.StatusEnum.Working:
        return 'In lavorazione';
      default:
        return '---';
    }
  }

  get icon(): string {
    switch (this.loom?.status) {
      case Loom.StatusEnum.Maintenance:
        return '/icon/loomicon-maintenance.png';
      case Loom.StatusEnum.Stopped:
        return '/icon/loomicon-stopped.png';
      case Loom.StatusEnum.Working:
        return '/icon/loomicon-working.png';
      default:
        return '/icon/loomicon-stopped.png';
    }
  }
}
