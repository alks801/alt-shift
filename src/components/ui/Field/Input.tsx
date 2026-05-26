import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Field.module.css";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={cx(styles.control, styles.input, className)}
        {...rest}
      />
    </div>
  );
});
