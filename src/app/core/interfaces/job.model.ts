export interface IJobOpportunity {
  id: number;
  title: string;
  companyName: string;
  companyEmail: string;
  description: string;
  requirements: string;
  location: string;
  salaryRange?: number | null;
  type: string;
  targetFaculty: string;
  isApproved: boolean;
  createdAt: string;
  deadline?: string | null;
  totalApplicants: number;
}

export interface ICreateJobOpportunity {
  title: string;
  companyName: string;
  companyEmail: string;
  description: string;
  requirements: string;
  location: string;
  salaryRange?: number | null;
  type: string;
  targetFaculty: string;
  deadline?: string | null;
}

export interface IJobApplication {
  id: number;
  jobOpportunityId: number;
  jobTitle: string;
  companyName: string;
  studentId: number;
  studentFullName: string;
  studentEmail: string;
  studentFaculty: string;
  cvFilePath: string;
  appliedAt: string;
}
