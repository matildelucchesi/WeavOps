import { Injectable, inject } from '@angular/core';
import { User, UserService as UserApiService } from '../api';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserFacadeService {
  private readonly userApi = inject(UserApiService);

  getAll() {
    return this.userApi.getUsers();
  }

  getById(id: string) {
    return this.userApi.getUserById({ id });
  }
  getCurrent() {
    try {
      const payload = localStorage.getItem('access_token')?.split('.')[1];
      if (!payload) throw new Error('Utente non autenticato');
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const userId = JSON.parse(atob(base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '='))).userId;
      if (typeof userId !== 'string' || !userId) throw new Error('Utente non autenticato');
      return this.getById(userId);
    } catch {
      return throwError(() => new Error('Impossibile recuperare l’utente autenticato'));
    }
  }

  create(user: User) {
    return this.userApi.createUser({ user });
  }

  update(id: string, user: User) {
    return this.userApi.updateUser({ id, user });
  }

  remove(id: string) {
    return this.userApi.deleteUser({ id });
  }
}
