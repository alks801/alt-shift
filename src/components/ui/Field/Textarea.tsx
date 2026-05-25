import {
  forwardRef,
  useId,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "@/lib/cx";
import { describedBy } from "./describedBy";
import styles from "./Field.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  /**
   * Soft character cap. Users can still type past it, but the field flips
   * to its invalid style and the counter turns red. The parent decides
   * whether to block submission. Use this instead of the native `maxLength`
   * whenever you want the limit to be a guideline, not a hard wall.
   */
  softMaxLength?: number;
  showCounter?: boolean;
  /**
   * When true the field stretches to fill the available vertical space in
   * its parent flex column (e.g. so an "Additional details" textarea grows
   * to fill the gap between the inputs above and the actions below).
   */
  grow?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      hint,
      error,
      invalid,
      id,
      className,
      maxLength,
      softMaxLength,
      showCounter,
      grow,
      value,
      defaultValue,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedById = describedBy(inputId, error, hint);

    const currentLength =
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
          ? defaultValue.length
          : 0;

    const counterLimit = softMaxLength ?? maxLength;
    const overSoftLimit =
      typeof softMaxLength === "number" && currentLength > softMaxLength;
    const isInvalid = invalid || Boolean(error) || overSoftLimit;

    return (
      <div className={cx(styles.field, grow && styles.grow)}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          className={cx(
            styles.control,
            styles.textarea,
            "scrollbarThin",
            isInvalid && styles.invalid,
            className,
          )}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedById}
          value={value}
          defaultValue={defaultValue}
          {...rest}
        />
        {(hint || error || (showCounter && counterLimit)) && (
          <div className={styles.footer}>
            {showCounter && counterLimit && (
              <span
                className={styles.counter}
                data-over-limit={overSoftLimit || undefined}
                aria-live="polite"
              >
                {currentLength}/{counterLimit}
              </span>
            )}
            {error ? (
              <span id={`${inputId}-error`} className={styles.error}>
                {error}
              </span>
            ) : hint ? (
              <span id={`${inputId}-hint`} className={styles.hint}>
                {hint}
              </span>
            ) : null}
          </div>
        )}
      </div>
    );
  },
);
