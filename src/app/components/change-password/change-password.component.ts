import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private readonly _AuthServiceService = inject(AuthServiceService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _router = inject(Router);

  msgError: string = "";
  msgSuccess: string = "";
  isLoading: boolean = false;

  changePasswordForm: FormGroup = this._formBuilder.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)]]
  });

  submitForm(): void {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      this._AuthServiceService.changePassword(this.changePasswordForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            this.msgSuccess = res.message || "Password changed successfully!";
            this.msgError = "";
            // Clear requirePasswordChange from local storage and signal
            const token = this._AuthServiceService.getToken() || '';
            const fullName = this._AuthServiceService.currentUser()?.fullName;
            this._AuthServiceService.persistSession(token, fullName, false);
            
            setTimeout(() => {
              if (this._AuthServiceService.isAdmin()) {
                this._router.navigate(['/admin/dashboard']);
              } else {
                this._router.navigate(['/home']);
              }
            }, 1500);
          }
          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.msgError = err.error?.message || "An error occurred.";
          this.msgSuccess = "";
          this.isLoading = false;
        }
      });
    }
  }
}
