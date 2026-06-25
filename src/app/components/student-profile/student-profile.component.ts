import { Component, OnInit, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ShowProfileService } from '../../core/services/showprofile.service';
import { CoursesService } from '../../core/services/courses.service';
import { JobsService } from '../../core/services/jobs.service';
import { VolunteersService } from '../../core/services/volunteers.service';
import { WishListService } from '../../core/services/wishlist.service';
import { AuthServiceService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { IstudentProfile } from '../../core/interfaces/istudentprofile';
import { IMyEnrollment } from '../../core/interfaces/enrollment.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { AiService } from '../../core/services/ai.service';

type TabId = 'profile' | 'courses' | 'jobs' | 'volunteers' | 'wishlist' | 'recommendations';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, TranslatePipe, ConfirmDialogComponent],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss'
})
export class StudentProfileComponent implements OnInit {

  // ---------------- top-level page state ----------------
  /** True while we're deciding what to show (role check + initial profile fetch). */
  isLoading = true;
  /** Signed in, but hasn't finished the Complete Profile step yet (or isn't signed in at all). */
  profileIncomplete = false;
  /** True once we know the visitor simply isn't authenticated (vs. authenticated-but-incomplete). */
  isAnonymous = false;
  /** GET /api/Profile/me failed for a reason other than role/auth (network, 404, etc). */
  loadError = false;

  studentData: IstudentProfile | null = null;
  activeTab: TabId = 'profile';

  // ---------------- "Personal Info" tab: basic info (editable) ----------------
  personalForm!: FormGroup;
  isEditingPersonal = false;
  savingPersonal = false;

  // ---------------- "Personal Info" tab: optional/professional info (editable) ----------------
  professionalForm!: FormGroup;
  isEditingProfessional = false;
  savingProfessional = false;

  // ---------------- other tabs ----------------
  enrolledCourses: IMyEnrollment[] = [];
  coursesLoading = true;
  coursesError = false;

  jobApplications: any[] = [];
  jobsLoading = true;
  jobsError = false;

  volunteerWork: any[] = [];
  volunteersLoading = true;
  volunteersError = false;

  wishlist: any[] = [];
  wishlistLoading = true;
  wishlistError = false;

  recommendations: any[] = [];
  recommendationsLoading = false;
  recommendationsError = false;
  recommendationsLoaded = false;

  private readonly profileApi = inject(ShowProfileService);
  private readonly coursesService = inject(CoursesService);
  private readonly jobsService = inject(JobsService);
  private readonly volunteersService = inject(VolunteersService);
  private readonly wishlistService = inject(WishListService);
  private readonly auth = inject(AuthServiceService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmService = inject(ConfirmDialogService);
  private readonly aiService = inject(AiService);

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.buildForms();

    if (!isPlatformBrowser(this.platformId)) {
      // Avoid touching localStorage / firing HTTP calls during SSR.
      this.isLoading = false;
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.isAnonymous = true;
      this.profileIncomplete = true;
      this.isLoading = false;
      return;
    }

    if (!this.auth.hasRole('Student')) {
      // GET /api/Profile/me, my-enrollments, my-applications etc. all
      // require the "Student" role, which is only granted once Complete
      // Profile has been submitted. Calling them anyway would 403 and
      // bounce the user to /unauthorized via the global interceptor, so
      // we short-circuit with a friendly "finish your profile" card
      // instead of letting that happen.
      this.profileIncomplete = true;
      this.isLoading = false;
      return;
    }

    this.loadProfile();
    this.loadEnrolledCourses();
    this.loadJobApplications();
    this.loadVolunteerApplications();
    this.loadWishlist();

    this.route.queryParams.subscribe(params => {
      const tabParam = params['tab'] as TabId;
      if (tabParam) {
        this.activeTab = tabParam;
      }
    });
  }

  /** Builds the link to the Complete Profile form, preserving a way back to this page. */
  get completeProfileUrl(): string {
    return '/profile?returnUrl=' + encodeURIComponent('/student-profile');
  }

  get loginUrl(): string {
    return '/auth/login?returnUrl=' + encodeURIComponent('/student-profile');
  }

  // ---------------- avatar ----------------
  /**
   * Per the design spec: when there's no profile picture (this app has no
   * avatar upload yet), fall back to the first letter of the student's
   * email rather than their name.
   */
  get avatarLetter(): string {
    const source = this.studentData?.email?.trim() || this.studentData?.fullName?.trim() || 'S';
    return source.charAt(0).toUpperCase() || 'S';
  }

  // ---------------- forms ----------------
  private buildForms(): void {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,20}$/)]],
      faculty: ['', [Validators.required, Validators.maxLength(120)]],
      graduationYear: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]],
    });
    this.personalForm.disable();

    // All four are genuinely optional, both in the backend DTO (nullable
    // strings, no [Required]) and per the "show input placeholder to
    // optionally add" requirement - so no Validators.required here.
    this.professionalForm = this.fb.group({
      education: ['', Validators.maxLength(150)],
      skills: ['', Validators.maxLength(500)],
      interests: ['', Validators.maxLength(500)],
      careerGoal: ['', Validators.maxLength(300)],
    });
    this.professionalForm.disable();
  }

  private patchForms(): void {
    if (!this.studentData) return;
    const parts = (this.studentData.fullName || '').trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ');

    this.personalForm.patchValue({
      firstName,
      lastName,
      phone: this.studentData.phone || '',
      faculty: this.studentData.faculty || '',
      graduationYear: this.studentData.graduationYear || '',
    }, { emitEvent: false });

    this.professionalForm.patchValue({
      education: this.studentData.education || '',
      skills: this.studentData.skills || '',
      interests: this.studentData.interests || '',
      careerGoal: this.studentData.careerGoal || '',
    }, { emitEvent: false });
  }

  // ---------------- profile load ----------------
  loadProfile(): void {
    this.isLoading = true;
    this.loadError = false;
    this.profileApi.getMyProfile().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success && res.data) {
          this.studentData = res.data;
          this.patchForms();
        } else {
          this.loadError = true;
        }
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.isLoading = false;
        this.loadError = true;
      }
    });
  }

  // ---------------- basic ("Personal Info") edit / save ----------------
  editPersonal(): void {
    this.isEditingPersonal = true;
    this.personalForm.enable();
  }

  cancelPersonal(): void {
    this.isEditingPersonal = false;
    this.patchForms();
    this.personalForm.disable();
  }

  savePersonal(): void {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }

    const v = this.personalForm.value;
    const fullName = `${(v.firstName || '').trim()} ${(v.lastName || '').trim()}`.trim();

    this.savingPersonal = true;
    this.profileApi.updateBasicInfo({
      fullName,
      phone: (v.phone || '').trim(),
      faculty: (v.faculty || '').trim(),
      graduationYear: (v.graduationYear || '').trim(),
    }).subscribe({
      next: (res) => {
        this.savingPersonal = false;
        if (res?.success && res.data) {
          this.studentData = res.data;
          this.patchForms();
          this.isEditingPersonal = false;
          this.personalForm.disable();
          this.notify.success('Your profile was updated successfully!');
        } else {
          this.notify.error(res?.message || 'Could not update your profile.');
        }
      },
      error: (err) => {
        this.savingPersonal = false;
        this.notify.error(err?.error?.message || 'Could not update your profile. Please try again.');
      }
    });
  }

  // ---------------- optional ("Professional Details") edit / save ----------------
  editProfessional(): void {
    this.isEditingProfessional = true;
    this.professionalForm.enable();
  }

  cancelProfessional(): void {
    this.isEditingProfessional = false;
    this.patchForms();
    this.professionalForm.disable();
  }

  saveProfessional(): void {
    if (this.professionalForm.invalid) {
      this.professionalForm.markAllAsTouched();
      return;
    }

    const v = this.professionalForm.value;
    this.savingProfessional = true;
    this.profileApi.updateProfessionalInfo({
      education: (v.education || '').trim() || null,
      skills: (v.skills || '').trim() || null,
      interests: (v.interests || '').trim() || null,
      careerGoal: (v.careerGoal || '').trim() || null,
    }).subscribe({
      next: (res) => {
        this.savingProfessional = false;
        if (res?.success && res.data) {
          this.studentData = res.data;
          this.patchForms();
          this.isEditingProfessional = false;
          this.professionalForm.disable();
          this.notify.success('Your additional info was saved!');
        } else {
          this.notify.error(res?.message || 'Could not save your info.');
        }
      },
      error: (err) => {
        this.savingProfessional = false;
        this.notify.error(err?.error?.message || 'Could not save your info. Please try again.');
      }
    });
  }

  // ---------------- courses / jobs / volunteers / wishlist ----------------
  loadEnrolledCourses(): void {
    this.coursesLoading = true;
    this.coursesError = false;
    this.coursesService.getMyEnrollments().subscribe({
      next: (res) => {
        this.enrolledCourses = res?.data || [];
        this.coursesLoading = false;
      },
      error: (err) => {
        console.error('Error fetching enrolled courses', err);
        this.coursesError = true;
        this.coursesLoading = false;
      }
    });
  }

  loadJobApplications(): void {
    this.jobsLoading = true;
    this.jobsError = false;
    this.jobsService.getMyApplications().subscribe({
      next: (res) => {
        this.jobApplications = res?.data || [];
        this.jobsLoading = false;
      },
      error: (err) => {
        console.error('Error fetching job applications', err);
        this.jobsError = true;
        this.jobsLoading = false;
      }
    });
  }

  loadVolunteerApplications(): void {
    this.volunteersLoading = true;
    this.volunteersError = false;
    this.volunteersService.getMyApplications().subscribe({
      next: (res) => {
        this.volunteerWork = res?.data || [];
        this.volunteersLoading = false;
      },
      error: (err) => {
        console.error('Error fetching volunteer applications', err);
        this.volunteersError = true;
        this.volunteersLoading = false;
      }
    });
  }

  loadWishlist(): void {
    this.wishlistLoading = true;
    this.wishlistError = false;
    this.wishlistService.userWishlist().subscribe({
      next: (res) => {
        // GET /api/Wishlist returns the raw array directly (unlike the
        // other endpoints used on this page, which wrap their payload in
        // { success, data, message }) - handle both shapes defensively.
        this.wishlist = Array.isArray(res) ? res : (res?.data || []);
        this.wishlistLoading = false;
      },
      error: (err) => {
        console.error('Error fetching wishlist', err);
        this.wishlistError = true;
        this.wishlistLoading = false;
      }
    });
  }

  retryAll(): void {
    this.loadProfile();
    this.loadEnrolledCourses();
    this.loadJobApplications();
    this.loadVolunteerApplications();
    this.loadWishlist();
    if (this.activeTab === 'recommendations') this.loadRecommendations();
  }

  loadRecommendations(): void {
    if (this.recommendationsLoaded) return;
    this.recommendationsLoading = true;
    this.recommendationsError = false;
    this.aiService.getRecommendations().subscribe({
      next: (res) => {
        this.recommendations = res?.data || [];
        this.recommendationsLoading = false;
        this.recommendationsLoaded = true;
      },
      error: (err) => {
        console.error('Error fetching AI recommendations', err);
        this.recommendationsError = true;
        this.recommendationsLoading = false;
      }
    });
  }

  // ---------------- cancel methods ----------------
  async cancelCourse(courseId: number): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Cancel Course',
      message: 'Are you sure you want to cancel this course enrollment?',
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Keep it',
      variant: 'danger'
    });

    if (confirmed) {
      this.coursesService.cancelEnrollment(courseId).subscribe({
        next: (res) => {
          this.notify.success('Course enrollment cancelled successfully.');
          this.loadEnrolledCourses();
        },
        error: (err) => {
          this.notify.error('Could not cancel course enrollment.');
        }
      });
    }
  }

  async cancelJob(applicationId: number): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Cancel Job Application',
      message: 'Are you sure you want to cancel this job application?',
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Keep it',
      variant: 'danger'
    });

    if (confirmed) {
      this.jobsService.cancelApplication(applicationId).subscribe({
        next: (res) => {
          this.notify.success('Job application cancelled successfully.');
          this.loadJobApplications();
        },
        error: (err) => {
          this.notify.error('Could not cancel job application.');
        }
      });
    }
  }

  async cancelVolunteer(applicationId: number): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: 'Cancel Volunteer Application',
      message: 'Are you sure you want to cancel this volunteer application?',
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Keep it',
      variant: 'danger'
    });

    if (confirmed) {
      this.volunteersService.cancelApplication(applicationId).subscribe({
        next: (res) => {
          this.notify.success('Volunteer application cancelled successfully.');
          this.loadVolunteerApplications();
        },
        error: (err) => {
          this.notify.error('Could not cancel volunteer application.');
        }
      });
    }
  }

  // ---------------- template helpers ----------------
  setTab(tab: TabId): void {
    this.activeTab = tab;
    if (tab === 'recommendations' && !this.recommendationsLoaded) {
      this.loadRecommendations();
    }
  }

  goToCourses(): void {
    this.router.navigate(['/courses']);
  }

  /** Normalizes the backend's raw enum text (including its "Aproved" typo) into a display label. */
  statusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'Aproved': return 'Approved';
      case 'Rejected': return 'Rejected';
      case 'Completed': return 'Completed';
      case 'Pending': return 'Pending';
      default: return status || 'Pending';
    }
  }

  statusBadgeClass(status: string | null | undefined): string {
    switch (status) {
      case 'Approved': return 'bg-success text-white';
      case 'Rejected': return 'bg-danger text-white';
      case 'Completed': return 'bg-info text-dark';
      case 'Pending': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }
}
