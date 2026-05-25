"use client";

import { type FormEvent } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import {
  DETAILS_MAX_LENGTH,
  STRENGTHS_MAX_LENGTH,
} from "@/lib/constants";
import type { LetterInput } from "@/lib/types";
import styles from "./LetterForm.module.css";

interface LetterFormProps {
  values: LetterInput;
  onChange: (next: LetterInput) => void;
  onSubmit: () => void;
  status: "idle" | "loading" | "ready" | "error";
}

/**
 * Controlled form for cover-letter inputs.
 *
 * Submit button modes:
 *   idle / error → primary "Generate" with sparkle icon
 *   loading      → primary spinner, disabled
 *   ready        → secondary "Try Again" with refresh icon
 *
 * Validation is intentionally minimal: only Job title + Company are required.
 */
export function LetterForm({ values, onChange, onSubmit, status }: LetterFormProps) {
  const isLoading = status === "loading";
  const isReady = status === "ready";

  const handleField =
    <K extends keyof LetterInput>(key: K) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...values, [key]: event.target.value });
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const canSubmit =
    values.jobTitle.trim().length > 0 && values.company.trim().length > 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <Input
          label="Job title"
          value={values.jobTitle}
          onChange={handleField("jobTitle")}
          placeholder="Product manager"
          autoComplete="organization-title"
          required
          disabled={isLoading}
        />
        <Input
          label="Company"
          value={values.company}
          onChange={handleField("company")}
          placeholder="Apple"
          autoComplete="organization"
          required
          disabled={isLoading}
        />
      </div>
      <Input
        label="I am good at…"
        value={values.strengths}
        onChange={handleField("strengths")}
        placeholder="HTML, CSS and doing things in time"
        maxLength={STRENGTHS_MAX_LENGTH}
        disabled={isLoading}
      />
      <Textarea
        label="Additional details"
        value={values.details}
        onChange={handleField("details")}
        placeholder="Anything about you the model should weave in — recent projects, motivation, tone you want, etc."
        maxLength={DETAILS_MAX_LENGTH}
        showCounter
        rows={6}
        disabled={isLoading}
      />
      <div className={styles.actions}>
        {isReady ? (
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            fullWidth
            leadingIcon={<RefreshCw size={18} />}
            disabled={!canSubmit}
          >
            Try Again
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isLoading}
            leadingIcon={<Sparkles size={18} />}
            disabled={!canSubmit}
          >
            {isLoading ? "" : "Generate"}
          </Button>
        )}
      </div>
    </form>
  );
}
