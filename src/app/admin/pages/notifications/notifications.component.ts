import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsApiService } from '../../../core/services/notifications.service';
import { INotification } from '../../../core/interfaces/notification.model';
import { DatePipe } from '@angular/common';
import { AuthServiceService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  private notificationsService = inject(NotificationsApiService);
  auth = inject(AuthServiceService);

  notifications = signal<INotification[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.error.set(null);
    this.notificationsService.getMyNotifications().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.notifications.set(res.data);
        } else {
          this.error.set(res.message || 'Failed to load notifications');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Failed to load notifications from server.');
        this.loading.set(false);
      }
    });
  }

  getIconForType(type: string | undefined): string {
    if (!type) return 'fa-solid fa-bell text-primary';
    switch (type.toLowerCase()) {
      case 'warning': return 'fa-solid fa-triangle-exclamation text-warning';
      case 'danger': return 'fa-solid fa-circle-xmark text-danger';
      case 'success': return 'fa-solid fa-circle-check text-success';
      case 'info': return 'fa-solid fa-circle-info text-info';
      case 'jobopportunity': return 'fa-solid fa-briefcase text-primary';
      case 'jobapplication': return 'fa-solid fa-file-lines text-success';
      default: return 'fa-solid fa-bell text-secondary';
    }
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }
}
