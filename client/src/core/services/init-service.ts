import { inject, Injectable } from '@angular/core';
import { of } from 'rxjs';
import { User } from '../../types/user';
import { AccountService } from './account-service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private accountService = inject(AccountService);

  init() {
    const userString = localStorage.getItem('user');
    if (!userString) return of(null);
    const user: User = JSON.parse(userString);
    this.accountService.currentUser.set(user);

    return of(null);
  }
}
