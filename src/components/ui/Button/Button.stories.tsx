import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon } from "@/components/ui/Icon";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "ui/Button",
  component: Button,
  args: { children: "Create New" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
    size: { control: "inline-radio", options: ["md", "lg"] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };

export const Large: Story = { args: { size: "lg" } };

export const WithIcon: Story = {
  args: { leadingIcon: <Icon name="plus" /> },
};

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };

export const DisabledSecondary: Story = {
  args: { variant: "secondary", disabled: true },
};

export const FullWidth: Story = {
  args: { fullWidth: true, size: "lg", leadingIcon: <Icon name="repeat" /> },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};
