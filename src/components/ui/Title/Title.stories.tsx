import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Title } from "./Title";

const meta: Meta<typeof Title> = {
  title: "ui/Title",
  component: Title,
  args: { children: "Applications" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    as: { control: "select", options: ["h1", "h2", "h3", "h4"] },
  },
};
export default meta;

type Story = StoryObj<typeof Title>;

export const Large: Story = { args: { size: "lg" } };

export const Medium: Story = { args: { size: "md", as: "h2" } };

export const Small: Story = { args: { size: "sm", as: "h3" } };

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Title size="lg">Large — page heading (48/60)</Title>
      <Title size="md" as="h2">
        Medium — section heading (36/44)
      </Title>
      <Title size="sm" as="h3">
        Small — dialog heading (24/32)
      </Title>
    </div>
  ),
};
