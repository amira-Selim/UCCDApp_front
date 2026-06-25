import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthServiceService } from '../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthServiceService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  email: string | null = null;
  token: string | null = null;

  resetForm: FormGroup = this._formBuilder.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  ngOnInit() {
    this._route.queryParams.subscribe(params => {
      this.email = params['email'];
      this.token = params['token'];
      
      if (!this.email || !this.token) {
        this.errorMessage = 'Invalid reset link. Missing email or token.';
      }
    });
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.email || !this.token) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    };

    this._authService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Password has been reset successfully. Redirecting to login...';
        this.resetForm.reset();
        
        setTimeout(() => {
          this._router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'An error occurred while resetting the password.';
      }
    });
  }
}
