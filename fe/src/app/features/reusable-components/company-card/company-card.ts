import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-company-card', standalone: true, imports: [MatIconModule],
  template: `<details class="company-card"><summary><h2>{{ name.toLocaleUpperCase('it') }}</h2><span class="header-actions" (click)="$event.stopPropagation(); $event.preventDefault()"><ng-content select="[cardActions]"></ng-content></span><span class="expand-button"><mat-icon class="expand-icon" aria-hidden="true">expand_more</mat-icon></span><span class="sr-only">Apri o chiudi i dati dell’azienda</span></summary><div class="company-details"><ng-content></ng-content></div></details>`,
  styleUrl: './company-card.scss',
})
export class CompanyCard { @Input({required: true}) name = ''; }
