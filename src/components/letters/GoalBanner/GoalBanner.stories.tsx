import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { GoalBanner } from "./GoalBanner";

const meta: Meta<typeof GoalBanner> = {
  title: "letters/GoalBanner",
  component: GoalBanner,
  parameters: { layout: "padded" },
  argTypes: {
    count: { control: { type: "range", min: 0, max: 5, step: 1 } },
    variant: { control: "inline-radio", options: ["today", "general"] },
  },
};
export default meta;

type Story = StoryObj<typeof GoalBanner>;

export const DashboardEarly: Story = {
  args: { count: 1, variant: "today" },
};

export const DashboardMidway: Story = {
  args: { count: 3, variant: "today" },
};

export const FormWithReset: Story = {
  args: { count: 2, variant: "general", onCreateNew: fn() },
};

export const AlmostDone: Story = {
  args: { count: 4, variant: "today" },
};
