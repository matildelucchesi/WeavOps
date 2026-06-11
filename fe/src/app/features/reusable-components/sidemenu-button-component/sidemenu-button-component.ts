import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidemenu-button-component',
  imports: [
    MatIconModule,
    CommonModule,
    RouterLink
  ],
  standalone: true,
  templateUrl: './sidemenu-button-component.html',
  styleUrl: './sidemenu-button-component.scss',
})
export class SidemenuButtonComponent {
  private readonly router = inject(Router);

  @Input() icon: string = '';
  @Input() label: string = '';
  @Input() route: string | null = null;

  isImage(icon: string){
    if(!icon) return false;
    return /\.(png|jpe?g|svg|gif)$/i.test(icon) || icon.includes('/');
  }

  isActiveRoute(route: string | null): boolean {
    if(!route) return false;
    return this.router.url === route;
  }

}
