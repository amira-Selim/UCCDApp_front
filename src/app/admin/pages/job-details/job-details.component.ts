import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JobsAdminService } from '../../../core/services/admin/jobs-admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IJobOpportunity, IJobApplication } from '../../../core/interfaces/job.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private jobsService = inject(JobsAdminService);
  private notify = inject(NotificationService);

  loading = signal(true);
  applicationsLoading = signal(true);

  job = signal<IJobOpportunity | null>(null);
  applications = signal<IJobApplication[]>([]);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadJobDetails(+idParam);
      this.loadApplications(+idParam);
    }
  }

  loadJobDetails(id: number): void {
    this.jobsService.getAllForAdmin().subscribe({
      next: (res) => {
        const found = res.data?.find(j => j.id === id);
        this.job.set(found || null);
        this.loading.set(false);
      },
      error: () => {
        this.notify.error('Failed to load job details.');
        this.loading.set(false);
      }
    });
  }

  loadApplications(id: number): void {
    this.jobsService.getApplications(id).subscribe({
      next: (res) => {
        this.applications.set(res.data ?? []);
        this.applicationsLoading.set(false);
      },
      error: () => {
        this.notify.error('Failed to load applications.');
        this.applicationsLoading.set(false);
      }
    });
  }
}
