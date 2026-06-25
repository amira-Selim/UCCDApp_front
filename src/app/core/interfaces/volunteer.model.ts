export interface IVolunteerOpportunity {
  id: number;
  title: string;
  description: string;
  committee: string;
  requiredCount: number;
  currentApprovedCount: number;
  pendingApplicantsCount?: number;
  deadline?: string | null;
  isActive: boolean;
}

export interface ICreateVolunteerOpportunity {
  title: string;
  description: string;
  committee: string;
  requiredCount: number;
  deadline: string;
}

export type VolunteerStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IVolunteerApplication {
  id: number;
  opportunityId: number;
  opportunityTitle: string;
  studentId: number;
  studentFullName: string;
  studentEmail: string;
  motivation: string;
  skills: string;
  status: VolunteerStatus;
  appliedAt: string;
}
