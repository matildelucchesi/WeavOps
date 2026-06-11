import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Loom } from '../../../api';
import { LoomCardComponent } from "../../reusable-components/loom-card-component/loom-card-component";
import { DialogLoomActionComponent } from '../../reusable-components/dialog-loom-action-component/dialog-loom-action-component';
import { DialogAddNewLoomComponent } from '../../reusable-components/dialog-add-new-loom-component/dialog-add-new-loom-component';
import { LoomFacadeService } from '../../../services/loom-facade.service';

@Component({
  selector: 'app-home-page',
  imports: [
    MatIconButton,
    MatIcon,
    LoomCardComponent,
],
  standalone: true,
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly loomService = inject(LoomFacadeService);

  public readonly loomList = signal<Loom[]>([]);

  ngOnInit(): void {
    this.loadLoomList();
  }

  public loadLoomList(): void {
    this.loomService.getAll().subscribe({
      next: (looms) => {
        this.loomList.set(looms);
      },
      error: (err) => {
        console.error('Error loading looms:', err);
        this.loomList.set([]);
      },
    });
  }

  openLoomActions(loom: Loom): void {
    this.dialog.open(DialogLoomActionComponent, {
      panelClass: 'loom-action-dialog-panel',
      data: {
        loom,
        modify: false,
      },
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
