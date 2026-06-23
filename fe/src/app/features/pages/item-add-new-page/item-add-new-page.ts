import { Component, inject } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ExitButtonComponent } from "../../reusable-components/exit-button-component/exit-button-component";
import { ButtonGeneralActionComponent } from "../../reusable-components/button-general-action-component/button-general-action-component";
import { ItemFacadeService } from '../../../services/item-facade.service';

@Component({
  selector: 'app-item-add-new-page',
  imports: [
    DecorativeLinesComponent,
    TitlePageComponent,
    ExitButtonComponent,
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    ButtonGeneralActionComponent
],
  providers: [provideNativeDateAdapter()],
  standalone: true,
  templateUrl: './item-add-new-page.html',
  styleUrl: './item-add-new-page.scss',
})
export class ItemAddNewPage {

  public itemName: string = '';
  public customerName: string = '';
  public piecesCount: number | null = null; //numero pezze
  public pieceLength: number | null = null; //lunghezza pezze in metro
  public hitsPerDm: number | null = null; //numero colpi per decimetro
  public reedCount: number | null = null; //misura pettine
  public reedCM: number | null = null; //in quanti centimetri è il pettine
  public reedHeight: number | null = null; //altezza pettine in centimetri
  public warpLength: number | null = null; //lunghezza ordito in metri
  public warpEndCount: number | null = null; //numero fili ordito
  public deliveryDate: Date | null = null;

  public hasSubmitted: boolean = false;

  private readonly itemService = inject(ItemFacadeService);


  public shouldShowControlError(control: NgModel): boolean {
    return Boolean(control.invalid && (control.touched || control.dirty || this.hasSubmitted));
  }

  public createNewItem(itemForm: NgForm): void {
  this.hasSubmitted = true;

  if (itemForm.invalid) {
    return;
  }

  this.itemService.createItemWithArrangement({
    customerName: this.customerName.trim(),
    arrangement: {
      itemName: this.itemName.trim(),
      piecesCount: Number(this.piecesCount),
      pieceLength: Number(this.pieceLength),
      hitsPerDm: Number(this.hitsPerDm),
      reedCount: Number(this.reedCount),
      reedCM: Number(this.reedCM),
      reedHeight: Number(this.reedHeight),
      warpLength: Number(this.warpLength),
      warpEndCount: Number(this.warpEndCount),
      deliveryDate: this.deliveryDate
        ? this.deliveryDate.toISOString()
        : undefined,
    },
  }).subscribe({
    next: (response) => {
      console.log('Item created successfully:', response);
    },
    error: (error) => {
      console.error('Error creating item:', error);
    },
  });
}


}
