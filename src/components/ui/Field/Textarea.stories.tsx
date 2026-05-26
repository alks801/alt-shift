import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "ui/Textarea",
  component: Textarea,
  args: {
    label: "Additional details",
    placeholder: "Describe why you are a great fit or paste your bio",
    softMaxLength: 1200,
    showCounter: true,
    rows: 6,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const Filled: Story = {
  args: { value: "I have 5 years of experience in product management." },
};

export const OverLimit: Story = {
  args: { value: "a".repeat(1201) },
};

export const Disabled: Story = {
  args: { value: "Cannot edit", disabled: true },
};
