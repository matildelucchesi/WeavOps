import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../api';
import { UserFacadeService } from '../../../services/user-facade.service';
import { LoaderComponent } from '../../reusable-components/loader-component/loader-component';
import { TitlePageComponent } from '../../reusable-components/title-page-component/title-page-component';
import { ExitButtonComponent } from "../../reusable-components/button/exit-button-component/exit-button-component";

interface ProfileForm {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, LoaderComponent, MatIcon, TitlePageComponent, ExitButtonComponent],
  standalone: true,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly userService = inject(UserFacadeService);
  public company = { name: '', vatNumber: '', fiscalCode: '' };
  public isLoadingCompany = true;
  private readonly snackBar = inject(MatSnackBar);
  private loaderStartedAt = 0;

  public profile: ProfileForm = { username: '', firstName: '', lastName: '', email: '' };
  public profileImageUrl: string | null = null;
  public newPassword = '';
  public confirmPassword = '';
  public isSaving = false;
  public isUpdatingImage = false;
  public userId: string | null = null;

  ngOnInit(): void {
    this.loadProfileImage();
    this.userId = this.getUserIdFromToken();

    if (!this.userId) {
      this.isLoadingCompany = false;
      this.showError('Impossibile recuperare l’utente autenticato');
      return;
    }

    this.userService.getById(this.userId).subscribe({
      next: (user) => {
        this.profile = {
          username: user.username ?? '',
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email ?? '',
        };
        this.company = { name: user.companyName ?? '', vatNumber: user.vatNumber ?? '', fiscalCode: user.fiscalCode ?? '' };
        this.isLoadingCompany = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.isLoadingCompany = false;
        this.changeDetectorRef.markForCheck();
        this.showError('Impossibile caricare il profilo');
      },
    });
  }

  public saveCompany(): void {
    if (this.isSaving || this.isLoadingCompany) return;
    const company = { name: this.company.name.trim(), vatNumber: this.company.vatNumber.trim(), fiscalCode: this.company.fiscalCode.trim().toUpperCase() };
    if (!company.name || !/^[a-z0-9]+$/i.test(company.vatNumber)) {
      this.showError('Inserisci nome azienda e partita IVA alfanumerica');
      return;
    }
    this.company = company;
    if (company.fiscalCode && !/^[a-z0-9]+$/i.test(company.fiscalCode)) {
      this.showError('Inserisci un codice fiscale alfanumerico');
      return;
    }
    this.updateUser('', 'Informazioni azienda aggiornate');
  }

  public onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const image = input.files?.[0];

    if (!image?.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return;
      }

      this.profileImageUrl = reader.result;
      try {
        globalThis.localStorage?.setItem('weavops-profile-image', reader.result);
      } catch {
        this.showError('Impossibile salvare l’immagine profilo');
      }
    };
    reader.readAsDataURL(image);
    input.value = '';
  }

  public updateProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const image = input.files?.[0];

    if (!image?.type.startsWith('image/')) {
      return;
    }

    this.isUpdatingImage = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.isUpdatingImage = false;
        return;
      }

      try {
        globalThis.localStorage?.setItem('weavops-profile-image', reader.result);
        this.profileImageUrl = reader.result;
        this.isUpdatingImage = false;
        this.changeDetectorRef.detectChanges();
        this.snackBar.open('Immagine aggiornata con successo', 'Chiudi', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });
      } catch {
        this.isUpdatingImage = false;
        this.showError('Impossibile salvare l’immagine profilo');
      }
    };
    reader.onerror = () => {
      this.isUpdatingImage = false;
      this.showError('Impossibile leggere l’immagine profilo');
    };
    reader.readAsDataURL(image);
    input.value = '';
  }

  public updateProfileImageWithLoader(event: Event): void {
    const input = event.target as HTMLInputElement;
    const image = input.files?.[0];

    if (!image?.type.startsWith('image/')) {
      return;
    }

    this.isUpdatingImage = true;
    this.startLoader();
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.finishLoader();
        return;
      }

      try {
        globalThis.localStorage?.setItem('weavops-profile-image', reader.result);
        this.profileImageUrl = reader.result;
        this.finishLoader(() => {
          this.snackBar.open('Immagine aggiornata con successo', 'Chiudi', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
        });
      } catch {
        this.finishLoader(() => this.showError('Impossibile salvare immagine profilo'));
      }
    };
    reader.onerror = () => this.finishLoader(() => this.showError('Impossibile leggere immagine profilo'));
    reader.readAsDataURL(image);
    input.value = '';
  }

  public saveProfile(): void {
    this.updateUser('', 'Profilo aggiornato');
  }

  public changePassword(): void {
    if (this.newPassword.length < 8) {
      this.showError('La password deve contenere almeno 8 caratteri');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showError('Le password non coincidono');
      return;
    }

    this.updateUser(this.newPassword, 'Password aggiornata');
  }

  private updateUser(password: string, successMessage: string): void {
    if (!this.userId || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.startLoader();
    const user: User = { ...this.profile, password, companyName: this.company.name, vatNumber: this.company.vatNumber, fiscalCode: this.company.fiscalCode };
    this.userService.update(this.userId, user).subscribe({
      next: (updatedUser) => {
        this.profile = {
          username: updatedUser.username ?? this.profile.username,
          firstName: updatedUser.firstName ?? '',
          lastName: updatedUser.lastName ?? '',
          email: updatedUser.email ?? '',
        };
        this.company = { name: updatedUser.companyName ?? '', vatNumber: updatedUser.vatNumber ?? '', fiscalCode: updatedUser.fiscalCode ?? '' };
        this.newPassword = '';
        this.confirmPassword = '';
        this.finishLoader(() => {
          this.snackBar.open(successMessage, 'Chiudi', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'bottom' });
        });
      },
      error: () => {
        this.finishLoader(() => this.showError('Impossibile salvare le modifiche'));
      },
    });
  }

  private startLoader(): void {
    this.loaderStartedAt = Date.now();
    this.changeDetectorRef.detectChanges();
  }

  private finishLoader(afterClose?: () => void): void {
    const remainingDuration = Math.max(0, 500 - (Date.now() - this.loaderStartedAt));

    setTimeout(() => {
      this.isSaving = false;
      this.isUpdatingImage = false;
      this.changeDetectorRef.detectChanges();
      afterClose?.();
    }, remainingDuration);
  }

  private loadProfileImage(): void {
    try {
      this.profileImageUrl = globalThis.localStorage?.getItem('weavops-profile-image') ?? null;
    } catch {
      this.profileImageUrl = null;
    }
  }

  private getUserIdFromToken(): string | null {
    try {
      const token = globalThis.localStorage?.getItem('access_token');
      const payload = token?.split('.')[1];
      if (!payload) {
        return null;
      }

      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64Payload.padEnd(base64Payload.length + ((4 - base64Payload.length % 4) % 4), '='));
      const parsedPayload = JSON.parse(json) as { userId?: string };
      return parsedPayload.userId ?? null;
    } catch {
      return null;
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Chiudi', { duration: 4000, horizontalPosition: 'end', verticalPosition: 'bottom', panelClass: ['error-snackbar'] });
  }
}
