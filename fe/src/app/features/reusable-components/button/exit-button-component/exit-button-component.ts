import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-exit-button-component',
  imports: [MatButtonModule, MatIcon],
  standalone: true,
  templateUrl: './exit-button-component.html',
  styleUrl: './exit-button-component.scss',
})
export class ExitButtonComponent {

  turnBack(): void {
    window.history.back();
  }

}
