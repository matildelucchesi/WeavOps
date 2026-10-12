import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';

@Component({
  selector: 'app-documents-page',
  standalone: true,
  imports: [TitlePageComponent],
  template: `<app-title-page-component [title]="title" [iconName]="icon" [imageWidth]="40" [imageHeight]="40"></app-title-page-component>`,
})
export class DocumentsPage {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'];
  readonly icon = this.route.snapshot.data['icon'];
}
