import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthServiceService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { LanguageService, AppLanguage } from '../core/services/language.service';
import { WishlistStateService } from '../core/services/wishlist-state.service';
import { TranslatePipe } from '../shared/pipes/translate.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly auth = inject(AuthServiceService);
  readonly theme = inject(ThemeService);
  readonly lang = inject(LanguageService);
  private readonly _wishlistState = inject(WishlistStateService);

  setTheme(mode: 'light' | 'dark'): void {
    this.theme.setTheme(mode);
  }

  setLanguage(lang: AppLanguage): void {
    this.lang.setLanguage(lang);
  }

  signOut(): void {
    this._wishlistState.clear();
    this.auth.logout();
  }
}
