import { Injectable, inject } from '@angular/core';
import { User, UserService as UserApiService } from '../api';

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