import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

interface ConfirmState extends ConfirmOptions {
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  readonly state = signal<ConfirmState>({
    visible: false,
    message: '',
    title: 'Confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary'
  });

  private resolver: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.state.set({
      visible: true,
      title: options.title ?? 'Confirm',
      message: options.message,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel',
      variant: options.variant ?? 'primary'
    });

    return new Promise<boolean>(resolve => {
      this.resolver = resolve;
    });
  }

  resolve(result: boolean): void {
    this.state.update(s => ({ ...s, visible: false }));
    if (this.resolver) {
      this.resolver(result);
      this.resolver = null;
    }
  }
}
