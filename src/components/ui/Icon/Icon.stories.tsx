import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon, type IconName } from "./Icon";

const ALL_ICONS: IconName[] = ["home", "plus", "copy", "trash", "repeat", "check", "cat"];

const meta: Meta<typeof Icon> = {
  title: "ui/Icon",
  component: Icon,
  args: { name: "home", size: 24 },
  argTypes: {
    name: { control: "select", options: ALL_ICONS },
    size: { control: { type: "range", min: 12, max: 48, step: 4 } },
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {ALL_ICONS.map((name) => (
        <div
          key={name}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
        >
          <Icon name={name} size={24} />
          <span style={{ fontSize: 11, color: "#667085" }}>{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Danger: Story = {
  args: { name: "trash", size: 20 },
  decorators: [
    (Story) => (
      <div style={{ color: "#d92d20" }}>
        <Story />
      </div>
    ),
  ],
};
