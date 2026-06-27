import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { JobsAdminService } from '../../../core/services/admin/jobs-admin.service';
import { AuthServiceService } from '../../../core/services/auth.service';
import { IJobApplication, IJobOpportunity } from '../../../core/interfaces/job.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/components/data-table/table-column.model';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-jobs-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './jobs-list.component.html',
  styleUrl: './jobs-list.component.scss'
})
export class JobsListComponent implements OnInit {
  private readonly jobsService = inject(JobsAdminService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  public readonly auth = inject(AuthServiceService);

  jobs = signal<IJobOpportunity[]>([]);
  jobTypes: string[] = ['FullTime', 'PartTime', 'Internship', 'Freelance'];
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  showForm = signal(false);
  
  // Modals state
  showDeactivateModal = signal(false);
  selectedJobId = signal<number | null>(null);
  deactivateReasonCtrl = new FormControl('', Validators.required);

  showDeleteModal = signal(false);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '60px' },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'companyName', label: 'Company', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'targetFaculty', label: 'Target Faculty', sortable: true },
    { key: 'statusText', label: 'Status', sortable: true, type: 'badge', badgeMap: { 'Pending': 'bg-warning text-dark', 'Approved': 'bg-success', 'Rejected': 'bg-danger' } },
    { key: 'totalApplicants', label: 'Applicants', sortable: true, width: '100px' },
    { key: 'deadline', label: 'Deadline', sortable: true, type: 'date' },
  ];

  jobForm = this.fb.group({
    title: ['', [Validators.required]],
    companyName: ['', [Validators.required]],
    companyEmail: ['', [Validators.required, Validators.email]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    requirements: ['', [Validators.required]],
    location: ['', [Validators.required]],
    type: ['', [Validators.required]],
    salaryRange: [null as number | null],
    targetFaculty: ['', [Validators.required]],
    deadline: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading.set(true);
    this.error.set(null);
    
    const obs$ = this.auth.isCompany() ? this.jobsService.getCompanyJobs() : this.jobsService.getAllForAdmin();
    
    obs$.subscribe({
      next: (res) => {
        const mappedData = (res.data ?? []).map((j: any) => ({
          ...j,
          statusText: j.status === 1 ? 'Approved' : j.status === 2 ? 'Rejected' : 'Pending'
        }));
        this.jobs.set(mappedData);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load job opportunities.');
        this.loading.set(false);
        this.notify.error('Failed to load job opportunities.');
      }
    });
  }

  openCreateForm(): void {
    this.jobForm.reset();
    if (this.auth.isCompany()) {
      // Auto-fill company details for logged in company
      const currentUser = this.auth.currentUser();
      this.jobForm.patchValue({
        companyName: currentUser?.fullName || '',
        companyEmail: currentUser?.email || ''
      });
    }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  submitForm(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.jobForm.getRawValue();

    const createDto = {
      title: value.title!,
      companyName: value.companyName!,
      companyEmail: value.companyEmail!,
      description: value.description!,
      requirements: value.requirements!,
      location: value.location!,
      type: value.type!,
      salaryRange: value.salaryRange ? Number(value.salaryRange) : null,
      targetFaculty: value.targetFaculty!,
      deadline: value.deadline ? new Date(value.deadline as string).toISOString() : null,
    };

    const createObs$ = this.auth.isCompany() ? this.jobsService.createByCompany(createDto) : this.jobsService.create(createDto);

    createObs$.subscribe({
      next: () => {
        this.notify.success('Job opportunity created successfully.');
        this.saving.set(false);
        this.closeForm();
        this.loadJobs();
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err?.error?.message || 'Failed to create job opportunity.');
      }
    });
  }

  viewApplications(job: IJobOpportunity): void {
    this.router.navigate(['/admin/jobs', job.id]);
  }

  isInvalid(controlName: string): boolean {
    const control = this.jobForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  approveJob(jobId: number): void {
    if (!confirm('Are you sure you want to approve this job?')) return;
    this.jobsService.approveJob(jobId).subscribe({
      next: () => {
        this.notify.success('Job approved successfully.');
        this.loadJobs();
      },
      error: () => this.notify.error('Failed to approve job.')
    });
  }

  openDeactivateModal(jobId: number): void {
    this.selectedJobId.set(jobId);
    this.deactivateReasonCtrl.reset();
    this.showDeactivateModal.set(true);
  }

  closeDeactivateModal(): void {
    this.showDeactivateModal.set(false);
    this.selectedJobId.set(null);
  }

  submitDeactivation(): void {
    if (this.deactivateReasonCtrl.invalid) {
      this.deactivateReasonCtrl.markAsTouched();
      return;
    }
    const jobId = this.selectedJobId();
    if (jobId) {
      this.jobsService.rejectJob(jobId, this.deactivateReasonCtrl.value!).subscribe({
        next: () => {
          this.notify.success('Job deactivated successfully.');
          this.closeDeactivateModal();
          this.loadJobs();
        },
        error: () => this.notify.error('Failed to deactivate job.')
      });
    }
  }

  openDeleteModal(jobId: number): void {
    this.selectedJobId.set(jobId);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedJobId.set(null);
  }

  submitDelete(): void {
    const jobId = this.selectedJobId();
    if (jobId) {
      this.jobsService.deleteJob(jobId).subscribe({
        next: () => {
          this.notify.success('Job permanently deleted.');
          this.closeDeleteModal();
          this.loadJobs();
        },
        error: () => this.notify.error('Failed to delete job.')
      });
    }
  }
}
