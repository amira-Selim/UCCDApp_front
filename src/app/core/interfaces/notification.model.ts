export interface INotification {
  id: number;
  title: string;
  message: string;
  type: string;
  relatedCourseId?: number | null;
  relatedVolunteerId?: number | null;
  relatedJobId?: number | null;
  isRead: boolean;
  createdAt: string;
  userId?: string | null;
  recipientEmail?: string | null;
  recipientRole?: string | null;
}
