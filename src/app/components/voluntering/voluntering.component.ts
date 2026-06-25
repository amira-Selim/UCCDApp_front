import { Component, inject, OnInit } from '@angular/core';
import { VolunteersService } from '../../core/services/volunteers.service';
import { IVolunteerOpportunity } from '../../core/interfaces/volunteer.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-voluntering',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './voluntering.component.html',
  styleUrl: './voluntering.component.scss'
})
export class VolunteringComponent implements OnInit {

  private readonly _VolunteersService = inject(VolunteersService);
  readonly auth = inject(AuthServiceService);
  private readonly _notify = inject(NotificationService);
  private readonly _router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  volunteerList: IVolunteerOpportunity[] = [];
  filteredVolunteers: IVolunteerOpportunity[] = [];
  appliedVolunteerIds: Set<number> = new Set<number>();

  isLoading: boolean = true;
  loadError: boolean = false;

  // Filtering states
  searchTerm: string = '';

  // Modal state
  selectedVolunteer: IVolunteerOpportunity | null = null;
  isModalOpen: boolean = false;
  motivationText: string = '';
  skillsText: string = '';
  isApplying: boolean = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && this.auth.hasRole('Student')) {
      this._VolunteersService.getMyApplications().subscribe({
        next: (res) => {
          if (res?.success) {
            (res.data || []).forEach(a => this.appliedVolunteerIds.add(a.opportunityId));
          }
          this.loadOpportunities();
        },
        error: () => this.loadOpportunities()
      });
    } else {
      this.loadOpportunities();
    }
  }

  loadOpportunities(): void {
    this.isLoading = true;
    this.loadError = false;
    // Only ever-active opportunities are relevant to students; admins can
    // still see inactive/closed ones from their own admin list.
    this._VolunteersService.getAllVolunteers(true).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success) {
          this.volunteerList = res.data || [];
          this.applyFilters();
          this.checkQueryParams();
        } else {
          this.loadError = true;
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.loadError = true;
      }
    });
  }

  checkQueryParams(): void {
    const openTitle = this.route.snapshot.queryParamMap.get('openTitle');
    if (openTitle) {
      const opp = this.volunteerList.find(o => o.title === openTitle);
      if (opp) {
        this.openVolunteerDetails(opp);
      }
    }
  }

  applyFilters(): void {
    let filtered = this.volunteerList;

    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(term) ||
        v.committee.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term)
      );
    }

    this.filteredVolunteers = filtered;
  }

  openVolunteerDetails(volunteer: IVolunteerOpportunity): void {
    if (!this.auth.isLoggedIn()) {
      this._notify.info('Please sign in to apply for this opportunity.');
      this._router.navigate(['/auth/login'], { queryParams: { returnUrl: '/volunteering' } });
      return;
    }

    if (!this.auth.hasRole('Student') && !this.auth.isAdmin()) {
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
          this._router.navigate(['/profile'], { queryParams: { returnUrl: '/volunteering' } });
        }
      });
      return;
    }

    this.selectedVolunteer = volunteer;
    this.motivationText = '';
    this.skillsText = '';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    setTimeout(() => {
      this.selectedVolunteer = null;
    }, 300);
  }

  /** Remaining open spots for an opportunity, never negative. */
  remainingSpots(volunteer: IVolunteerOpportunity): number {
    return Math.max(volunteer.requiredCount - volunteer.currentApprovedCount, 0);
  }

  submitApplication(): void {
    if (!this.selectedVolunteer || this.motivationText.trim() === '') return;

    this.isApplying = true;
    this._VolunteersService.applyForVolunteer(this.selectedVolunteer.id, this.motivationText.trim(), this.skillsText.trim()).subscribe({
      next: (res) => {
        this.isApplying = false;
        if (res?.success) {
          this._notify.success(res.message || 'Your application has been submitted!');
          this.appliedVolunteerIds.add(this.selectedVolunteer!.id);
          this.closeModal();
        } else {
          this._notify.error(res?.message || 'Could not submit your application.');
        }
      },
      error: (err) => {
        this.isApplying = false;
        this._notify.error(err?.error?.message || 'Could not submit your application. Please try again.');
      }
    });
  }
}
