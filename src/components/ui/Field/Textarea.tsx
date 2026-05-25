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
  /** When set, renders a `current / max` counter under the field. */
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
    const isInvalid = invalid || Boolean(error);

    const currentLength =
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
          ? defaultValue.length
          : 0;
    const nearLimit =
      typeof maxLength === "number" && currentLength / maxLength >= 0.95;

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
        {(hint || error || (showCounter && maxLength)) && (
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
            {showCounter && maxLength && (
              <span
                className={styles.counter}
                data-near-limit={nearLimit || undefined}
                aria-live="polite"
              >
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
