import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-add-button-component',
  imports: [MatIcon],
  standalone: true,
  templateUrl: './add-button-component.html',
  styleUrl: './add-button-component.scss',
})
export class AddButtonComponent {}
