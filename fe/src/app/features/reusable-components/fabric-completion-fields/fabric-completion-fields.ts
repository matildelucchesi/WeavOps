import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Arrangement, Item, Process } from '../../../api';
import { Certification } from '../../../api/model/certification';
import { CertificationFacadeService } from '../../../services/certification-facade.service';

@Component({
  selector: 'app-fabric-completion-fields',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './fabric-completion-fields.html',
  styleUrl: './fabric-completion-fields.scss',
})
export class FabricCompletionFields implements OnInit {
  @Input() item: Item | null = null;
  @Input() process: Process | null = null;
  @Input() arrangement: Arrangement | null = null;
  private readonly certificationService = inject(CertificationFacadeService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  public certificationsLoading = false;
  public code = '';
  public certificationId: string | undefined;
  public certifications: Certification[] = [];
  public certificationError = false;
  public submitted = false;
  public get piecesCount(): number { return this.process?.piecesRun ?? 0; }
  public get metersPerPiece(): number | null { return this.arrangement?.pieceLength ?? null; }
  public get weightPerPiece(): number | null {
    const count = this.arrangement?.piecesCount;
    const warp = this.item?.warpWeight;
    const weft = this.item?.weftWeight;
    return count && count > 0 && warp != null && weft != null ? (warp + weft) / count : null;
  }
  public get totalMeters(): number | null { return this.metersPerPiece == null ? null : this.piecesCount * this.metersPerPiece; }
  public get totalWeight(): number | null { return this.weightPerPiece == null ? null : this.piecesCount * this.weightPerPiece; }
  public get certificationLabel(): string {
    if (this.item?.isCertified !== 'ALL') return 'Nessuna';
    return this.certifications.find(value => value.id === this.item?.certificationId)?.value
      ?? (this.certificationsLoading ? 'Caricamento…' : this.certificationError
        ? 'Impossibile caricare la certificazione' : 'Certificazione articolo non specificata');
  }
  public get validationMessage(): string | null {
    if (!this.item || !this.process || !this.arrangement) return 'Impossibile caricare i dati della produzione.';
    if (this.piecesCount <= 0) return null;
    if (!this.code.trim()) return 'Inserire il codice Tela.';
    if (this.metersPerPiece == null || this.metersPerPiece <= 0) return 'Inserire i metri per pezza nella disposizione.';
    if (this.weightPerPiece == null || this.weightPerPiece < 0) return 'Inserire i pesi dell’articolo e il numero di pezze previste nella disposizione.';
    if (this.item.isCertified === 'ALL' && !this.item.certificationId) return 'Specificare la certificazione dell’articolo.';
    if (this.item.isCertified === 'PARTIAL' && this.certificationError) return 'Impossibile caricare le certificazioni. Riprovare.';
    return null;
  }
  public ngOnInit(): void {
    this.code = this.process?.fabricCode ?? '';
    if (this.item?.isCertified === 'ALL' || this.item?.isCertified === 'PARTIAL') {
      this.certificationsLoading = true;
      this.certificationService.getAll().subscribe({
        next: values => {
          this.certifications = values;
          this.certificationsLoading = false;
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.certificationError = true;
          this.certificationsLoading = false;
          this.changeDetector.markForCheck();
        },
      });
    }
  }
  public validate(): boolean { this.submitted = true; return this.validationMessage == null; }
}
