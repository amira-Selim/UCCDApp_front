import { Component, inject, OnDestroy, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from "@angular/router";
import { AuthServiceService } from '../../core/services/auth.service';
import { NotificationsApiService } from '../../core/services/notifications.service';
import { SignalRService } from '../../core/services/signalr.service';
import { INotification } from '../../core/interfaces/notification.model';
import { Subscription, interval } from 'rxjs';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink, TranslatePipe],
  templateUrl: './nav-blank.component.html',
  styleUrl: './nav-blank.component.scss'
})
export class NavBlankComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthServiceService);
  private readonly _notificationsApi = inject(NotificationsApiService);
  private readonly _signalR = inject(SignalRService);
  private readonly router = inject(Router);

  notifications: INotification[] = [];
  unreadCount = 0;

  private signalRSub?: Subscription;

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.loadNotifications();
        this._signalR.startConnection();
        
        if (!this.signalRSub) {
          this.signalRSub = this._signalR.notificationReceived.subscribe((notif: INotification) => {
            this.notifications.unshift(notif); // Add new notification to the beginning
            this.unreadCount++;
            // Optional: You could show a toast notification here too using NotificationService
          });
        }
      } else {
        this._signalR.stopConnection();
        this.signalRSub?.unsubscribe();
        this.signalRSub = undefined;
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.signalRSub?.unsubscribe();
  }

  loadNotifications(): void {
    this._notificationsApi.getMyNotifications().subscribe({
      next: (res) => {
        this.notifications = res?.data || [];
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
      },
      error: (err) => console.error('Error fetching notifications', err)
    });
  }

  openNotification(notif: INotification): void {
    if (!notif.isRead) {
      notif.isRead = true;
      this.unreadCount = this.notifications.filter(n => !n.isRead).length;
      this._notificationsApi.markAsRead(notif.id).subscribe({
        error: (err) => console.error('Error marking notification as read', err)
      });
    }

    const match = notif.message.match(/application for (.*?) has been/);
    const title = match ? match[1] : null;

    if (notif.title.includes('Volunteer')) {
      this.router.navigate(['/student-profile'], { queryParams: { tab: 'volunteers' } });
    } else if (notif.title.includes('Job')) {
      this.router.navigate(['/student-profile'], { queryParams: { tab: 'jobs' } });
    } else if (notif.relatedCourseId || notif.title.includes('Course')) {
      this.router.navigate(['/student-profile'], { queryParams: { tab: 'courses' } });
    } else {
      // Fallback
      this.router.navigate(['/student-profile']);
    }
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) return;
    this.notifications.forEach(n => n.isRead = true);
    this.unreadCount = 0;
    this._notificationsApi.markAllAsRead().subscribe({
      error: (err) => console.error('Error marking all notifications as read', err)
    });
  }
}
