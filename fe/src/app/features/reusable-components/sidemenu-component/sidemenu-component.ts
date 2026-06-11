import { Component } from '@angular/core';
import { SidemenuButtonComponent } from "../sidemenu-button-component/sidemenu-button-component";

@Component({
  selector: 'app-sidemenu-component',
  imports: [SidemenuButtonComponent],
  standalone: true,
  templateUrl: './sidemenu-component.html',
  styleUrl: './sidemenu-component.scss',
})
export class SidemenuComponent {}
