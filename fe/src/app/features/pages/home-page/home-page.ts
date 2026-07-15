import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { CalendarEventsService, Loom, LoomItemAssignment, Notification, NotificationsService } from '../../../api';
import { LoomCardComponent } from "../../reusable-components/loom-card-component/loom-card-component";
import { DialogLoomActionComponent } from '../../reusable-components/dialog/dialog-loom-action-component/dialog-loom-action-component';
import { DialogAddNewLoomComponent } from '../../reusable-components/dialog/dialog-add-new-loom-component/dialog-add-new-loom-component';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { LoomItemAssignmentFacadeService } from '../../../services/loom-item-assignment-facade.service';
import { ProcessFacadeService } from '../../../services/process-facade.service';
import { ItemNotArchivedTableService } from '../../../table/table-service/item-not-archived-table.service';
import { ItemTableRow } from '../../../table/table-row-interface/item-table-row';
import { HomeMetricCardComponent } from '../../reusable-components/home-metric-card-component/home-metric-card-component';

@Component({
  imports: [
    MatIconButton,
    MatIcon,
    LoomCardComponent,
    HomeMetricCardComponent,
],
  standalone: true,
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly loomService = inject(LoomFacadeService);
  private readonly assignmentService = inject(LoomItemAssignmentFacadeService);
  private readonly processService = inject(ProcessFacadeService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly calendarEventsService = inject(CalendarEventsService);
  private readonly itemNotArchivedTableService = inject(ItemNotArchivedTableService);

  public readonly loomList = signal<Loom[]>([]);
  public readonly loomDaysById = signal<Record<string, string>>({});
  public readonly loomQueueCountById = signal<Record<string, number>>({});
  public readonly deliveryRiskNotifications = signal<Notification[]>([]);
  public readonly currentWeekPendingDeliveryCount = signal<number | null>(null);
  public readonly overdueDeliveryCount = signal<number | null>(null);
  public readonly deliveryRiskTableVisible = signal<boolean>(false);

  ngOnInit(): void {
    this.loadLoomList();
    this.loadDeliveryRiskNotifications();
    this.loadCurrentWeekPendingDeliveryCount();
    this.loadOverdueDeliveryCount();
  }

  public loadLoomList(): void {
    this.loomService.getAll().subscribe({
      next: (looms) => {
        this.loomList.set(looms);
        this.loadWorkingLoomProcessDays(looms);
        this.loadQueuedLoomAssignments();
      },
      error: (err) => {
        console.error('Error loading looms:', err);
        this.loomList.set([]);
        this.loomDaysById.set({});
        this.loomQueueCountById.set({});
      },
    });
  }

  public getLoomDays(loom: Loom): string {
    if (!loom.id || loom.status !== Loom.StatusEnum.Working) {
      return '';
    }

    return this.loomDaysById()[loom.id] ?? '';
  }

  public getLoomQueueCount(loom: Loom): number {
    if (!loom.id) {
      return 0;
    }

    return this.loomQueueCountById()[loom.id] ?? 0;
  }

  public getLoomUtilizationRate(): string {
    return `${this.getLoomUtilizationValue()}%`;
  }

  public getLoomUtilizationValue(): number {
    const total = this.loomList().length;

    if (total === 0) {
      return 0;
    }

    return Math.round((this.getWorkingLoomCount() / total) * 100);
  }

  public getLoomUtilizationSubtitle(): string {
    const total = this.loomList().length;
    const working = this.getWorkingLoomCount();

    if (total === 0) {
      return 'Nessun telaio registrato';
    }

    return `${working} telai in lavorazione su ${total}`;
  }

  public loadDeliveryRiskNotifications(): void {
    this.notificationsService.getItemDeliveryRiskNotifications().subscribe({
      next: (notifications) => {
        if (notifications?.length) {
          this.deliveryRiskNotifications.set(notifications);
          return;
        }

        this.loadFallbackDeliveryRiskNotifications();
      },
      error: (error) => {
        console.error('Error loading delivery risk notifications:', error);
        this.loadFallbackDeliveryRiskNotifications();
      },
    });
  }

  public openNotificationItem(notification: Notification): void {
    if (!notification.itemId) {
      return;
    }

    this.router.navigate(['/dettaglio-articolo'], {
      queryParams: { id: notification.itemId },
    });
  }

  public openItems(): void {
    this.router.navigate(['/articoli']);
  }

  public toggleDeliveryRiskTable(): void {
    this.deliveryRiskTableVisible.update((visible) => !visible);
  }

  public getDeliveryRiskItemName(notification: Notification): string {
    const prefix = 'La fine produzione prevista di ';
    const suffix = ' supera la data di consegna.';
    const message = notification.message ?? '';

    if (message.startsWith(prefix) && message.endsWith(suffix)) {
      return message.slice(prefix.length, -suffix.length).trim() || 'Articolo';
    }

    return notification.title || 'Articolo';
  }

  public getDeliveryRiskDelayDays(notification: Notification): number {
    const expectedEndDate = this.toDateOnlyTimestamp(notification.expectedEndDate);
    const deliveryDate = this.toDateOnlyTimestamp(notification.deliveryDate);

    if (expectedEndDate === null || deliveryDate === null || expectedEndDate <= deliveryDate) {
      return 0;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    return Math.ceil((expectedEndDate - deliveryDate) / millisecondsPerDay);
  }

  public getCurrentWeekPendingDeliverySubtitle(): string {
    const count = this.currentWeekPendingDeliveryCount() ?? 0;

    return count === 1
      ? 'Consegna ancora da effettuare'
      : 'Consegne ancora da effettuare';
  }

  public getOverdueDeliverySubtitle(): string {
    const count = this.overdueDeliveryCount() ?? 0;

    return count === 1
      ? 'Scadenza superata non consegnata'
      : 'Scadenze superate non consegnate';
  }

  public openCalendar(): void {
    this.router.navigate(['/calendario']);
  }

  private loadCurrentWeekPendingDeliveryCount(): void {
    this.calendarEventsService.getCurrentWeekPendingDeliveryCount().subscribe({
      next: (count) => {
        this.currentWeekPendingDeliveryCount.set(count ?? 0);
      },
      error: (error) => {
        console.error('Error loading current week pending delivery count:', error);
        this.currentWeekPendingDeliveryCount.set(null);
      },
    });
  }

  private loadOverdueDeliveryCount(): void {
    this.calendarEventsService.getOverdueDeliveryCount().subscribe({
      next: (count) => {
        this.overdueDeliveryCount.set(count ?? 0);
      },
      error: (error) => {
        console.error('Error loading overdue delivery count:', error);
        this.overdueDeliveryCount.set(null);
      },
    });
  }

  private loadQueuedLoomAssignments(): void {
    this.assignmentService.getAll().subscribe({
      next: (assignments) => {
        const queueCountById = assignments.reduce<Record<string, number>>((accumulator, assignment) => {
          if (assignment.status === LoomItemAssignment.StatusEnum.Queued) {
            accumulator[assignment.loomId] = (accumulator[assignment.loomId] ?? 0) + 1;
          }

          return accumulator;
        }, {});

        this.loomQueueCountById.set(queueCountById);
      },
      error: (error) => {
        console.error('Error loading queued loom assignments:', error);
        this.loomQueueCountById.set({});
      },
    });
  }

  private getWorkingLoomCount(): number {
    return this.loomList().filter((loom) => loom.status === Loom.StatusEnum.Working).length;
  }

  private loadFallbackDeliveryRiskNotifications(): void {
    this.itemNotArchivedTableService.getRows().subscribe({
      next: (rows) => {
        const notifications = rows
          .filter((row) => this.isExpectedEndDateAfterDeliveryDate(row))
          .map((row) => this.toDeliveryRiskNotification(row));

        this.deliveryRiskNotifications.set(notifications);
      },
      error: (error) => {
        console.error('Error loading fallback delivery risk notifications:', error);
        this.deliveryRiskNotifications.set([]);
      },
    });
  }

  private toDeliveryRiskNotification(row: ItemTableRow): Notification {
    const itemName = row.arrangement?.itemName ?? 'Articolo';
    const itemId = row.item.id ?? row.id ?? '';

    return {
      id: `ITEM_DELIVERY_RISK:${itemId}`,
      type: Notification.TypeEnum.ItemDeliveryRisk,
      severity: Notification.SeverityEnum.Warning,
      title: 'Consegna a rischio',
      message: `La fine produzione prevista di ${itemName} supera la data di consegna.`,
      itemId,
      arrangementId: row.arrangement?.id ?? row.item.arrangementId,
      expectedEndDate: row.item.expectedEndDate,
      deliveryDate: row.arrangement?.deliveryDate,
    };
  }

  private isExpectedEndDateAfterDeliveryDate(row: ItemTableRow): boolean {
    const expectedEndDate = this.toDateOnlyTimestamp(row.item.expectedEndDate);
    const deliveryDate = this.toDateOnlyTimestamp(row.arrangement?.deliveryDate);

    return expectedEndDate !== null
      && deliveryDate !== null
      && expectedEndDate > deliveryDate;
  }

  private toDateOnlyTimestamp(value: string | undefined): number | null {
    if (!value || value === '-') {
      return null;
    }

    const datePart = value.split('T')[0];
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

    if (dateMatch) {
      return Date.UTC(
        Number(dateMatch[1]),
        Number(dateMatch[2]) - 1,
        Number(dateMatch[3]),
      );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private loadWorkingLoomProcessDays(looms: Loom[]): void {
    const workingLooms = looms.filter((loom) => loom.id && loom.status === Loom.StatusEnum.Working);

    if (workingLooms.length === 0) {
      this.loomDaysById.set({});
      return;
    }

    forkJoin(workingLooms.map((loom) => {
      const loomId = loom.id ?? '';

      return this.assignmentService.getRunningAssignmentByLoomId(loomId).pipe(
        switchMap((assignment) => assignment.processId
          ? this.processService.getById(assignment.processId)
          : of(null),
        ),
        map((process) => [loomId, this.formatProcessDays(process?.days)] as const),
        catchError((error) => {
          console.error('Error loading working loom process days:', error);
          return of([loomId, ''] as const);
        }),
      );
    })).subscribe((entries) => {
      this.loomDaysById.set(entries.reduce<Record<string, string>>((accumulator, [loomId, days]) => {
        if (days) {
          accumulator[loomId] = days;
        }

        return accumulator;
      }, {}));
    });
  }

  private formatProcessDays(value: number | undefined): string {
    if (value === undefined || value === null || !Number.isFinite(value)) {
      return '';
    }

    if (value <= 0) {
      return '0m';
    }

    const rawMinutes = value * 24 * 60;

    if (rawMinutes < 1) {
      return '< 1m';
    }

    const totalMinutes = Math.round(rawMinutes);
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days}g`);
    }

    if (hours > 0) {
      parts.push(`${hours}h`);
    }

    if (minutes > 0 || parts.length === 0) {
      parts.push(`${minutes}m`);
    }

    return parts.join(' ');
  }

  openLoomActions(loom: Loom): void {
    const dialogRef = this.dialog.open(DialogLoomActionComponent, {
      panelClass: 'loom-action-dialog-panel',
      data: {
        loom,
        modify: false,
      },
    });
    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.loadLoomList();
        this.loadDeliveryRiskNotifications();
        this.loadCurrentWeekPendingDeliveryCount();
        this.loadOverdueDeliveryCount();
      }
    });
  }

  openNewLoomDialog(): void {
    const dialogRef = this.dialog.open(DialogAddNewLoomComponent, {
      panelClass: 'add-new-loom-dialog-panel',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadLoomList();
    });
  }
}
