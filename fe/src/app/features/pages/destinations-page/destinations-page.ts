import { Component } from '@angular/core';
import { DestinationsSection } from '../../reusable-components/destinations-section/destinations-section';
@Component({selector: 'app-destinations-page', standalone: true, imports: [DestinationsSection], template: '<app-destinations-section></app-destinations-section>'})
export class DestinationsPage {}
