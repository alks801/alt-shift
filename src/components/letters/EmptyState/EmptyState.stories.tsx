import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "letters/EmptyState",
  component: EmptyState,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};
