import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthServiceService);
  private readonly _router = inject(Router);

  forgotForm: FormGroup = this._formBuilder.group({
    email: [null, [Validators.required, Validators.email]]
  });

  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this._authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        // The backend always returns success for privacy reasons
        this.successMessage = res.message || 'If your email is registered, you will receive a reset password link shortly.';
        this.forgotForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'An error occurred. Please try again later.';
      }
    });
  }
}
