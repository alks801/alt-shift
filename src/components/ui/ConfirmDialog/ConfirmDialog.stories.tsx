import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "./ConfirmDialog";

const meta: Meta<typeof ConfirmDialog> = {
  title: "ui/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof ConfirmDialog>;

export const Danger: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <ConfirmDialog
          open={open}
          title="Delete this application?"
          description="The generated letter will be removed from your device. This can't be undone."
          confirmLabel="Delete"
          cancelLabel="Keep it"
          tone="danger"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const Neutral: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <ConfirmDialog
          open={open}
          title="Reset form?"
          description="All fields will be cleared."
          confirmLabel="Reset"
          cancelLabel="Cancel"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};
