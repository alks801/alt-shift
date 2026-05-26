import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "@/components/ui/Icon";
import { IconAction } from "./IconAction";

const meta: Meta<typeof IconAction> = {
  title: "ui/IconAction",
  component: IconAction,
  args: { children: "Delete" },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "danger", "success"] },
  },
};
export default meta;

type Story = StoryObj<typeof IconAction>;

export const Neutral: Story = {
  args: { leadingIcon: <Icon name="trash" size={20} /> },
};

export const Danger: Story = {
  args: { tone: "danger", leadingIcon: <Icon name="trash" size={20} /> },
};

export const Success: Story = {
  args: {
    tone: "success",
    children: "Copied!",
    trailingIcon: <Icon name="check" size={20} />,
  },
};

export const CopyIdle: Story = {
  args: {
    children: "Copy to clipboard",
    trailingIcon: <Icon name="copy" size={20} />,
  },
};
