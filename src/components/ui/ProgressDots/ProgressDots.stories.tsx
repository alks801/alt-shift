import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProgressDots } from "./ProgressDots";

const meta: Meta<typeof ProgressDots> = {
  title: "ui/ProgressDots",
  component: ProgressDots,
  args: { value: 2, total: 5 },
  argTypes: {
    variant: { control: "inline-radio", options: ["dot", "bar"] },
    value: { control: { type: "range", min: 0, max: 5, step: 1 } },
  },
};
export default meta;

type Story = StoryObj<typeof ProgressDots>;

export const Dots: Story = {};

export const Bars: Story = { args: { variant: "bar" } };

export const Empty: Story = { args: { value: 0 } };

export const Full: Story = { args: { value: 5 } };

export const BarsProgress: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[0, 1, 2, 3, 4, 5].map((v) => (
        <div key={v} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ProgressDots value={v} total={5} variant="bar" />
          <span style={{ fontSize: 13, color: "#667085" }}>{v}/5</span>
        </div>
      ))}
    </div>
  ),
};
