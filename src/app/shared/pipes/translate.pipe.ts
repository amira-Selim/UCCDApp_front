import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { TRANSLATIONS } from '../../core/i18n/translations';

/**
 * Usage: `{{ 'sidebar.home' | translate }}`
 *
 * Impure so it re-evaluates whenever `LanguageService.current` changes
 * (a plain signal read isn't itself a template binding Angular tracks for
 * pipes, so marking the pipe impure keeps it correctly reactive across
 * the whole app without needing a wrapper observable per component).
 * Falls back to the raw key if no translation exists, so missing entries
 * are visible/obvious during development rather than rendering blank.
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private readonly lang = inject(LanguageService);

  transform(key: string | null | undefined): string {
    if (!key) return '';
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return this.lang.current() === 'ar' ? entry.ar : entry.en;
  }
}
