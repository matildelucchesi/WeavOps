import { Component } from '@angular/core';
import { SidemenuComponent } from "../../reusable-components/sidemenu-component/sidemenu-component";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-main-page',
  imports: [SidemenuComponent, RouterOutlet],
  standalone: true,
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {}
