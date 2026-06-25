import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private readonly _ProfileService = inject(ProfileService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _authService = inject(AuthServiceService);
  private readonly _notify = inject(NotificationService);

  msgError: string = "";
  isLoading: boolean = false;

  // تأكدي من تطابق أسماء الحقول هنا مع ما هو موجود في الـ HTML (Case-sensitive)
  profileForm: FormGroup = this._formBuilder.group({
    NationalID: [null, [Validators.required, Validators.pattern(/^[0-9]{14}$/)]],
    Faculty: [null, [Validators.required]],
    GraduationYear: [null, [Validators.required, Validators.min(2000)]],
    Gender: [null, [Validators.required]]
  });

 profileSubmit(): void {
  if (this.profileForm.valid) {
    this.isLoading = true;
    this.msgError = "";

    // جرب إرسال البيانات مباشرة بدون 'dto' إذا كان السيرفر يتوقعها هكذا
    // وإذا ظل الخطأ، جرب إرسالها داخل 'dto' ولكن بأسماء الحقول الصحيحة
    const requestBody = {
      NationalID: this.profileForm.value.NationalID,
      Faculty: this.profileForm.value.Faculty,
      GraduationYear: this.profileForm.value.GraduationYear.toString(),
      Gender: this.profileForm.value.Gender
    };

    this._ProfileService.completeProfile(requestBody).subscribe({
      next: (res) => {
        this.isLoading = false;
        const token = res?.data?.token || res?.token;
        const fullName = res?.data?.fullName || res?.fullName;

        if (!token) {
          this.msgError = "حدث خطأ في البيانات";
          return;
        }

        // Refresh the in-memory auth signal (roles included) immediately,
        // instead of only writing localStorage, so checks like
        // auth.hasRole('Student') reflect the new "Student" role right
        // away - without this, anything gating on the role (e.g. course
        // enrollment) would stay blocked until a manual page refresh.
        this._authService.persistSession(token, fullName);
        this._notify.success(res?.message === 'Profile already completed'
          ? 'Your profile is already complete.'
          : 'Profile completed successfully!');

        const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl');
        this._router.navigateByUrl(returnUrl || '/home');
      },
      error: (err: HttpErrorResponse) => {
        console.error("الخطأ:", err.error);
        this.msgError = err?.error?.message || "حدث خطأ في البيانات";
        this.isLoading = false;
      }
    });
  }
}
}