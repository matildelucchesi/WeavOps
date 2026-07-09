import { Component, Input, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from "@angular/material/icon";

export interface DialogAlertGenericData {
  text?: string;
  subtext?: string;
  icon?: string;
  iconColor?: string;
  button?: boolean;
}

@Component({
  selector: 'app-dialog-alert-generic',
  imports: [MatIcon],
  standalone: true,
  templateUrl: './dialog-alert-generic.html',
  styleUrl: './dialog-alert-generic.scss',
})
export class DialogAlertGeneric {
  private readonly dialogRef = inject(MatDialogRef<DialogAlertGeneric, boolean>, { optional: true });
  private readonly dialogData = inject<DialogAlertGenericData | null>(MAT_DIALOG_DATA, { optional: true });

  @Input() text: string = this.dialogData?.text ?? '';
  @Input() subtext: string = this.dialogData?.subtext ?? '';
  @Input() icon: string = this.dialogData?.icon ?? 'error';
  @Input() iconColor: string = this.dialogData?.iconColor ?? 'red';
  @Input() button: boolean = this.dialogData?.button ?? true;

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
    this.dialogRef?.close(true);
  }

}
