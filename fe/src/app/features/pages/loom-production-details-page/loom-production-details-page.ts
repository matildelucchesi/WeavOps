import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecorativeLinesComponent } from "../../reusable-components/decorative-lines-component/decorative-lines-component";
import { TitlePageComponent } from "../../reusable-components/title-page-component/title-page-component";
import { ActivatedRoute } from '@angular/router';
import { LoomFacadeService } from '../../../services/loom-facade.service';
import { ItemFacadeService } from '../../../services/item-facade.service';
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";
import { MatIcon } from "@angular/material/icon";
import { Arrangement, Item, Loom, Process } from '../../../api';
import { ArrangementFacadeService } from '../../../services/arrangement-facade.service';

@Component({
  selector: 'app-loom-production-details-page',
  imports: [DecorativeLinesComponent, TitlePageComponent, ExitButtonComponent, MatIcon],
  standalone: true,
  templateUrl: './loom-production-details-page.html',
  styleUrl: './loom-production-details-page.scss',
})
export class LoomProductionDetailsPage implements OnInit {

  private readonly loomService = inject(LoomFacadeService);
  private readonly itemService = inject(ItemFacadeService);
  private readonly arrangementService = inject(ArrangementFacadeService);
  private readonly route = inject(ActivatedRoute);
  public isEditEnabled: boolean = false;
  public readonly loom = signal<Loom | null>(null);
  public readonly item = signal<Item | null>(null);
  public readonly process = signal<Process | null>(null);
  public readonly arrangement = signal<Arrangement | null>(null);

  public readonly pageTitle = computed((): string => {
    const loom = this.loom();

    return loom
      ? `Dettagli Produzione Telaio ${loom.serialNumber}`
      : 'Dettagli Produzione Telaio';
  });

  public readonly statusLabel = computed((): string => {
    switch (this.loom()?.status) {
      case Loom.StatusEnum.Working:
        return 'In lavorazione';
      case Loom.StatusEnum.Maintenance:
        return 'Manutenzione';
      case Loom.StatusEnum.Stopped:
        return 'Fermo';
      default:
        return 'Stato non disponibile';
    }
  });

  public readonly statusChipClass = computed((): string => {
    switch (this.loom()?.status) {
      case Loom.StatusEnum.Working:
        return 'chip-status-working';
      case Loom.StatusEnum.Maintenance:
        return 'chip-status-maintenance';
      case Loom.StatusEnum.Stopped:
        return 'chip-status-stopped';
      default:
        return 'chip-status-empty';
    }
  });

  public readonly percentage = computed((): number | null => {
    const item = this.item();

    if (!item?.totalMeters) {
      return null;
    }

    return Math.round(((item.metersRun ?? 0) / item.totalMeters) * 10000) / 100;
  });

  ngOnInit(): void {
    const loomId = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('id');

    if(loomId){
      this.loomService.getById(loomId).subscribe({
        next: (loom) => {
          this.loom.set(loom);
          this.loadActualItem(loom.actualItemId);
        },
        error: (error) => {
        console.error(error);
      }
    });
  }
  }

  private loadActualItem(itemId: string | undefined): void {
    this.item.set(null);

    const normalizedItemId = itemId?.trim();

    if (!normalizedItemId) {
      return;
    }

    this.itemService.getById(normalizedItemId).subscribe({
        next: (item) => {
          this.item.set(item);
          if(item.arrangementId){
            this.arrangementService.getById(item.arrangementId).subscribe({
              next: (arrangement) => {
                this.arrangement.set(arrangement);
              },
              error: (error) => {
                console.error(error);
              }
            });
          }
          if(item.processing) {
            for(const p of item.processing) {
              if(p.loom?.id === this.loom()?.id) {
                this.process.set(p);
                break;
              }
            }
          }
        },
        error: (error) => {
        this.item.set(null);
        this.process.set(null);
        console.error(error);
      },
      });
    }


  public get editButtonLabel(): string {
    return this.isEditEnabled ? 'Disabilita Modifiche' : 'Abilita Modifiche';
  }

  public get editButtonIcon(): string {
    return this.isEditEnabled ? 'lock' : 'edit';
  }

  public toggleEditMode(): void {
    this.isEditEnabled = !this.isEditEnabled;
  }

  public formatDate(value: string | undefined): string {
    if (!value) {
      return '';
    }

    const [year, month, day] = value.split('T')[0].split('-');

    return year && month && day ? `${day}/${month}/${year}` : value;
  }
}
