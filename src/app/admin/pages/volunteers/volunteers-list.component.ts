import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VolunteersAdminService } from '../../../core/services/admin/volunteers-admin.service';
import { IVolunteerApplication, IVolunteerOpportunity, VolunteerStatus } from '../../../core/interfaces/volunteer.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/components/data-table/table-column.model';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-volunteers-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableComponent, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './volunteers-list.component.html',
  styleUrl: './volunteers-list.component.scss'
})
export class VolunteersListComponent implements OnInit {
  private readonly volunteersService = inject(VolunteersAdminService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  opportunities = signal<IVolunteerOpportunity[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  showForm = signal(false);
  editingOpportunity = signal<IVolunteerOpportunity | null>(null);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '60px' },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'committee', label: 'Committee', sortable: true },
    { key: 'requiredCount', label: 'Required', sortable: true, width: '90px' },
    { key: 'currentApprovedCount', label: 'Approved', sortable: true, width: '90px' },
    { key: 'isActive', label: 'Active', sortable: true, type: 'boolean' },
    { key: 'deadline', label: 'Deadline', sortable: true, type: 'date' },
  ];

  opportunityForm = this.fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    committee: ['', [Validators.required]],
    requiredCount: [1, [Validators.required, Validators.min(1)]],
    deadline: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadOpportunities();
  }

  loadOpportunities(): void {
    this.loading.set(true);
    this.error.set(null);
    this.volunteersService.getAllOpportunities().subscribe({
      next: (res) => {
        this.opportunities.set(res.data ?? []);
        this.loading.set(false);
        this.checkQueryParams();
      },
      error: () => {
        this.error.set('Failed to load volunteer opportunities.');
        this.loading.set(false);
        this.notify.error('Failed to load volunteer opportunities.');
      }
    });
  }

  checkQueryParams(): void {
    const openTitle = this.route.snapshot.queryParamMap.get('openTitle');
    if (openTitle) {
      const opp = this.opportunities().find(o => o.title === openTitle);
      if (opp) {
        this.viewApplications(opp);
      }
    }
  }


  openCreateForm(): void {
    this.editingOpportunity.set(null);
    this.opportunityForm.reset({ title: '', description: '', committee: '', requiredCount: 1, deadline: '' });
    this.showForm.set(true);
  }

  openEditForm(opportunity: IVolunteerOpportunity): void {
    this.editingOpportunity.set(opportunity);
    this.opportunityForm.reset({
      title: opportunity.title,
      description: opportunity.description,
      committee: opportunity.committee,
      requiredCount: opportunity.requiredCount,
      deadline: opportunity.deadline ? opportunity.deadline.substring(0, 10) : ''
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingOpportunity.set(null);
  }

  submitForm(): void {
    if (this.opportunityForm.invalid) {
      this.opportunityForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.opportunityForm.getRawValue();
    const editing = this.editingOpportunity();

    const payload = {
      title: value.title!,
      description: value.description!,
      committee: value.committee!,
      requiredCount: Number(value.requiredCount),
      deadline: value.deadline ? new Date(value.deadline as string).toISOString() : ''
    };

    const request = editing
      ? this.volunteersService.update(editing.id, payload)
      : this.volunteersService.create(payload);

    request.subscribe({
      next: () => {
        this.notify.success(editing ? 'Opportunity updated successfully.' : 'Opportunity created successfully.');
        this.saving.set(false);
        this.closeForm();
        this.loadOpportunities();
      },
      error: (err) => {
        this.saving.set(false);
        this.notify.error(err?.error?.message || 'Failed to save the opportunity.');
      }
    });
  }

  viewApplications(opportunity: IVolunteerOpportunity): void {
    this.router.navigate(['/admin/volunteers', opportunity.id]);
  }

  isInvalid(controlName: string): boolean {
    const control = this.opportunityForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
