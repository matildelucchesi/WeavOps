import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import type { DeliveryNoteRow } from '../../../services/delivery-note-pdf';
import type { SavedDeliveryNote } from '../../../services/delivery-note.service';

export interface AssignedFabricRow extends DeliveryNoteRow {
  deliveryNote: SavedDeliveryNote;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './select-fabrics-dialog.html',
  styleUrl: './select-fabrics-dialog.scss',
})
export class SelectFabricsDialog {
  readonly data = inject<{ customerName: string; rows: DeliveryNoteRow[]; assignedRows?: AssignedFabricRow[]; selected: string[] }>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<SelectFabricsDialog>);
  selected = new Set(this.data.selected.filter(key => this.data.rows.some(row => row.key === key)));
  search = '';
  get filtered() {
    const q = this.search.trim().toLocaleLowerCase('it');
    return this.data.rows.filter(r => `${r.fabricCode} ${r.description}`.toLocaleLowerCase('it').includes(q));
  }
  get filteredAssigned() {
    const q = this.search.trim().toLocaleLowerCase('it');
    return (this.data.assignedRows ?? []).filter(row =>
      `${row.fabricCode} ${row.description} DDT ${row.deliveryNote.number}/${row.deliveryNote.year}`.toLocaleLowerCase('it').includes(q));
  }
  toggle(key: string, checked: boolean) {
    if (!this.data.rows.some(row => row.key === key)) return;
    if (checked) this.selected.add(key);
    else this.selected.delete(key);
  }
  confirm() { this.ref.close([...this.selected]); }
}
