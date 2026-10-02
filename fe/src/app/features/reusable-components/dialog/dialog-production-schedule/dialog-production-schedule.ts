import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

export interface ProductionSchedule {
  worksSaturday: boolean;
  saturdayStartTime?: string;
  saturdayEndTime?: string;
  worksSunday: boolean;
  sundayStartTime?: string;
  sundayEndTime?: string;
}

export interface ProductionScheduleDialogData extends Partial<ProductionSchedule> {
  title?: string;
  description?: string;
  confirmLabel?: string;
}

@Component({
  selector: 'app-dialog-production-schedule',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './dialog-production-schedule.html',
  styleUrl: './dialog-production-schedule.scss',
})
export class DialogProductionSchedule {
  private readonly dialogRef = inject(MatDialogRef<DialogProductionSchedule, ProductionSchedule | undefined>, { optional: true });
  private readonly data = inject<ProductionScheduleDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  public readonly title = this.data?.title ?? 'Orari di produzione nel weekend';
  public readonly description = this.data?.description ?? 'La produzione dal lunedì al venerdì è considerata attiva 24 ore su 24.';
  public readonly confirmLabel = this.data?.confirmLabel ?? 'Conferma';
  public worksSaturday = this.data?.worksSaturday ?? false;
  public saturdayStartTime = this.data?.saturdayStartTime ?? '';
  public saturdayEndTime = this.data?.saturdayEndTime ?? '';
  public worksSunday = this.data?.worksSunday ?? false;
  public sundayStartTime = this.data?.sundayStartTime ?? '';
  public sundayEndTime = this.data?.sundayEndTime ?? '';

  public setSaturdayEnabled(enabled: boolean): void {
    this.worksSaturday = enabled;
    if (!enabled) {
      this.saturdayStartTime = '';
      this.saturdayEndTime = '';
    }
  }

  public setSundayEnabled(enabled: boolean): void {
    this.worksSunday = enabled;
    if (!enabled) {
      this.sundayStartTime = '';
      this.sundayEndTime = '';
    }
  }

  public get canConfirm(): boolean {
    return (!this.worksSaturday || this.intervalMinutes(this.saturdayStartTime, this.saturdayEndTime) !== null)
      && (!this.worksSunday || this.intervalMinutes(this.sundayStartTime, this.sundayEndTime) !== null);
  }

  public get saturdayHours(): string {
    return this.formatHours(this.intervalMinutes(this.saturdayStartTime, this.saturdayEndTime));
  }

  public get sundayHours(): string {
    return this.formatHours(this.intervalMinutes(this.sundayStartTime, this.sundayEndTime));
  }

  public cancel(): void {
    this.dialogRef?.close(undefined);
  }

  public confirm(): void {
    if (!this.canConfirm) {
      return;
    }

    this.dialogRef?.close({
      worksSaturday: this.worksSaturday,
      saturdayStartTime: this.worksSaturday ? this.saturdayStartTime : undefined,
      saturdayEndTime: this.worksSaturday ? this.saturdayEndTime : undefined,
      worksSunday: this.worksSunday,
      sundayStartTime: this.worksSunday ? this.sundayStartTime : undefined,
      sundayEndTime: this.worksSunday ? this.sundayEndTime : undefined,
    });
  }

  private intervalMinutes(start: string, end: string): number | null {
    const startMinutes = this.toMinutes(start);
    const endMinutes = this.toMinutes(end);
    if (startMinutes === null || endMinutes === null) {
      return null;
    }

    const duration = endMinutes - startMinutes;
    return duration > 0 ? duration : duration < 0 ? duration + 24 * 60 : 24 * 60;
  }

  private toMinutes(value: string): number | null {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
  }

  private formatHours(totalMinutes: number | null): string {
    if (totalMinutes === null) {
      return 'Inserisci inizio e fine';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes === 0 ? `${hours} ${hours === 1 ? 'ora' : 'ore'}` : `${hours} h ${String(minutes).padStart(2, '0')} min`;
  }
}