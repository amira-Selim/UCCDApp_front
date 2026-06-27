import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JobsAdminService } from '../../../core/services/admin/jobs-admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IJobOpportunity, IJobApplication } from '../../../core/interfaces/job.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/environments/environment';

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

  private http = inject(HttpClient);
  selectedProfile = signal<any>(null);
  profileLoading = signal(false);
  showProfileModal = signal(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadJobDetails(+idParam);
      this.loadApplications(+idParam);
    }
  }

  loadJobDetails(id: number): void {
    this.jobsService.getJobById(id).subscribe({
      next: (res) => {
        this.job.set(res.data || null);
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

  viewApplicantProfile(studentId: number): void {
    this.selectedProfile.set(null);
    this.showProfileModal.set(true);
    this.profileLoading.set(true);
    this.http.get(`${environment.baseUrl}/api/Profile/applicant/${studentId}`).subscribe({
      next: (res: any) => {
        this.selectedProfile.set(res.data);
        this.profileLoading.set(false);
      },
      error: () => {
        this.notify.error('Failed to load applicant profile.');
        this.profileLoading.set(false);
      }
    });
  }

  closeProfileModal(): void {
    this.showProfileModal.set(false);
  }

  getFullUrl(path: string | undefined): string {
    if (!path) return '#';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${environment.baseUrl}${path}`;
    return `${environment.baseUrl}/${path}`;
  }
}
