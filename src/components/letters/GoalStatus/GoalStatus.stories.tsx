import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GoalStatus } from "./GoalStatus";

const meta: Meta<typeof GoalStatus> = {
  title: "letters/GoalStatus",
  component: GoalStatus,
  argTypes: {
    count: { control: { type: "range", min: 0, max: 6, step: 1 } },
  },
};
export default meta;

type Story = StoryObj<typeof GoalStatus>;

export const Zero: Story = { args: { count: 0 } };

export const Midway: Story = { args: { count: 3 } };

export const GoalReached: Story = { args: { count: 5 } };

export const OverGoal: Story = { args: { count: 7 } };
