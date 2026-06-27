import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompaniesService, ICompany } from '../../../../core/services/admin/companies.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './companies-list.component.html'
})
export class CompaniesListComponent implements OnInit {
  private companiesService = inject(CompaniesService);
  private notify = inject(NotificationService);

  companies: ICompany[] = [];
  isLoading = false;

  showModal = false;
  newCompany = { name: '', email: '', password: '' };
  isSubmitting = false;

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.companiesService.getCompanies().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.companies = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.notify.error('Failed to load companies.');
        this.isLoading = false;
      }
    });
  }

  openModal(): void {
    this.newCompany = { name: '', email: '', password: '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  createCompany(): void {
    if (!this.newCompany.name || !this.newCompany.email || !this.newCompany.password) {
      this.notify.error('Please fill in all fields.');
      return;
    }
    
    this.isSubmitting = true;
    this.companiesService.createCompany(this.newCompany).subscribe({
      next: (res) => {
        if (res.success) {
          this.notify.success(res.message || 'Company created successfully');
          this.closeModal();
          this.loadCompanies();
        } else {
          this.notify.error(res.message || 'Failed to create company');
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Error occurred');
        this.isSubmitting = false;
      }
    });
  }
}
