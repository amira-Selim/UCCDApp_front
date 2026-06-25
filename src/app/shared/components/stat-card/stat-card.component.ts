import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() icon = 'fa-solid fa-chart-simple';
  @Input() colorClass: 'main' | 'success' | 'warning' | 'danger' | 'info' = 'main';
  @Input() trend: string | null = null;
  @Input() loading = false;
}
