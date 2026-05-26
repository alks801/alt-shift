import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CopyButton } from "./CopyButton";

const meta: Meta<typeof CopyButton> = {
  title: "ui/CopyButton",
  component: CopyButton,
  args: { text: "Dear Hiring Manager, I am writing to express my interest…" },
};
export default meta;

type Story = StoryObj<typeof CopyButton>;

export const Default: Story = {};

export const Empty: Story = { args: { text: "" } };
