import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "@/lib/cx";
import { describedBy } from "./describedBy";
import styles from "./Field.module.css";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, invalid, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedById = describedBy(inputId, error, hint);
  const isInvalid = invalid || Boolean(error);

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cx(styles.control, styles.input, isInvalid && styles.invalid, className)}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedById}
        {...rest}
      />
      {(hint || error) && (
        <div className={styles.footer}>
          {error ? (
            <span id={`${inputId}-error`} className={styles.error}>
              {error}
            </span>
          ) : (
            <span id={`${inputId}-hint`} className={styles.hint}>
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
});
