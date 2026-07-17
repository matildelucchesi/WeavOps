import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';

export interface DialogAlertGenericDeliveryResult {
  confirmed: true;
  deliveryDate: string;
  isLate: boolean;
}

export type DialogAlertGenericResult = boolean | DialogAlertGenericDeliveryResult;

export interface DialogAlertGenericData {
  text?: string;
  subtext?: string;
  icon?: string;
  iconColor?: string;
  button?: boolean;
  closeOnly?: boolean;
  closeButtonLabel?: string;
  deliveryDetails?: boolean;
  deliveryDetailsTitle?: string;
  deliveryDate?: string | Date | null;
}

@Component({
  selector: 'app-dialog-alert-generic',
  imports: [FormsModule, MatIcon, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
  ],
  standalone: true,
  templateUrl: './dialog-alert-generic.html',
  styleUrl: './dialog-alert-generic.scss',
})
export class DialogAlertGeneric {
  private readonly dialogRef = inject(MatDialogRef<DialogAlertGeneric, DialogAlertGenericResult>, { optional: true });
  private readonly dialogData = inject<DialogAlertGenericData | null>(MAT_DIALOG_DATA, { optional: true });

  @Input() text: string = this.dialogData?.text ?? '';
  @Input() subtext: string = this.dialogData?.subtext ?? '';
  @Input() icon: string = this.dialogData?.icon ?? 'error';
  @Input() iconColor: string = this.dialogData?.iconColor ?? 'red';
  @Input() button: boolean = this.dialogData?.button ?? true;
  @Input() closeOnly: boolean = this.dialogData?.closeOnly ?? false;
  @Input() closeButtonLabel: string = this.dialogData?.closeButtonLabel ?? 'Chiudi';
  @Input() deliveryDetails: boolean = this.dialogData?.deliveryDetails ?? false;
  @Input() deliveryDetailsTitle: string = this.dialogData?.deliveryDetailsTitle ?? 'Per favore indica la Data di consegna';

  public showDeliveryDetails = false;
  public deliveryDate: Date | null = this.toDate(this.dialogData?.deliveryDate) ?? new Date();
  public isLate = false;

  public get isDangerVariant(): boolean {
    return this.resolveColorVariant() === 'danger';
  }

  public get isWarningVariant(): boolean {
    return this.resolveColorVariant() === 'warning';
  }

  public get resolvedIconColor(): string {
    if (this.isDangerVariant) {
      return 'var(--weavops-color-danger-bright)';
    }

    if (this.isWarningVariant) {
      return 'var(--weavops-color-warning)';
    }

    return this.iconColor;
  }

  private resolveColorVariant(): 'danger' | 'warning' | 'custom' {
    const normalizedColor = String(this.iconColor ?? '').trim().toLowerCase();

    if (
      normalizedColor.includes('red') ||
      normalizedColor.includes('rosso') ||
      normalizedColor.includes('danger') ||
      normalizedColor.includes('d90000') ||
      normalizedColor.includes('dd0000')
    ) {
      return 'danger';
    }

    if (
      normalizedColor.includes('yellow') ||
      normalizedColor.includes('giallo') ||
      normalizedColor.includes('warning') ||
      normalizedColor.includes('ffc800') ||
      normalizedColor.includes('ffe46d')
    ) {
      return 'warning';
    }

    return 'custom';
  }

  public onCloseDialog(): void {
    this.dialogRef?.close(false);
  }

  public onConfirm(): void {
    if (this.deliveryDetails && !this.showDeliveryDetails) {
      this.showDeliveryDetails = true;
      return;
    }

    this.dialogRef?.close(true);
  }

  public onConfirmDeliveryDetails(): void {
    if (!this.deliveryDate || Number.isNaN(this.deliveryDate.getTime())) {
      return;
    }

    this.dialogRef?.close({
      confirmed: true,
      deliveryDate: this.deliveryDate.toISOString(),
      isLate: this.isLate,
    });
  }

  public setIsLate(isLate: boolean): void {
    this.isLate = isLate;
  }

  private toDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

}
