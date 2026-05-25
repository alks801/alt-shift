import type { LetterInput } from "../types";

export const SYSTEM_PROMPT = `You are an experienced career coach who writes concise, sincere, and tailored cover letters for job applicants.

Rules:
- Always address the company by name in the salutation: "Dear {Company} Team,".
- Use 4–6 short paragraphs separated by a single blank line.
- Open with the role and a genuine reason for interest.
- Show how the applicant's strengths map to the role; avoid generic clichés.
- Close with a confident, polite call to discuss further.
- Sign off without a name (the user will add one).
- Plain text only — no markdown, no bullet points, no preamble or commentary.`;

export function buildUserPrompt(input: LetterInput): string {
  const strengths = input.strengths.trim() || "(not specified)";
  const details = input.details.trim() || "(not specified)";
  return [
    `Write a cover letter for the following application:`,
    ``,
    `Role: ${input.jobTitle.trim()}`,
    `Company: ${input.company.trim()}`,
    `Applicant's strengths: ${strengths}`,
    `Additional details from the applicant:`,
    details,
  ].join("\n");
}
