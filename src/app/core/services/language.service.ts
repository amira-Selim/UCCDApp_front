import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type AppLanguage = 'en' | 'ar';

const STORAGE_KEY = 'app-language';

/**
 * Centralized language service (English / Arabic).
 *
 * Sets `lang` and `dir` ("ltr" | "rtl") on `<html>` so the whole document
 * - native form controls, text direction, scrollbars, etc. - switches
 * direction the standard, browser-native way the moment Arabic is
 * selected. Components read the current language via `current()` and
 * translate strings with the `translate` pipe (see `translate.pipe.ts`),
 * which is the reusable building block other pages/components use.
 *
 * Persists the choice in localStorage so it survives a full page reload.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly current = signal<AppLanguage>('en');

  constructor(@Inject(DOCUMENT) private document: Document, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
      const initial: AppLanguage = saved === 'ar' || saved === 'en' ? saved : 'en';
      this.current.set(initial);
      this.applyLanguage(initial);
    }
  }

  setLanguage(lang: AppLanguage): void {
    this.current.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, lang);
    }
    this.applyLanguage(lang);
  }

  toggleLanguage(): void {
    this.setLanguage(this.current() === 'ar' ? 'en' : 'ar');
  }

  isRtl(): boolean {
    return this.current() === 'ar';
  }

  private applyLanguage(lang: AppLanguage): void {
    this.document.documentElement.setAttribute('lang', lang);
    this.document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }
}
