import { Component } from '@angular/core';
import { DecorativeLinesComponent } from '../../reusable-components/decorative-lines-component/decorative-lines-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { WhitePanel } from '../../reusable-components/white-panel/white-panel';

@Component({
  selector: 'app-item-details-page',
  imports: [
    DecorativeLinesComponent,
    TitlePageComponent,
    WhitePanel
  ],
  standalone: true,
  templateUrl: './item-details-page.html',
  styleUrl: './item-details-page.scss',
})
export class ItemDetailsPage {}
