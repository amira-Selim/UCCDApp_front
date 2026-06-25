import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private nextId = 1;
  readonly toasts = signal<ToastMessage[]>([]);

  success(text: string, durationMs = 4000): void {
    this.push('success', text, durationMs);
  }

  error(text: string, durationMs = 5000): void {
    this.push('error', text, durationMs);
  }

  info(text: string, durationMs = 4000): void {
    this.push('info', text, durationMs);
  }

  warning(text: string, durationMs = 4500): void {
    this.push('warning', text, durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(type: ToastType, text: string, durationMs: number): void {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, type, text }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}
