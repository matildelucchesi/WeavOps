import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { SidemenuComponent } from './sidemenu-component';

describe('SidemenuComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidemenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('links the home and loom menu actions to their pages', async () => {
    const fixture = TestBed.createComponent(SidemenuComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('a.sidemenu-button'),
    );
    const homeLink = links.find((link) => link.textContent?.includes('Home'));
    const loomLink = links.find((link) => link.textContent?.includes('Telai'));

    expect(homeLink?.getAttribute('href')).toBe('/home');
    expect(loomLink?.getAttribute('href')).toBe('/telai');
  });
});
