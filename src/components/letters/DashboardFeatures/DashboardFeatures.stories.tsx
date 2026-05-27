import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardFeatures } from "./DashboardFeatures";

const meta: Meta<typeof DashboardFeatures> = {
  title: "letters/DashboardFeatures",
  component: DashboardFeatures,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof DashboardFeatures>;

export const Default: Story = {};
