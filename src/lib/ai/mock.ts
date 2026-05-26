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

  const openers = [
    `The work your team is doing resonates with me, and I would be excited to contribute and grow with your team.`,
    `Having followed your recent projects, I'm drawn to the culture of craft and velocity your team embodies.`,
    `The opportunity to join ${company} at this stage aligns perfectly with the kind of impact I want to make next.`,
  ];

  const closers = [
    `Thank you for considering my application. I would love to discuss how I can help ${company} move faster on what matters most.`,
    `I appreciate your time and would welcome the chance to explore how I can contribute to ${company}'s next chapter.`,
    `Thank you for reading — I'd be glad to chat about what I can bring to the team whenever it's convenient.`,
  ];

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const paragraphs = [
    `Dear ${company} Team,`,
    `I am writing to express my interest in the ${job} position at ${company}. ${pick(openers)}`,
    strengths
      ? `My background in ${strengths} maps directly to what this role requires, and I bring a track record of shipping pragmatic, well-crafted work.`
      : `I bring a track record of shipping pragmatic, well-crafted work and learning quickly in unfamiliar territory.`,
    details ||
      `Beyond the obvious skill match, I care deeply about clear communication, sensible defaults, and leaving things better than I found them.`,
    `I am confident I could translate this experience into meaningful contributions to your team.`,
    pick(closers),
  ];

  return paragraphs.join("\n\n");
}
