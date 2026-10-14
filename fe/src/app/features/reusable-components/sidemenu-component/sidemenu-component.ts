import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SidemenuButtonComponent } from "../sidemenu-button-component/sidemenu-button-component";
import { MiniMenu } from '../mini-menu/mini-menu';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidemenu-component',
  imports: [SidemenuButtonComponent, MiniMenu, RouterLink, RouterLinkActive, MatIconModule],
  standalone: true,
  templateUrl: './sidemenu-component.html',
  styleUrl: './sidemenu-component.scss',
})
export class SidemenuComponent {
  private readonly router = inject(Router);
  private readonly directoryOpen = signal(false);
  private readonly documentsOpen = signal(false);
  private readonly controlsOpen = signal(false);
  public get isControlsOpen(): boolean { return this.controlsOpen(); }
  public set isControlsOpen(value: boolean) { this.controlsOpen.set(value); }
  public get isControlsActive(): boolean { return ['/audit', '/storico-lavoro-telai'].includes(this.router.url.split(/[?#]/)[0]); }
  public get isDirectoryOpen(): boolean { return this.directoryOpen(); }
  public set isDirectoryOpen(value: boolean) { this.directoryOpen.set(value); }
  public get isDocumentsOpen(): boolean { return this.documentsOpen(); }
  public set isDocumentsOpen(value: boolean) { this.documentsOpen.set(value); }
  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationStart) this.closeMenus();
    });
  }
  public toggleDirectory(): void { this.isControlsOpen = false; this.isDocumentsOpen = false; this.isDirectoryOpen = !this.isDirectoryOpen; }
  public toggleDocuments(): void { this.isControlsOpen = false; this.isDirectoryOpen = false; this.isDocumentsOpen = !this.isDocumentsOpen; }
  public toggleControls(): void { this.isDirectoryOpen = false; this.isDocumentsOpen = false; this.isControlsOpen = !this.isControlsOpen; }
  public get isDocumentsActive(): boolean { return this.router.url.split(/[?#]/)[0].startsWith('/documenti'); }
  public get isDirectoryActive(): boolean { return ['/clienti', '/destinazioni', '/certificazioni', '/aggiungi-cliente', '/modifica-cliente', '/cronologia-articoli'].some(path => this.router.url.split(/[?#]/)[0] === path); }
  @HostListener('document:keydown.escape')
  public closeMenus(): void { this.isDirectoryOpen = false; this.isDocumentsOpen = false; this.isControlsOpen = false; this.isMiniMenuOpen = false; }
  @HostListener('document:click', ['$event'])
  public closeDirectoryOutside(event: MouseEvent): void {
    this.closeMiniMenuOnOutsideClick(event);
    const path = event.composedPath();
    const directory = this.elementRef.nativeElement.querySelector('.directory-group:not(.documents-group):not(.controls-group)');
    const documents = this.elementRef.nativeElement.querySelector('.documents-group');
    const controls = this.elementRef.nativeElement.querySelector('.controls-group');
    if (!directory || !path.includes(directory)) this.isDirectoryOpen = false;
    if (!documents || !path.includes(documents)) this.isDocumentsOpen = false;
    if (!controls || !path.includes(controls)) this.isControlsOpen = false;
  }
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  public isMiniMenuOpen: boolean = false;

  public toggleMiniMenu(): void {
    this.isMiniMenuOpen = !this.isMiniMenuOpen;
  }

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


