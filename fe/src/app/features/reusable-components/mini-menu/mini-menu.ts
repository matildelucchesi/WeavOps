import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mini-menu',
  imports: [MatButtonModule, MatIconModule],
  standalone: true,
  templateUrl: './mini-menu.html',
  styleUrl: './mini-menu.scss',
})
export class MiniMenu {
  private readonly router = inject(Router);

  public logout(): void {
    const storage = typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;

    storage?.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  gotoProfilePage(): void {
    this.router.navigate(['/profilo']);
  }
}
