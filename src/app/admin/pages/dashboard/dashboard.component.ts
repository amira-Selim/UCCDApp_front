import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DashboardAdminService, DashboardStats } from '../../../core/services/admin/dashboard-admin.service';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationsApiService } from '../../../core/services/notifications.service';
import { INotification } from '../../../core/interfaces/notification.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardAdminService);
  private readonly notify = inject(NotificationService);
  private readonly notificationsAdminService = inject(NotificationsApiService);
  private readonly router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  stats = signal<DashboardStats | null>(null);
  recentActivities = signal<INotification[]>([]);

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentActivities();
  }

  loadStats(): void {
    this.loading.set(true);
    this.error.set(null);
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard statistics.');
        this.loading.set(false);
        this.notify.error('Could not load dashboard statistics.');
      }
    });
  }

  loadRecentActivities(): void {
    this.notificationsAdminService.getMyNotifications().subscribe({
      next: (res: any) => {
        const notifs = res?.data || [];
        this.recentActivities.set(notifs.slice(0, 5));
      },
      error: (err: any) => console.error('Error fetching admin notifications', err)
    });
  }

  openActivity(notif: INotification): void {
    if (!notif.isRead) {
      this.notificationsAdminService.markAsRead(notif.id).subscribe({
        error: (err: any) => console.error('Error marking notification as read', err)
      });
      notif.isRead = true;
    }

    if (notif.relatedCourseId) {
      this.router.navigate(['/admin/courses', notif.relatedCourseId]);
    } else if (notif.title === 'New Enrollment Request' || notif.message.includes('enrollment request')) {
      this.router.navigate(['/admin/courses']);
    } else if (notif.type === 'Message') {
      this.router.navigate(['/admin/messages']);
    } else if (notif.type === 'VolunteerApplication') {
      if (notif.relatedVolunteerId) {
        this.router.navigate(['/admin/volunteers', notif.relatedVolunteerId]);
      } else {
        this.router.navigate(['/admin/volunteers']);
      }
    } else if (notif.type === 'JobApplication') {
      if (notif.relatedJobId) {
        this.router.navigate(['/admin/jobs', notif.relatedJobId]);
      } else {
        this.router.navigate(['/admin/jobs']);
      }
    }
  }

  getIconColorClass(type: string | undefined): string {
    switch (type) {
      case 'CourseRegistration': return 'bg-warning bg-opacity-10 text-warning';
      case 'VolunteerApplication': return 'bg-primary bg-opacity-10 text-primary';
      case 'JobApplication': return 'bg-success bg-opacity-10 text-success';
      case 'Message': return 'bg-info bg-opacity-10 text-info';
      default: return 'bg-secondary bg-opacity-10 text-secondary';
    }
  }

  maxCount(items: { count: number }[] | undefined): number {
    if (!items || items.length === 0) return 1;
    return Math.max(...items.map(i => i.count), 1);
  }
}
