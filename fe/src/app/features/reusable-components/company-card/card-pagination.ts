import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-card-pagination', standalone: true, imports: [MatIconModule],
  template: `<nav aria-label="Paginazione"><label>Elementi per pagina <select [value]="pageSize" (change)="pageSizeChange.emit(+$any($event.target).value)"><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></label><span>{{ total ? (page - 1) * pageSize + 1 : 0 }}–{{ end }} di {{ total }}</span><button type="button" aria-label="Pagina precedente" [disabled]="page <= 1" (click)="pageChange.emit(page - 1)"><mat-icon>chevron_left</mat-icon></button><span aria-live="polite">{{ page }} / {{ pages }}</span><button type="button" aria-label="Pagina successiva" [disabled]="page >= pages" (click)="pageChange.emit(page + 1)"><mat-icon>chevron_right</mat-icon></button></nav>`,
  styles: `:host { margin-left:auto; } label { display:flex; align-items:center; gap:10px; } select { padding:8px; border:1px solid var(--weavops-color-primary); border-radius:8px; background:var(--weavops-color-surface); color:inherit; font:inherit; } nav { justify-content:flex-end; display:flex; align-items:center; gap:12px; color:var(--weavops-color-primary); flex-wrap:wrap; font-size:13px; } button { display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px; padding:0; border:1px solid var(--weavops-color-primary); border-radius:8px; background:var(--weavops-color-surface-muted); color:inherit; cursor:pointer; } button:disabled { opacity:.4; cursor:default; } button:focus-visible { outline:2px solid var(--weavops-color-accent); outline-offset:2px; }`,
})
export class CardPagination {
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();
  get pages(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }
  get end(): number { return Math.min(this.page * this.pageSize, this.total); }
}
