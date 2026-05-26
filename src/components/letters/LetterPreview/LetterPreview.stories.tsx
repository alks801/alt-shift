import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LetterPreview } from "./LetterPreview";

const SAMPLE_TEXT = `Dear Stripe Team,

I am writing to express my strong interest in the Product Manager position at Stripe. With over five years of experience in fintech product development, I bring a unique combination of technical expertise and strategic thinking that aligns well with Stripe's mission.

Throughout my career, I have successfully launched multiple payment solutions that served millions of users, consistently improving conversion rates and user satisfaction.

I look forward to the opportunity to discuss how my skills and experience can contribute to Stripe's continued growth and innovation.

Best regards`;

const meta: Meta<typeof LetterPreview> = {
  title: "letters/LetterPreview",
  component: LetterPreview,
  decorators: [
    (Story) => (
      <div style={{ width: 520, height: 500 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof LetterPreview>;

export const Idle: Story = {
  args: { status: "idle", text: "" },
};

export const Loading: Story = {
  args: { status: "loading", text: "" },
};

export const Ready: Story = {
  args: { status: "ready", text: SAMPLE_TEXT },
};

export const Error: Story = {
  args: { status: "error", text: "", errorMessage: "Generation timed out" },
};

export const ErrorDefault: Story = {
  args: { status: "error", text: "" },
};
