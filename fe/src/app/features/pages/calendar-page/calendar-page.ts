import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  ariaLabel: string;
}

@Component({
  selector: 'app-calendar-page',
  imports: [MatIconModule],
  standalone: true,
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export class CalendarPage {
  public readonly weekDays: string[] = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  public currentMonth: Date = this.getCurrentMonth();
  public monthLabel: string = this.formatMonthLabel(this.currentMonth);
  public calendarDays: CalendarDay[] = this.buildCalendarDays(this.currentMonth);

  public showPreviousMonth(): void {
    this.setCurrentMonth(new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1));
  }

  public showNextMonth(): void {
    this.setCurrentMonth(new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1));
  }

  public showTodayMonth(): void {
    this.setCurrentMonth(this.getCurrentMonth());
  }

  private getCurrentMonth(): Date {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
  }

  private setCurrentMonth(month: Date): void {
    this.currentMonth = month;
    this.monthLabel = this.formatMonthLabel(month);
    this.calendarDays = this.buildCalendarDays(month);
  }

  private buildCalendarDays(month: Date): CalendarDay[] {
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const leadingDays = (firstDayOfMonth.getDay() + 6) % 7;
    const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
    const gridStartDate = new Date(month.getFullYear(), month.getMonth(), 1 - leadingDays);

    return Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(gridStartDate.getFullYear(), gridStartDate.getMonth(), gridStartDate.getDate() + index);

      return {
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month.getMonth(),
        isToday: this.isSameDate(date, new Date()),
        ariaLabel: this.formatAriaLabel(date),
      };
    });
  }

  private formatMonthLabel(date: Date): string {
    return new Intl.DateTimeFormat('it-IT', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private formatAriaLabel(date: Date): string {
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private isSameDate(firstDate: Date, secondDate: Date): boolean {
    return firstDate.getFullYear() === secondDate.getFullYear()
      && firstDate.getMonth() === secondDate.getMonth()
      && firstDate.getDate() === secondDate.getDate();
  }
}
