export interface IStudent {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  faculty: string;
  graduationYear: string;
  nationalID: string;
  education?: string | null;
  skills?: string | null;
  interests?: string | null;
  careerGoal?: string | null;
  enrolledCoursesCount: number;
}
