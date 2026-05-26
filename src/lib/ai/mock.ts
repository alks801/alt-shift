import type { LetterInput } from "../types";

/**
 * Builds a believable cover letter without calling any model.
 *
 * Used by the server route when `OPENAI_API_KEY` is not configured so the
 * app remains demo-ready out of the box. The route then chunks this text
 * with a small delay between tokens to mimic real model latency, which lets
 * the UI exercise the same loading + progressive-reveal code paths.
 */
export function buildMockLetter(input: LetterInput): string {
  const job = input.jobTitle.trim() || "open";
  const company = input.company.trim() || "your company";
  const strengths = input.strengths.trim();
  const details = input.details.trim();

  const paragraphs = [
    `Dear ${company} Team,`,
    `I am writing to express my interest in the ${job} position at ${company}. The work your team is doing resonates with me, and I would be excited to contribute and grow with your team.`,
    strengths
      ? `My background in ${strengths} maps directly to what this role requires, and I bring a track record of shipping pragmatic, well-crafted work.`
      : `I bring a track record of shipping pragmatic, well-crafted work and learning quickly in unfamiliar territory.`,
    details ||
      `Beyond the obvious skill match, I care deeply about clear communication, sensible defaults, and leaving things better than I found them.`,
    `I am confident I could translate this experience into meaningful contributions to your team.`,
    `Thank you for considering my application. I would love to discuss how I can help ${company} move faster on what matters most.`,
  ];

  return paragraphs.join("\n\n");
}
