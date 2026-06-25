import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { VolunteersAdminService } from '../../../core/services/admin/volunteers-admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IVolunteerOpportunity, IVolunteerApplication, VolunteerStatus } from '../../../core/interfaces/volunteer.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-volunteer-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './volunteer-details.component.html',
  styleUrl: './volunteer-details.component.scss'
})
export class VolunteerDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private volunteersService = inject(VolunteersAdminService);
  private notify = inject(NotificationService);

  loading = signal(true);
  applicationsLoading = signal(true);
  updatingApplicationId = signal<number | null>(null);

  opportunity = signal<IVolunteerOpportunity | null>(null);
  applications = signal<IVolunteerApplication[]>([]);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadOpportunity(+idParam);
      this.loadApplications(+idParam);
    }
  }

  loadOpportunity(id: number): void {
    this.volunteersService.getAllOpportunities().subscribe({
      next: (res) => {
        const found = res.data?.find(o => o.id === id);
        this.opportunity.set(found || null);
        this.loading.set(false);
      },
      error: () => {
        this.notify.error('Failed to load opportunity details.');
        this.loading.set(false);
      }
    });
  }

  loadApplications(id: number): void {
    this.volunteersService.getApplications(id).subscribe({
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

  updateStatus(app: IVolunteerApplication, newStatus: VolunteerStatus): void {
    this.updatingApplicationId.set(app.id);
    this.volunteersService.updateApplicationStatus(app.id, newStatus).subscribe({
      next: () => {
        this.notify.success(`Application ${newStatus.toLowerCase()} successfully.`);
        
        // Update local state
        const updatedApps = this.applications().map(a => 
          a.id === app.id ? { ...a, status: newStatus } : a
        );
        this.applications.set(updatedApps);
        
        // Also update counts locally if needed
        if (newStatus === 'Approved') {
           const opp = this.opportunity();
           if (opp) {
             this.opportunity.set({...opp, currentApprovedCount: (opp.currentApprovedCount || 0) + 1});
           }
        }
        
        this.updatingApplicationId.set(null);
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Failed to update application status.');
        this.updatingApplicationId.set(null);
      }
    });
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-warning text-dark';
    }
  }
}
