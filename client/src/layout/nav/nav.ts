import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../../core/services/account-service';
import { BusyService } from '../../core/services/busy-service';
import { ToastService } from '../../core/services/toast-service';
import { themes } from '../theme';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit {
  protected accountService = inject(AccountService);
  protected busyService = inject(BusyService);
  private toast = inject(ToastService);
  private router = inject(Router);
  protected creds: any = {};
  protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'dark');
  protected themes = themes;

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
  }

  handleSelectedTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const elem = document.activeElement as HTMLDivElement;
    if (elem) {
      elem.blur();
    }
  }

  login() {
    this.accountService.login(this.creds).subscribe({
      next: () => {
        this.router.navigateByUrl('/members');
        this.toast.success('Login successful');
        this.creds = {};
      },
      error: (error) => {
        this.toast.error(error.error);
      },
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
