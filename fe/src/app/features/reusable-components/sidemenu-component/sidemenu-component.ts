import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { SidemenuButtonComponent } from "../sidemenu-button-component/sidemenu-button-component";
import { MiniMenu } from '../mini-menu/mini-menu';

@Component({
  selector: 'app-sidemenu-component',
  imports: [SidemenuButtonComponent, MiniMenu],
  standalone: true,
  templateUrl: './sidemenu-component.html',
  styleUrl: './sidemenu-component.scss',
})
export class SidemenuComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  public isMiniMenuOpen: boolean = false;

  public toggleMiniMenu(): void {
    this.isMiniMenuOpen = !this.isMiniMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  public closeMiniMenuOnOutsideClick(event: MouseEvent): void {
    if (!this.isMiniMenuOpen) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    const hostElement = this.elementRef.nativeElement;
    const logoButton = hostElement.querySelector('.logo-button');
    const miniMenu = hostElement.querySelector('.mini-menu-wrapper');

    if (logoButton?.contains(target) || miniMenu?.contains(target)) {
      return;
    }

    this.isMiniMenuOpen = false;
  }
}
