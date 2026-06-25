import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastContainerComponent {
  readonly notificationService = inject(NotificationService);

  iconFor(type: string): string {
    switch (type) {
      case 'success': return 'fa-solid fa-circle-check';
      case 'error': return 'fa-solid fa-circle-exclamation';
      case 'warning': return 'fa-solid fa-triangle-exclamation';
      default: return 'fa-solid fa-circle-info';
    }
  }
}
