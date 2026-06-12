import { Component } from '@angular/core';
import { TableComponent } from "../../reusable-components/table-component/table-component";
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { DecorativeLinesComponent } from '../../reusable-components/decorative-lines-component/decorative-lines-component';

@Component({
  selector: 'app-loom-page',
  imports: [
    TableComponent,
    TitlePageComponent,
    DecorativeLinesComponent
  ],
  standalone: true,
  templateUrl: './loom-page.html',
  styleUrl: './loom-page.scss',
})
export class LoomPage {}
