import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobsService, IJob } from '../../core/services/jobs.service';
import { AiService } from '../../core/services/ai.service';
import { AuthServiceService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.scss'
})
export class JobsComponent implements OnInit {

  private readonly _JobsService = inject(JobsService);
  private readonly route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _aiService = inject(AiService);
  readonly auth = inject(AuthServiceService);

  jobsList: IJob[] = [];
  filteredJobs: IJob[] = [];
  recommendedJobs: IJob[] = [];
  appliedJobIds: Set<number> = new Set<number>();
  isAiLoading: boolean = false;
  
  // Filtering states
  searchTerm: string = '';
  selectedType: string = 'All';
  jobTypes: string[] = ['All', 'FullTime', 'PartTime', 'Internship', 'Freelance'];

  // Modal state
  selectedJob: IJob | null = null;
  isModalOpen: boolean = false;
  coverLetter: string = '';
  cvFile: File | null = null;
  isApplying: boolean = false;
  isGeneratingAi: boolean = false;

  // Custom Toast state
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showToast: boolean = false;

  displayToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && this.auth.hasRole('Student')) {
      // Fetch user applications first
      this._JobsService.getMyApplications().subscribe({
        next: (res) => {
          const apps = res.data || res;
          if (Array.isArray(apps)) {
            apps.forEach((a: any) => this.appliedJobIds.add(a.jobOpportunityId));
          }
          this.fetchJobs();
        },
        error: (err) => {
          console.error('Failed to load applications', err);
          this.fetchJobs();
        }
      });
    } else {
      this.fetchJobs();
    }
  }

  fetchRecommendations(): void {
    if (!this.auth.isLoggedIn() || !this.auth.hasRole('Student')) return;
    
    this.isAiLoading = true;
    this._aiService.getRecommendations().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recommendedJobs = res.data;
        }
        this.isAiLoading = false;
      },
      error: (err) => {
        console.error('Failed to load job recommendations', err);
        this.isAiLoading = false;
      }
    });
  }

  fetchJobs(): void {
    this._JobsService.getAllJobs().subscribe({
      next: (res) => {
        this.jobsList = res;
        this.applyFilters();
        this.checkQueryParams();
        this.fetchRecommendations();
      },
      error: (err) => {
        console.error(err);
        // Fallback mock data if API fails
        this.jobsList = [
          { id: 1, title: 'Frontend Developer', companyName: 'TechNova', location: 'Cairo', description: 'Angular developer needed...', requirements: '2+ years exp', type: 'FullTime', postedDate: new Date().toISOString() },
          { id: 2, title: 'UI/UX Designer', companyName: 'Creative Minds', location: 'Remote', description: 'Design beautiful interfaces...', requirements: 'Figma master', type: 'Freelance', postedDate: new Date().toISOString() }
        ];
        this.applyFilters();
      }
    });
  }

  checkQueryParams(): void {
    const openTitle = this.route.snapshot.queryParamMap.get('openTitle');
    if (openTitle) {
      const job = this.jobsList.find(j => j.title === openTitle);
      if (job) {
        this.openJobDetails(job);
      }
    }
  }

  applyFilters(): void {
    let filtered = this.jobsList;

    if (this.selectedType !== 'All') {
      filtered = filtered.filter(j => j.type === this.selectedType);
    }

    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(term) || 
        j.companyName.toLowerCase().includes(term) ||
        j.location.toLowerCase().includes(term)
      );
    }

    this.filteredJobs = filtered;
  }

  setType(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  openJobDetails(job: IJob): void {
    if (!this.auth.isLoggedIn()) {
      this.displayToast('Please sign in to view and apply for this job.', 'error');
      this._router.navigate(['/auth/login'], { queryParams: { returnUrl: '/jobs' } });
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
          this._router.navigate(['/profile'], { queryParams: { returnUrl: '/jobs' } });
        }
      });
      return;
    }

    this.selectedJob = job;
    this.coverLetter = '';
    this.cvFile = null;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    setTimeout(() => {
      this.selectedJob = null;
    }, 300);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.cvFile = file;
    }
  }

  submitApplication(): void {
    if (!this.selectedJob || !this.cvFile) return;
    
    this.isApplying = true;
    this._JobsService.applyForJob(this.selectedJob.id, this.coverLetter, this.cvFile).subscribe({
      next: () => {
        this.displayToast('Application submitted successfully!', 'success');
        this.appliedJobIds.add(this.selectedJob!.id);
        this.isApplying = false;
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
        if (err.error && err.error.message) {
          this.displayToast(err.error.message, 'error');
        } else {
          this.displayToast('Failed to submit application. Please try again.', 'error');
        }
        this.isApplying = false;
        this.closeModal();
      }
    });
  }

  generateAiCoverLetter(): void {
    if (!this.selectedJob) return;

    this.isGeneratingAi = true;
    this._aiService.generateCoverLetter(this.selectedJob.id).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.resultText) {
          this.coverLetter = res.data.resultText;
          this.displayToast('Cover letter generated! Feel free to edit it.', 'success');
        }
        this.isGeneratingAi = false;
      },
      error: (err) => {
        console.error(err);
        this.displayToast('Failed to generate cover letter. Try again.', 'error');
        this.isGeneratingAi = false;
      }
    });
  }
}
