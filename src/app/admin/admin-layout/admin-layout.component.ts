import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth.service';
import { ToastContainerComponent } from '../../shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { NotificationsApiService } from '../../core/services/notifications.service';
import { SignalRService } from '../../core/services/signalr.service';
import { INotification } from '../../core/interfaces/notification.model';
import { Subscription } from 'rxjs';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface AdminNavItem {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastContainerComponent, ConfirmDialogComponent, TranslatePipe],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthServiceService);
  private readonly _notificationsApi = inject(NotificationsApiService);
  private readonly _signalR = inject(SignalRService);
  private readonly router = inject(Router);

  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  
  notifications: INotification[] = [];
  unreadCount = 0;

  private signalRSub?: Subscription;

  navItems: AdminNavItem[] = [];

  ngOnInit() {
    this.setupNavItems();
    this.loadNotifications();
    this._signalR.startConnection();
    if (!this.signalRSub) {
      this.signalRSub = this._signalR.notificationReceived.subscribe((notif: INotification) => {
        this.notifications.unshift(notif);
        this.unreadCount++;
      });
    }
  }

  setupNavItems() {
    if (this.auth.isAdmin()) {
      this.navItems = [
        { label: 'admin.dashboard', icon: 'fa-solid fa-gauge-high', link: '/admin/dashboard' },
        { label: 'admin.students', icon: 'fa-solid fa-user-graduate', link: '/admin/students' },
        { label: 'admin.courses', icon: 'fa-solid fa-book', link: '/admin/courses' },
        { label: 'admin.jobs', icon: 'fa-solid fa-briefcase', link: '/admin/jobs' },
        { label: 'admin.volunteering', icon: 'fa-solid fa-handshake-angle', link: '/admin/volunteers' },
        { label: 'admin.messages', icon: 'fa-solid fa-envelope', link: '/admin/messages' },
      ];
    } else if (this.auth.isCompany()) {
      this.navItems = [
        { label: 'Company Jobs', icon: 'fa-solid fa-briefcase', link: '/admin/jobs' }
      ];
    }
  }

  ngOnDestroy(): void {
    this._signalR.stopConnection();
    this.signalRSub?.unsubscribe();
  }

  loadNotifications(): void {
    this._notificationsApi.getMyNotifications().subscribe({
      next: (res) => {
        this.notifications = res?.data || [];
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
      },
      error: (err) => console.error('Error fetching admin notifications', err)
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

    if (notif.relatedCourseId) {
      this.router.navigate(['/admin/courses', notif.relatedCourseId]);
    } else if (notif.title === 'New Enrollment Request' || notif.message.includes('enrollment request')) {
      this.router.navigate(['/admin/courses']);
    } else if (notif.type?.toLowerCase() === 'message' || notif.title === 'New Contact Message' || notif.message.includes('received a new message')) {
      this.router.navigate(['/admin/messages']);
    } else if (notif.type?.toLowerCase() === 'volunteerapplication' || notif.title === 'New Volunteer Application') {
      if (notif.relatedVolunteerId) {
        this.router.navigate(['/admin/volunteers', notif.relatedVolunteerId]);
      } else {
        this.router.navigate(['/admin/volunteers']);
      }
    } else if (notif.type?.toLowerCase() === 'jobapplication' || notif.title === 'New Job Application') {
      if (notif.relatedJobId) {
        this.router.navigate(['/admin/jobs', notif.relatedJobId]);
      } else {
        this.router.navigate(['/admin/jobs']);
      }
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

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.set(!this.mobileSidebarOpen());
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
