import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { SidemenuComponent } from './sidemenu-component';

describe('SidemenuComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [SidemenuComponent], providers: [provideRouter([])]}).compileComponents();
  });
  it('groups customers and destinations in a flyout and closes it on Escape', async () => {
    const fixture = TestBed.createComponent(SidemenuComponent); await fixture.whenStable();
    const toggle = fixture.nativeElement.querySelector('.directory-toggle') as HTMLButtonElement;
    expect(toggle.textContent).toContain('Anagrafiche');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    toggle.click(); await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('a[href="/clienti"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href="/destinazioni"]')).toBeTruthy();
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.directory-submenu')).toBeNull();
  });
  it('closes the previous submenu when switching groups or clicking outside', async () => {
    const fixture = TestBed.createComponent(SidemenuComponent); await fixture.whenStable();
    const directory = fixture.nativeElement.querySelector('.directory-group:not(.documents-group) button') as HTMLButtonElement;
    const documents = fixture.nativeElement.querySelector('.documents-group button') as HTMLButtonElement;
    directory.click(); await fixture.whenStable();
    documents.click(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#directory-submenu')).toBeNull();
    expect(fixture.nativeElement.querySelector('#documents-submenu')).toBeTruthy();
    documents.click(); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#documents-submenu')).toBeNull();
    directory.click(); await fixture.whenStable();
    document.dispatchEvent(new MouseEvent('click', {bubbles: true})); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#directory-submenu')).toBeNull();
  });
});
