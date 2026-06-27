import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompaniesService } from '../../../../core/services/admin/companies.service';
import { IJobOpportunity } from '../../../../core/interfaces/job.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-company-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './company-jobs.component.html'
})
export class CompanyJobsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private companiesService = inject(CompaniesService);
  private notify = inject(NotificationService);

  companyEmail = '';
  companyName = '';
  jobs: IJobOpportunity[] = [];
  isLoading = false;

  showRejectModal = false;
  selectedJobId: number | null = null;
  rejectionReason = '';
  isSubmitting = false;

  ngOnInit(): void {
    this.companyEmail = this.route.snapshot.paramMap.get('email') || '';
    this.companyName = this.route.snapshot.queryParamMap.get('name') || this.companyEmail;
    if (this.companyEmail) {
      this.loadCompanyJobs();
    }
  }

  loadCompanyJobs(): void {
    this.isLoading = true;
    this.companiesService.getCompanyJobs(this.companyEmail).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.jobs = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.notify.error('Failed to load company jobs.');
        this.isLoading = false;
      }
    });
  }

  approveJob(jobId: number): void {
    if (confirm('Are you sure you want to approve this job? It will be visible to students immediately.')) {
      this.companiesService.approveJob(jobId).subscribe({
        next: (res) => {
          if (res.success) {
            this.notify.success('Job approved successfully');
            this.loadCompanyJobs();
          } else {
            this.notify.error(res.message || 'Failed to approve job');
          }
        },
        error: () => this.notify.error('Error approving job')
      });
    }
  }

  openRejectModal(jobId: number): void {
    this.selectedJobId = jobId;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedJobId = null;
  }

  submitRejection(): void {
    if (!this.rejectionReason.trim()) {
      this.notify.error('Please provide a reason for rejection.');
      return;
    }
    if (!this.selectedJobId) return;

    this.isSubmitting = true;
    this.companiesService.rejectJob(this.selectedJobId, this.rejectionReason).subscribe({
      next: (res) => {
        if (res.success) {
          this.notify.success('Job rejected successfully');
          this.closeRejectModal();
          this.loadCompanyJobs();
        } else {
          this.notify.error(res.message || 'Failed to reject job');
        }
        this.isSubmitting = false;
      },
      error: () => {
        this.notify.error('Error rejecting job');
        this.isSubmitting = false;
      }
    });
  }
}
