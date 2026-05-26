"use client";

import { type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { DETAILS_MAX_LENGTH, STRENGTHS_MAX_LENGTH } from "@/lib/constants";
import { markers } from "@/lib/markers";
import type { LetterInput } from "@/lib/types";
import styles from "./LetterForm.module.css";

interface LetterFormProps {
  values: LetterInput;
  onChange: (next: LetterInput) => void;
  onSubmit: () => void;
  status: "idle" | "loading" | "ready" | "error";
}

const m = markers.newLetter.form;

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
    <form className={styles.form} onSubmit={handleSubmit} noValidate {...m.nodeProps}>
      <div className={styles.row}>
        <Input
          label="Job title"
          value={values.jobTitle}
          onChange={handleField("jobTitle")}
          placeholder="Product manager"
          autoComplete="organization-title"
          required
          disabled={isLoading}
          {...m.jobTitle.nodeProps}
        />
        <Input
          label="Company"
          value={values.company}
          onChange={handleField("company")}
          placeholder="Apple"
          autoComplete="organization"
          required
          disabled={isLoading}
          {...m.company.nodeProps}
        />
      </div>
      <Input
        label="I am good at…"
        value={values.strengths}
        onChange={handleField("strengths")}
        placeholder="HTML, CSS and doing things in time"
        maxLength={STRENGTHS_MAX_LENGTH}
        disabled={isLoading}
        {...m.strengths.nodeProps}
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
        {...m.details.nodeProps}
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
            {...m.submit.nodeProps}
          >
            Try Again
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={!canSubmit}
            {...m.submit.nodeProps}
          >
            {isLoading ? "" : "Generate Now"}
          </Button>
        )}
      </div>
    </form>
  );
}
