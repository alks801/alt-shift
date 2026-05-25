import {
  forwardRef,
  useId,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "@/lib/cx";
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
      value,
      defaultValue,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedById = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

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
      <div className={styles.field}>
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
            {error ? (
              <span id={`${inputId}-error`} className={styles.error}>
                {error}
              </span>
            ) : hint ? (
              <span id={`${inputId}-hint`} className={styles.hint}>
                {hint}
              </span>
            ) : null}
            {showCounter && counterLimit && (
              <span
                className={styles.counter}
                data-over-limit={overSoftLimit || undefined}
                aria-live="polite"
              >
                {currentLength}/{counterLimit}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
