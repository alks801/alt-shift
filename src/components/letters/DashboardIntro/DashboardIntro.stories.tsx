import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardIntro } from "./DashboardIntro";

const meta: Meta<typeof DashboardIntro> = {
  title: "letters/DashboardIntro",
  component: DashboardIntro,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof DashboardIntro>;

export const Default: Story = {};
