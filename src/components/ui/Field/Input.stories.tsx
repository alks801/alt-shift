import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "ui/Input",
  component: Input,
  args: { label: "Job title", placeholder: "Product manager" },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Filled: Story = { args: { value: "Senior Engineer" } };

export const Disabled: Story = { args: { value: "Read-only value", disabled: true } };

export const Required: Story = { args: { required: true } };
