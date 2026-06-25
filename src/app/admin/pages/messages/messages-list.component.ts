import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MessagesAdminService } from '../../../core/services/admin/messages-admin.service';
import { IContactMessage } from '../../../core/interfaces/message.model';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { TableColumn } from '../../../shared/components/data-table/table-column.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.scss'
})
export class MessagesListComponent implements OnInit {
  private readonly messagesService = inject(MessagesAdminService);
  private readonly notify = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  messages = signal<IContactMessage[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedMessage = signal<IContactMessage | null>(null);

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: '60px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'issueType', label: 'Issue Type', sortable: true },
    { key: 'isRead', label: 'Read', sortable: true, type: 'boolean' },
    { key: 'createdAt', label: 'Received', sortable: true, type: 'date' },
  ];

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading.set(true);
    this.error.set(null);
    this.messagesService.getAll().subscribe({
      next: (data) => {
        this.messages.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load messages.');
        this.loading.set(false);
        this.notify.error('Failed to load messages.');
      }
    });
  }

  viewMessage(message: IContactMessage): void {
    this.selectedMessage.set(message);
    if (!message.isRead) {
      this.messagesService.markAsRead(message.id).subscribe({
        next: () => {
          this.messages.update(list => list.map(m => m.id === message.id ? { ...m, isRead: true } : m));
          this.selectedMessage.set({ ...message, isRead: true });
        }
      });
    }
  }

  closeDetail(): void {
    this.selectedMessage.set(null);
  }

  async deleteMessage(message: IContactMessage): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Message',
      message: `Delete the message from "${message.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    });

    if (!confirmed) return;

    this.messagesService.delete(message.id).subscribe({
      next: () => {
        this.notify.success('Message deleted successfully.');
        this.closeDetail();
        this.loadMessages();
      },
      error: () => {
        this.notify.error('Failed to delete the message.');
      }
    });
  }
}
