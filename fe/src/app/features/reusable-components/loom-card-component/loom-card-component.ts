import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Loom } from '../../../api';
import { AddButtonComponent } from "../button/add-button-component/add-button-component";
import { ButtonGeneralActionComponent } from "../button/button-general-action-component/button-general-action-component";

@Component({
  selector: 'app-loom-card-component',
  imports: [
    NgOptimizedImage,
    ButtonGeneralActionComponent
    ],
  templateUrl: './loom-card-component.html',
  styleUrl: './loom-card-component.scss',
})
export class LoomCardComponent {
  @Input() loom: Loom | null = null;
  @Input() isDialogMode: boolean = false;
  @Input() days: string = '';

  get serialNumber(): string {
    return this.loom?.serialNumber ?? 'Numero Seriale Mancante';
  }

  get statusLabel(): string {
    switch (this.loom?.status) {
      case Loom.StatusEnum.Maintenance:
        return 'Manutenzione';
      case Loom.StatusEnum.Stopped:
        return 'Fermo';
      case Loom.StatusEnum.Working:
        return 'In lavorazione';
      default:
        return '---';
    }
  }

  get statusChipClass(): string {
    switch (this.loom?.status) {
      case Loom.StatusEnum.Maintenance:
        return 'loom-status-chip-maintenance';
      case Loom.StatusEnum.Working:
        return 'loom-status-chip-working';
      case Loom.StatusEnum.Stopped:
      default:
        return 'loom-status-chip-stopped';
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
  
  @Output() assign = new EventEmitter<Loom>();

  public onAssignClick(): void {
    if (this.loom) {
      this.assign.emit(this.loom);
  }
}
}
