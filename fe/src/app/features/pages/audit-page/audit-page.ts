import { Component } from '@angular/core';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';

@Component({
  selector: 'app-audit-page',
  standalone: true,
  imports: [TitlePageComponent],
  template: `<app-title-page-component title="Audit" iconName="fact_check" [imageWidth]="40" [imageHeight]="40"></app-title-page-component>`,
})
export class AuditPage {}
