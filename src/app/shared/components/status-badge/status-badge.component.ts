import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface StatusStyle {
  variant: StatusVariant;
  icon: string;
}

/**
 * Central status -> style map used everywhere in the admin dashboard so that
 * the same word always renders with the same color/icon, regardless of which
 * entity (job, volunteer opportunity, application, message...) it comes from.
 *
 * Keys are matched case-insensitively against the raw status text coming
 * from the backend (e.g. VolunteerApplicationResponseDto.Status, or values
 * derived client-side such as "Active" / "Inactive").
 */
const STATUS_STYLES: Record<string, StatusStyle> = {
  active: { variant: 'success', icon: 'fa-solid fa-circle-check' },
  approved: { variant: 'success', icon: 'fa-solid fa-circle-check' },
  aproved: { variant: 'success', icon: 'fa-solid fa-circle-check' }, // backend enum spelling (StudentStatus.Aproved)
  read: { variant: 'neutral', icon: 'fa-solid fa-envelope-open' },
  open: { variant: 'success', icon: 'fa-solid fa-door-open' },
  completed: { variant: 'success', icon: 'fa-solid fa-circle-check' },

  pending: { variant: 'warning', icon: 'fa-solid fa-clock' },
  'under review': { variant: 'warning', icon: 'fa-solid fa-clock' },
  unread: { variant: 'info', icon: 'fa-solid fa-envelope' },

  rejected: { variant: 'danger', icon: 'fa-solid fa-circle-xmark' },
  inactive: { variant: 'neutral', icon: 'fa-solid fa-circle-minus' },
  closed: { variant: 'neutral', icon: 'fa-solid fa-lock' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  private readonly statusInput = signal('');

  @Input() set status(value: string | null | undefined) {
    this.statusInput.set(value ?? '');
  }

  /** Optional: show only the dot, no label (useful for tight table cells). */
  @Input() dotOnly = false;

  readonly style = computed<StatusStyle>(() => {
    const key = this.statusInput().trim().toLowerCase();
    return STATUS_STYLES[key] ?? { variant: 'neutral', icon: 'fa-solid fa-circle' };
  });

  readonly label = computed(() => this.statusInput() || '—');
}
