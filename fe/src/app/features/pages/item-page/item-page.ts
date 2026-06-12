import { Component } from '@angular/core';
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";

@Component({
  selector: 'app-item-page',
  imports: [
    TitlePageComponent
],
  templateUrl: './item-page.html',
  styleUrl: './item-page.scss',
  standalone: true,
})
export class ItemPage {}
