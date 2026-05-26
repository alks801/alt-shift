"use client";

import { type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { DETAILS_MAX_LENGTH, STRENGTHS_MAX_LENGTH } from "@/lib/constants";
import type { LetterInput } from "@/lib/types";
import styles from "./LetterForm.module.css";

interface LetterFormProps {
  values: LetterInput;
  onChange: (next: LetterInput) => void;
  onSubmit: () => void;
  status: "idle" | "loading" | "ready" | "error";
}

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

  const detailsOverLimit = values.details.length > DETAILS_MAX_LENGTH;
  const hasRequired = values.jobTitle.trim().length > 0 && values.company.trim().length > 0;
  const canSubmit = hasRequired && !detailsOverLimit;

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
        placeholder="Describe why you are a great fit or paste your bio"
        softMaxLength={DETAILS_MAX_LENGTH}
        showCounter
        grow
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
            leadingIcon={<Icon name="repeat" />}
            disabled={!canSubmit}
          >
            Try Again
          </Button>
        ) : (
          <Button type="submit" size="lg" fullWidth loading={isLoading} disabled={!canSubmit}>
            {isLoading ? "" : "Generate Now"}
          </Button>
        )}
      </div>
    </form>
  );
}
