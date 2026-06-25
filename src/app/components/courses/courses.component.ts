import { Component, inject, OnInit } from '@angular/core';
import { CoursesService } from '../../core/services/courses.service';
import { WishlistStateService } from '../../core/services/wishlist-state.service';
import Swal from 'sweetalert2';
import { Icources } from '../../core/interfaces/icources';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AiService } from '../../core/services/ai.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {

  private readonly _CoursesServiceh = inject(CoursesService);
  readonly wishlistState = inject(WishlistStateService);
  readonly auth = inject(AuthServiceService);
  private readonly _notify = inject(NotificationService);
  private readonly _router = inject(Router);
  private readonly _aiService = inject(AiService);

  coursesList: Icources[] = [];
  filteredCourses: Icources[] = [];
  recommendedCourses: Icources[] = [];
  enrolledCourseIds: Set<number> = new Set<number>();
  
  searchTerm: string = '';
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Training', 'Advising', 'Workshop']; // Mock categories for UI
  
  // AI State
  isAiLoading: boolean = false;
  selectedCourse: Icources | null = null;
  isModalOpen: boolean = false;

  /** Course id currently being enrolled in, used to disable the button & show a spinner while the request is in flight. */
  enrollingCourseId: number | null = null;

  // AI Modal State
  isAiModalOpen: boolean = false;
  isGeneratingAi: boolean = false;
  aiField: string = '';
  aiGoal: string = '';
  aiLevel: string = 'Beginner';
  showAiResults: boolean = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && this.auth.hasRole('Student')) {
      this._CoursesServiceh.getMyEnrollments().subscribe({
        next: (res) => {
          if (res?.success) {
            (res.data || []).forEach((e: any) => this.enrolledCourseIds.add(e.courseId));
          }
          this.fetchCourses();
        },
        error: () => this.fetchCourses()
      });
      // Add 'Recommended' category for students
      this.categories.push('Recommended');
    } else {
      this.fetchCourses();
    }

    // Loads the student's wishlist once so every heart icon on this page
    // renders in the correct state immediately (red if already saved).
    this.wishlistState.ensureLoaded();
  }

  fetchCourses(): void {
    this._CoursesServiceh.getAllcources().subscribe({
      next: (res) => {
        this.coursesList = res;
        this.applyFilters();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    if (this.selectedCategory === 'Recommended') {
      let filtered = this.recommendedCourses;
      if (this.searchTerm.trim() !== '') {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(term) || 
          (c.type && c.type.toLowerCase().includes(term))
        );
      }
      this.filteredCourses = filtered;
      return;
    }

    let filtered = this.coursesList;

    if (this.selectedCategory !== 'All') {
      let filterValue = this.selectedCategory;
      if (filterValue === 'Workshop') filterValue = 'WorksShop';
      filtered = filtered.filter(c => c.type === filterValue);
    }

    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) || 
        (c.type && c.type.toLowerCase().includes(term))
      );
    }

    this.filteredCourses = filtered;
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
    
    if (cat === 'Recommended' && this.recommendedCourses.length === 0 && !this.isAiLoading) {
      this.isAiLoading = true;
      this._aiService.getCourseRecommendations({ fieldOfInterest: '', careerGoal: '', currentLevel: 'Beginner' }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.recommendedCourses = res.data;
          }
          this.isAiLoading = false;
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to get course recommendations', err);
          this.isAiLoading = false;
          this.applyFilters();
        }
      });
    } else {
      this.applyFilters();
    }
  }

  isWishlisted(courseId: number | undefined | null): boolean {
    return this.wishlistState.isWishlisted(courseId);
  }

  /** Toggles wishlist membership with an instant (optimistic) heart-icon flip; see WishlistStateService for rollback-on-error handling. */
  addToWishlist(id: number | undefined | null, event?: Event, courseName?: string): void {
    if (event) {
      event.stopPropagation(); // Prevent modal from opening if clicked on card
    }
    this.wishlistState.toggle(id, courseName);
  }

  /**
   * Enrolls the signed-in student in a course.
   *
   * Gating, in order:
   *  1. Not signed in at all -> send to login (preserving a way back here).
   *  2. Signed in but hasn't finished Complete Profile yet (no "Student"
   *     role) -> send to the Complete Profile form (preserving a way back
   *     here too), since the backend itself would otherwise just reject
   *     the enroll call with an explanatory message and no Student record
   *     to enroll.
   *  3. Otherwise, call the real enroll endpoint. The backend remains the
   *     authoritative check (e.g. a stale/cached role), so its own
   *     success:false response is still surfaced if it ever disagrees.
   */
  enrollCourse(id: number | undefined | null, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!id) {
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this._notify.info('Please sign in to enroll in this course.');
      this._router.navigate(['/auth/login'], { queryParams: { returnUrl: '/courses' } });
      return;
    }

    if (!this.auth.hasRole('Student')) {
      Swal.fire({
        title: 'Complete Profile',
        text: 'Please complete your profile to proceed. It only takes a minute!',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Complete Now',
        cancelButtonText: 'Later',
        background: 'var(--bs-body-bg)',
        color: 'var(--bs-body-color)',
        customClass: {
          popup: 'rounded-4 shadow-lg border-0',
          title: 'fs-4 fw-bold font-heading',
          confirmButton: 'btn btn-main px-4 py-2 rounded-pill fw-medium',
          cancelButton: 'btn btn-secondary px-4 py-2 rounded-pill ms-2 fw-medium'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed) {
          this._router.navigate(['/profile'], { queryParams: { returnUrl: '/courses' } });
        }
      });
      return;
    }

    if (this.enrollingCourseId !== null) {
      return; // an enrollment request is already in flight
    }

    this.enrollingCourseId = id;
    this._CoursesServiceh.enrollInCourse(id).subscribe({
      next: (res) => {
        this.enrollingCourseId = null;
        if (res?.success) {
          this._notify.success(res.message || 'You have been enrolled successfully!');
          if (id !== undefined && id !== null) {
            this.enrolledCourseIds.add(id);
          }
          this.closeModal();
        } else {
          this._notify.error(res?.message || 'Could not enroll in this course.');
        }
      },
      error: (err) => {
        this.enrollingCourseId = null;
        this._notify.error(err?.error?.message || 'Could not enroll in this course. Please try again.');
      }
    });
  }

  openCourseDetails(course: Icources): void {
    this.selectedCourse = course;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    setTimeout(() => {
      this.selectedCourse = null;
    }, 300); // Wait for transition
  }

  openAiModal(): void {
    if (!this.auth.isLoggedIn()) {
      this._notify.info('Please sign in to get recommendations.');
      this._router.navigate(['/auth/login'], { queryParams: { returnUrl: '/courses' } });
      return;
    }
    
    if (!this.auth.hasRole('Student')) {
      this._notify.info('Only students can get AI recommendations. Please complete your profile.');
      return;
    }

    this.aiField = '';
    this.aiGoal = '';
    this.aiLevel = 'Beginner';
    this.showAiResults = false;
    this.recommendedCourses = [];
    this.isAiModalOpen = true;
  }

  closeAiModal(): void {
    this.isAiModalOpen = false;
  }

  submitAiForm(): void {
    this.isGeneratingAi = true;
    const request = {
      fieldOfInterest: this.aiField,
      careerGoal: this.aiGoal,
      currentLevel: this.aiLevel
    };

    this._aiService.getCourseRecommendations(request).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recommendedCourses = res.data;
          this.showAiResults = true;
        }
        this.isGeneratingAi = false;
      },
      error: (err) => {
        console.error('Failed to get course recommendations', err);
        this._notify.error('Failed to get recommendations from AI.');
        this.isGeneratingAi = false;
      }
    });
  }
}
