import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidemenu-button-component',
  imports: [
    MatIconModule,
    CommonModule,
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
  @Input() activeRoutes: string[] = [];

  isImage(icon: string){
    if(!icon) return false;
    return /\.(png|jpe?g|svg|gif)$/i.test(icon) || icon.includes('/');
  }

  public navigateToRoute(): void {
    if (!this.route) {
      return;
    }

    this.router.navigateByUrl(this.route);
  }

  isActiveRoute(route: string | null): boolean {
    const routeToMatch = route;

    if (
      routeToMatch
      && this.router.isActive(routeToMatch, {
        paths: 'exact',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      })
    ) {
      return true;
    }

    const currentPath = this.router.url.split(/[?#]/)[0];

    return this.activeRoutes
      .filter((activeRoute): activeRoute is string => !!activeRoute)
      .some((activeRoute) => currentPath === activeRoute || currentPath.startsWith(`${activeRoute}/`));
  }

}
