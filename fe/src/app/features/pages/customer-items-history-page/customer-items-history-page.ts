import { Component } from '@angular/core';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { FilterButtonComponent } from "../../reusable-components/button/filter-button-component/filter-button-component";

@Component({
  selector: 'app-customer-items-history-page',
  imports: [DecorativeLinesComponent, TitlePageComponent, FilterButtonComponent],
  standalone: true,
  templateUrl: './customer-items-history-page.html',
  styleUrl: './customer-items-history-page.scss',
})
export class CustomerItemsHistoryPage {}
