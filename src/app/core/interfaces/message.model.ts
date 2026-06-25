export interface ICreateContactMessage {
  name: string;
  email: string;
  issueType: string;
  content: string;
}

export interface IContactMessage {
  id: number;
  name: string;
  email: string;
  issueType: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  isArchived: boolean;
}
