export interface LetterInput {
  jobTitle: string;
  company: string;
  strengths: string;
  details: string;
}

/**
 * Stored cover letter. We persist the job title and company so the dashboard
 * card can show a meaningful header; the free-form strengths/details fields
 * are only used at generation time and intentionally not stored.
 */
export interface Letter {
  id: string;
  jobTitle: string;
  company: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}
