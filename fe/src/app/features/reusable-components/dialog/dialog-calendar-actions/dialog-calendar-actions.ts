import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatIcon } from "@angular/material/icon";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CalendarEvent } from '../../../../api';

export interface DialogCalendarActionsData {
  event?: CalendarEvent | null;
}

export type DialogCalendarActionsResult = { action: 'edit'; event: CalendarEvent } | 'delete' | false;

@Component({
  selector: 'app-dialog-calendar-actions',
  imports: [FormsModule, MatIcon, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
  ],
  standalone: true,
  templateUrl: './dialog-calendar-actions.html',
  styleUrl: './dialog-calendar-actions.scss',
})
export class DialogCalendarActions {
  private readonly dialogRef = inject(MatDialogRef<DialogCalendarActions, DialogCalendarActionsResult>, { optional: true });
  private readonly dialogData = inject<DialogCalendarActionsData | null>(MAT_DIALOG_DATA, { optional: true });

  public change: boolean = false;
  public readonly event = this.dialogData?.event ?? null;
  public genericEventDescription = this.event?.description ?? '';
  public genericEventDate: Date | null = this.parseEventDate(this.event?.date);

  public close(): void {
    this.dialogRef?.close(false);
  }

  public selectAction(action: 'edit' | 'delete'): void {
    if (action === 'edit') {
      this.openChangeSection();
      return;
    }

    this.dialogRef?.close(action);
  }

  public openChangeSection(): void {
    this.change = true;
  }

  public goBack(): void {
    this.change = false;
  }

  public saveGenericEvent(): void {
    const description = this.genericEventDescription.trim();
    const date = this.genericEventDate;

    if (!this.event || !description || !date || Number.isNaN(date.getTime())) {
      return;
    }

    this.dialogRef?.close({
      action: 'edit',
      event: {
        ...this.event,
        description,
        date: date.toISOString(),
        type: CalendarEvent.TypeEnum.Generic,
      },
    });
  }

  private parseEventDate(value: string | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }
}
