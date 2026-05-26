"use client";

import { Icon } from "@/components/ui/Icon";
import { IconAction } from "@/components/ui/IconAction";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";

interface CopyButtonProps {
  /** Text to write to the system clipboard on click. */
  text: string;
  /** Force-disable the button. Defaults to disabled when `text` is empty. */
  disabled?: boolean;
  className?: string;
}

/**
 * "Copy to clipboard" affordance with built-in success feedback.
 *
 * Owns its `copied` state internally (via `useCopyToClipboard`) so the
 * parent isn't re-rendered on every copy click — only this button is. The
 * caller just passes the text; the button handles UX (label + icon swap,
 * tone change) end-to-end.
 */
export function CopyButton({ text, disabled, className }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  const handleClick = () => copy(text);

  return (
    <IconAction
      onClick={handleClick}
      disabled={disabled ?? !text}
      tone={copied ? "success" : "neutral"}
      trailingIcon={<Icon name={copied ? "check" : "copy"} size={20} />}
      className={className}
    >
      {copied ? "Copied!" : "Copy to clipboard"}
    </IconAction>
  );
}
