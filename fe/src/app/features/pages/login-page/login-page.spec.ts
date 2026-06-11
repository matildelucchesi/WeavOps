import { TestBed } from '@angular/core/testing';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
    }).compileComponents();
  });

  it('renders six vertical and six horizontal animated weave lines', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const verticalLayer = compiled.querySelector('.login-weave--vertical');
    const horizontalLayer = compiled.querySelector('.login-weave--horizontal');

    expect(verticalLayer?.querySelectorAll('span').length).toBe(6);
    expect(horizontalLayer?.querySelectorAll('span').length).toBe(6);
  });

  it('staggers the vertical weave line starts with the horizontal spacing step', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const verticalLines = Array.from(
      compiled.querySelectorAll<HTMLElement>('.login-weave--vertical span'),
    );

    expect(verticalLines.map((line) => getComputedStyle(line).top)).toEqual([
      '0px',
      '18px',
      '36px',
      '54px',
      '72px',
      '90px',
    ]);
  });

  it('staggers the vertical weave line ends with the horizontal spacing step', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const verticalLines = Array.from(
      compiled.querySelectorAll<HTMLElement>('.login-weave--vertical span'),
    );

    expect(verticalLines.map((line) => getComputedStyle(line).bottom)).toEqual([
      '90px',
      '72px',
      '54px',
      '36px',
      '18px',
      '0px',
    ]);
  });

  it('extends the vertical weave lines farther down', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const verticalLayer = compiled.querySelector<HTMLElement>('.login-weave--vertical');

    expect(verticalLayer && getComputedStyle(verticalLayer).bottom).toBe('22px');
  });

  it('places the first horizontal weave line above the login block', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const horizontalLines = Array.from(
      compiled.querySelectorAll<HTMLElement>('.login-weave--horizontal span'),
    );

    expect(horizontalLines.map((line) => getComputedStyle(line).bottom)).toEqual([
      '170px',
      '152px',
      '134px',
      '116px',
      '98px',
      '80px',
    ]);
  });

  it('widens the horizontal weave layer slightly', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const horizontalLayer = compiled.querySelector<HTMLElement>('.login-weave--horizontal');
    const horizontalStyle = horizontalLayer && getComputedStyle(horizontalLayer);

    expect(horizontalStyle && horizontalStyle.left).toBe('4vw');
    expect(horizontalStyle && horizontalStyle.right).toBe('3vw');
  });

  it('staggers the horizontal weave line ends from left to right', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const horizontalLines = Array.from(
      compiled.querySelectorAll<HTMLElement>('.login-weave--horizontal span'),
    );

    expect(horizontalLines.map((line) => getComputedStyle(line).right)).toEqual([
      '90px',
      '72px',
      '54px',
      '36px',
      '18px',
      '0px',
    ]);
  });

  it('styles the weave lines as rounded thread fibers', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const verticalLine = compiled.querySelector<HTMLElement>('.login-weave--vertical span');
    const horizontalLine = compiled.querySelector<HTMLElement>('.login-weave--horizontal span');

    expect(verticalLine && getComputedStyle(verticalLine).width).toBe('4px');
    expect(horizontalLine && getComputedStyle(horizontalLine).height).toBe('4px');
    expect(verticalLine && getComputedStyle(verticalLine).borderRadius).toBe('999px');
    expect(horizontalLine && getComputedStyle(horizontalLine).borderRadius).toBe('999px');
  });

  it('animates the weave threads slowly', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const verticalLine = compiled.querySelector<HTMLElement>('.login-weave--vertical span');
    const horizontalLine = compiled.querySelector<HTMLElement>('.login-weave--horizontal span');

    expect(verticalLine && getComputedStyle(verticalLine).animationDuration).toBe('8s');
    expect(horizontalLine && getComputedStyle(horizontalLine).animationDuration).toBe('9s');
  });
});
