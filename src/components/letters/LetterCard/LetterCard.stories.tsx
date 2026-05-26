import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LetterCard } from "./LetterCard";

const SHORT_BODY = `Dear Apple Team,

I am excited to apply for the Designer position. My passion for minimal, user-centered design aligns with Apple's design philosophy.

Best regards`;

const LONG_BODY = `Dear Google Team,

I am writing to express my strong interest in the Product Manager position at Google. With over five years of experience in product development, I bring a unique combination of technical expertise and strategic thinking.

Throughout my career, I have successfully launched multiple products that served millions of users, consistently improving engagement and satisfaction metrics across every release cycle.

I look forward to discussing how my skills and experience can contribute to Google's continued growth and innovation in cloud computing and AI.

Best regards`;

const meta: Meta<typeof LetterCard> = {
  title: "letters/LetterCard",
  component: LetterCard,
  args: { onDelete: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 552 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof LetterCard>;

export const Short: Story = {
  args: {
    letter: {
      id: "1",
      jobTitle: "Designer",
      company: "Apple",
      body: SHORT_BODY,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
};

export const Long: Story = {
  args: {
    letter: {
      id: "2",
      jobTitle: "Product Manager",
      company: "Google",
      body: LONG_BODY,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  },
};
