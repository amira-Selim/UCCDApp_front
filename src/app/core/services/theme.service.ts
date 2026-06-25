import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

/**
 * Centralized theme service (Light / Dark).
 *
 * Applies the theme globally by setting `data-theme="dark"|"light"` on
 * `<html>` - the actual visual styling lives entirely in global CSS
 * variables in `styles.scss` (see the `[data-theme="dark"]` block there),
 * so every page in the app (Home, Courses, Student Profile, Wishlist,
 * Volunteering, Jobs, Admin Dashboard, Contact Us, ...) picks up the
 * theme automatically with zero per-page changes.
 *
 * Persists the choice in localStorage so it survives a full page reload.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<AppTheme>('light');

  constructor(@Inject(DOCUMENT) private document: Document, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
      const initial: AppTheme = saved === 'dark' || saved === 'light' ? saved : 'light';
      this.theme.set(initial);
      this.applyTheme(initial);
    }
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
  }
}
