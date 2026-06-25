import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ContactService } from '../../core/services/contact.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LanguageService } from '../../core/services/language.service';
import { TRANSLATIONS } from '../../core/i18n/translations';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  private readonly _contactService = inject(ContactService);
  private readonly _lang = inject(LanguageService);

  isLoading: boolean = false;
  msgError: string = '';
  msgSuccess: string = '';

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    issue: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor(private fb: FormBuilder) {}

  submit(): void {
    this.msgError = '';
    this.msgSuccess = '';

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const v = this.contactForm.value;
    // The backend's CreateMessageDto expects { name, email, issueType, content } -
    // map the form's "issue"/"message" fields to the names it actually binds to.
    this._contactService.submit({
      name: (v.name || '').trim(),
      email: (v.email || '').trim(),
      issueType: v.issue || '',
      content: (v.message || '').trim(),
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.msgSuccess = this._lang.current() === 'ar' ? TRANSLATIONS['contact.success'].ar : TRANSLATIONS['contact.success'].en;
        this.contactForm.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.msgError = err?.error?.message || err?.error?.title || 'Could not send your message. Please try again.';
      }
    });
  }
}
