/**
 * Mirrors `UCCD_App.Dto.StudentProfileDto`, returned by `GET /api/Profile/me`.
 * This single DTO already merges the data captured at Register time
 * (fullName, email, phone), the data captured by the Complete Profile step
 * (gender, faculty, graduationYear, nationalID), and the optional fields a
 * student can fill in later from their profile page (education, skills,
 * interests, careerGoal). Any of the optional fields may come back as
 * null/empty if the student never filled them in.
 */
export interface IstudentProfile {
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

/**
 * Payload for `PUT /api/Profile/update`.
 * Backend (`ProfileService.UpdateProfileAsync`) only persists these four
 * fields - email, gender and nationalID are intentionally not editable
 * here since there is no backend support to change them after the
 * Complete Profile step.
 */
export interface IUpdateBasicProfile {
  fullName: string;
  phone: string;
  faculty: string;
  graduationYear: string;
}

/**
 * Payload for `PUT /api/Profile/update-professional-info`.
 * These are the fully-optional fields a student can add/edit at any time.
 */
export interface IUpdateProfessionalInfo {
  education?: string | null;
  skills?: string | null;
  interests?: string | null;
  careerGoal?: string | null;
}